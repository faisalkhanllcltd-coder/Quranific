// tests/newsletter-token.test.ts
// Unit test for newsletter token derivation, signing, verification, and tamper rejection.
// Run with: node --experimental-strip-types tests/newsletter-token.test.ts
// No test framework dependency — plain assertions, exits 1 on failure.

import {
  generateNewsletterToken,
  verifyNewsletterToken,
  deriveNewsletterKey,
  createNewsletterConfirmUrl,
  createNewsletterUnsubscribeUrl,
} from '../src/lib/newsletter-token.ts';
import { SignJWT, decodeJwt } from 'jose';

const TEST_SECRET = 'test-secret-super-secure-key-for-unit-tests-2026';
const TEST_EMAIL = 'student@example.com';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('--- Newsletter Token Unit Tests ---\n');

  // 1. Valid confirm token generation & verification
  try {
    const token = await generateNewsletterToken(TEST_EMAIL, 'newsletter_confirm', TEST_SECRET);
    const result = await verifyNewsletterToken(token, 'newsletter_confirm', TEST_SECRET);
    assert(
      result.email === TEST_EMAIL && result.action === 'newsletter_confirm',
      'Confirm token verifies successfully with correct claims'
    );
  } catch (e) {
    assert(false, `Confirm token verification failed: ${e}`);
  }

  // 2. Valid unsubscribe token generation & verification
  try {
    const token = await generateNewsletterToken(TEST_EMAIL, 'newsletter_unsubscribe', TEST_SECRET);
    const result = await verifyNewsletterToken(token, 'newsletter_unsubscribe', TEST_SECRET);
    assert(
      result.email === TEST_EMAIL && result.action === 'newsletter_unsubscribe',
      'Unsubscribe token verifies successfully with correct claims'
    );
  } catch (e) {
    assert(false, `Unsubscribe token verification failed: ${e}`);
  }

  // 3. Expiration policy: Confirm token has 48h exp, Unsubscribe token has NO exp
  try {
    const confirmToken = await generateNewsletterToken(
      TEST_EMAIL,
      'newsletter_confirm',
      TEST_SECRET
    );
    const unsubsToken = await generateNewsletterToken(
      TEST_EMAIL,
      'newsletter_unsubscribe',
      TEST_SECRET
    );

    const confirmClaims = decodeJwt(confirmToken);
    const unsubsClaims = decodeJwt(unsubsToken);

    assert(
      typeof confirmClaims.exp === 'number' && typeof confirmClaims.iat === 'number',
      'Confirm token has exp claim set'
    );
    assert(
      unsubsClaims.exp === undefined,
      'Unsubscribe token has no exp claim (links never expire per legal best practice)'
    );
  } catch (e) {
    assert(false, `Token exp claim inspection failed: ${e}`);
  }

  // 4. Expired token rejection
  try {
    const derivedKey = await deriveNewsletterKey(TEST_SECRET);
    const expiredToken = await new SignJWT({ email: TEST_EMAIL, action: 'newsletter_confirm' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .sign(derivedKey);

    let threw = false;
    try {
      await verifyNewsletterToken(expiredToken, 'newsletter_confirm', TEST_SECRET);
    } catch {
      threw = true;
    }
    assert(threw, 'Expired confirm token is rejected');
  } catch (e) {
    assert(false, `Expired token test failed: ${e}`);
  }

  // 5. Key separation: token signed with raw secret cannot verify with derived key
  try {
    const rawSignedToken = await new SignJWT({ email: TEST_EMAIL, action: 'newsletter_confirm' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .sign(new TextEncoder().encode(TEST_SECRET));

    let threw = false;
    try {
      await verifyNewsletterToken(rawSignedToken, 'newsletter_confirm', TEST_SECRET);
    } catch {
      threw = true;
    }
    assert(threw, 'Key separation: token signed with raw JWT_SECRET is rejected by derived key');
  } catch (e) {
    assert(false, `Key separation test failed: ${e}`);
  }

  // 6. Key separation: different secrets produce incompatible keys
  try {
    const otherSecret = 'completely-different-secret-key-999';
    const token = await generateNewsletterToken(TEST_EMAIL, 'newsletter_confirm', TEST_SECRET);

    let threw = false;
    try {
      await verifyNewsletterToken(token, 'newsletter_confirm', otherSecret);
    } catch {
      threw = true;
    }
    assert(threw, 'Token signed with one secret cannot be verified by another secret');
  } catch (e) {
    assert(false, `Different secret rejection test failed: ${e}`);
  }

  // 7. Tamper rejection: modifying characters in token signature or payload fails
  try {
    const token = await generateNewsletterToken(TEST_EMAIL, 'newsletter_confirm', TEST_SECRET);
    const parts = token.split('.');
    // Tamper with payload (middle part)
    const tamperedPayload = parts[0] + '.' + parts[1].slice(0, -2) + 'aa.' + parts[2];

    let threw = false;
    try {
      await verifyNewsletterToken(tamperedPayload, 'newsletter_confirm', TEST_SECRET);
    } catch {
      threw = true;
    }
    assert(threw, 'Tampered token payload is rejected');
  } catch (e) {
    assert(false, `Tamper payload test failed: ${e}`);
  }

  // 8. Wrong action rejection: confirm token fails when verified as unsubscribe
  try {
    const confirmToken = await generateNewsletterToken(
      TEST_EMAIL,
      'newsletter_confirm',
      TEST_SECRET
    );

    let threw = false;
    try {
      await verifyNewsletterToken(confirmToken, 'newsletter_unsubscribe', TEST_SECRET);
    } catch {
      threw = true;
    }
    assert(threw, 'Confirm token fails when verified expecting newsletter_unsubscribe action');
  } catch (e) {
    assert(false, `Wrong action rejection test failed: ${e}`);
  }

  // 9. Wrong action rejection: unsubscribe token fails when verified as confirm
  try {
    const unsubsToken = await generateNewsletterToken(
      TEST_EMAIL,
      'newsletter_unsubscribe',
      TEST_SECRET
    );

    let threw = false;
    try {
      await verifyNewsletterToken(unsubsToken, 'newsletter_confirm', TEST_SECRET);
    } catch {
      threw = true;
    }
    assert(threw, 'Unsubscribe token fails when verified expecting newsletter_confirm action');
  } catch (e) {
    assert(false, `Wrong action rejection test failed: ${e}`);
  }

  // 10. Fail-closed on missing or empty secret
  try {
    let threwGenerate = false;
    try {
      await generateNewsletterToken(TEST_EMAIL, 'newsletter_confirm', '');
    } catch {
      threwGenerate = true;
    }
    assert(threwGenerate, 'Fail closed: generateNewsletterToken throws when JWT_SECRET is empty');

    let threwVerify = false;
    try {
      await verifyNewsletterToken('dummy.jwt.token', 'newsletter_confirm', '');
    } catch {
      threwVerify = true;
    }
    assert(threwVerify, 'Fail closed: verifyNewsletterToken throws when JWT_SECRET is empty');
  } catch (e) {
    assert(false, `Fail closed test failed: ${e}`);
  }

  // 11. URL generators contain valid query parameter with token
  try {
    const confirmUrl = await createNewsletterConfirmUrl(TEST_EMAIL, TEST_SECRET);
    const unsubsUrl = await createNewsletterUnsubscribeUrl(TEST_EMAIL, TEST_SECRET);

    assert(
      confirmUrl.startsWith('https://quranific.com/api/newsletter/confirm?token='),
      'createNewsletterConfirmUrl uses SITE.url and embeds confirm token'
    );
    assert(
      unsubsUrl.startsWith('https://quranific.com/api/newsletter/unsubscribe?token='),
      'createNewsletterUnsubscribeUrl uses SITE.url and embeds unsubscribe token'
    );
  } catch (e) {
    assert(false, `URL generator test failed: ${e}`);
  }

  console.log(
    `\nResults: ${passed} passed, ${failed} failed out of ${passed + failed} assertions.`
  );
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
