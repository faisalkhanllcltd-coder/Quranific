param([ValidateSet('Static','Live')][string]$Mode='Static',[string]$Branch='staging/security-and-arch-fixes')
$script:fail = 0
function Chk([string]$n,[bool]$ok,[string]$info='') { if ($ok) { "PASS  $n" } else { "FAIL  $n  $info"; $script:fail++ } }
function Cnt([string[]]$a) { @(& git grep @a 2>$null).Count }
function Code([string]$u) { "$(curl.exe -s -o NUL -w '%{http_code}' $u)" }
function CodeL([string]$u) { "$(curl.exe -s -L -o NUL -w '%{http_code}' $u)" }
function CodePost([string]$u) { "$(curl.exe -s -o NUL -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' $u)" }
function K([string]$s) { if ($s -match 'Done') {'Done'} elseif ($s -match 'Still Open') {'Open'} elseif ($s -match 'Obsolete|Merged') {'Excl'} else {'Owner'} }
function Sec([string[]]$extra) {
  $o = (& npx wrangler secret list --format json @extra 2>&1 | Out-String)
  if ($o -match '(?s)(\[.*\])') { try { return @(($Matches[1] | ConvertFrom-Json) | ForEach-Object { $_.name }) } catch { return @() } }
  return @()
}
if ($Mode -eq 'Static') {
  Chk "on $Branch" ((git branch --show-current) -eq $Branch)
  Chk 'tree clean' ([string]::IsNullOrEmpty((git status --porcelain)))
  $zero = @(
    @('#1 no placeholder-32b', @('-nF','placeholder-32b','--',':(exclude)PENDING-TASKS.md',':(exclude)scripts/final-check.ps1')),
    @('#2 no Meta CAPI/graph.facebook', @('-nE','graph\.facebook|META_CAPI|fbq','--','src','public')),
    @('#3 no unsafe-eval in CSP', @('-nF','unsafe-eval','--','public/_headers','src/middleware.ts')),
    @('#5 no 447477', @('-nF','447477','--','src')),
    @('#6 no legacy SITE.email', @('-nE','^\s*email\s*:','--','src/constants/site.ts')),
    @('#8 no admin@quranific.com in src', @('-nF','admin@quranific.com','--','src')),
    @('#22 no UNSUBSCRIBED:NEWSLETTER', @('-nF','UNSUBSCRIBED:NEWSLETTER','--','src')),
    @('#31 no stale must-match phrase', @('-nF','must match the main site','--','DEPLOYMENT.md')),
    @('#33 no System Crash', @('-nF','System Crash','--','src/pages/api/newsletter.ts')),
    @('env: no META_* in .env.example', @('-nE','META_PIXEL_ID|META_CAPI','--','.env.example')),
    @('docs: no Cloudflare Pages wording', @('-n','-i','Cloudflare Pages','--','README.md','DEPLOYMENT.md','.env.example')),
    @('docs: no wrangler pages command', @('-nF','wrangler pages','--','package.json','README.md','DEPLOYMENT.md'))
  )
  foreach ($z in $zero) { Chk $z[0] ((Cnt $z[1]) -eq 0) }
  $has = @(
    @('#4 CourseHero SITE.whatsappLink', @('-nF','SITE.whatsappLink','--','src/pages/courses/_components/CourseHero.astro')),
    @('#7 mailboxes in site.ts', @('-nE','support@|compliance@|contact@|faisalkhan\.llc\.ltd@gmail\.com','--','src/constants/site.ts')),
    @('#9 deploy:alarm script', @('-nF','"deploy:alarm"','--','package.json')),
    @('#10 deploy:prod script', @('-nF','"deploy:prod"','--','package.json')),
    @('#12 retry-queue timingSafeEqual', @('-nF','timingSafeEqual','--','src/pages/api/internal/retry-queue.ts')),
    @('#13 alarm-worker timingSafeEqual', @('-nF','timingSafeEqual','--','alarm-worker/src/index.ts')),
    @('#14 quranific-container utility', @('-nF','@utility quranific-container','--','src/styles/global.css')),
    @('#16 blog tag min length', @('-nF','t.length >= 3','--','src/pages/blog/[slug].astro')),
    @('#17 blog whole-word match', @('-nF','\b${escapeRegex','--','src/pages/blog/[slug].astro')),
    @('#19 newsletter verifyTurnstile', @('-nF','verifyTurnstile','--','src/pages/api/newsletter.ts')),
    @('#20 confirm prerender=false', @('-nF','prerender = false','--','src/pages/api/newsletter/confirm.ts')),
    @('#21 unsubscribe prerender=false', @('-nF','prerender = false','--','src/pages/api/newsletter/unsubscribe.ts')),
    @('#23 footer Check your inbox', @('-nF',"btn.innerText = 'Check your inbox';",'--','src/components/global/Footer.astro')),
    @('#25 RFC 8058 header', @('-nF','List-Unsubscribe-Post','--','src/lib/email.ts')),
    @('#26 generate_lead event', @('-nF','generate_lead','--','src/pages/getting-started/_components/CompleteForm.svelte')),
    @('#27 GTM hostname guard', @('-nF',"window.location.hostname === 'quranific.com'",'--','src/layouts/Base.astro')),
    @('#30 INTERNAL_WORKER_SECRET documented', @('-nF','INTERNAL_WORKER_SECRET','--','DEPLOYMENT.md')),
    @('#35 ensureSubscribed defined', @('-nF','export async function ensureSubscribed','--','src/lib/resend-contacts.ts')),
    @('#36 RESEND_AUDIENCE_ID in .env.example', @('-nF','RESEND_AUDIENCE_ID','--','.env.example')),
    @('env: ALARM_ADMIN_TOKEN in .env.example', @('-nF','ALARM_ADMIN_TOKEN','--','.env.example')),
    @('retry-queue handles FAILED_NEWSLETTER:', @('-nF',"startsWith('FAILED_NEWSLETTER:')",'--','src/pages/api/internal/retry-queue.ts'))
  )
  foreach ($h in $has) { Chk $h[0] ((Cnt $h[1]) -ge 1) }
  Chk '#15 container class defined once' ((Cnt @('-nF','max-w-7xl mx-auto px-4 sm:px-6 lg:px-8','--','src')) -eq 1)
  $s1 = ((git grep -nF 'const consentKey' -- src/pages/api/newsletter/confirm.ts) | Select-Object -First 1) -split ':'
  $s2 = ((git grep -nF 'subResult = await ensureSubscribed' -- src/pages/api/newsletter/confirm.ts) | Select-Object -First 1) -split ':'
  $c = 0; $e = 0; if ($s1.Count -gt 1) { $c = [int]$s1[1] }; if ($s2.Count -gt 1) { $e = [int]$s2[1] }
  Chk 'confirm.ts writes consent before ensureSubscribed' (($c -gt 0) -and ($e -gt $c)) "consent@$c ensure@$e"
  $t1 = (npx tsx tests/newsletter-token.test.ts 2>&1 | Out-String); Chk 'unit: newsletter-token 14/14' ($t1 -match '14 passed, 0 failed')
  $t2 = (npx tsx tests/consent-unit.test.ts 2>&1 | Out-String); Chk 'unit: consent 19/19' ($t2 -match '19 passed, 0 failed')
  $sc = (npx svelte-check 2>&1 | Out-String); Chk 'svelte-check 0 errors' ($sc -match 'found 0 errors')
  $rs = Sec @(); $as = Sec @('-c','alarm-worker/wrangler.toml')
  foreach ($n in 'RESEND_API_KEY','JWT_SECRET','INTERNAL_WORKER_SECRET') { Chk "root secret $n" ($rs -contains $n) }
  Chk 'root secret TURNSTILE' (($rs -contains 'TURNSTILE_SECRET_KEY') -or ($rs -contains 'TURNSTILE_SECRET'))
  foreach ($n in 'INTERNAL_WORKER_SECRET','ALARM_ADMIN_TOKEN') { Chk "alarm secret $n" ($as -contains $n) }
  $oa = Get-Content owner-actions.md
  $m = @{}; $d = @{}; $cur = $null
  foreach ($l in $oa) {
    if ($l -match '^\|\s*\*\*(OA-\d+)\*\*\s*\|') { $id = $Matches[1]; $cc = $l.Split('|') | ForEach-Object { $_.Trim() }; $m[$id] = @{ u = $cc[3]; s = $cc[4] } }
    if ($l -match '^###\s+(OA-\d+)\b') { $cur = $Matches[1]; continue }
    if ($cur -and -not $d.ContainsKey($cur) -and $l -match '^\-\s+\*\*Status:\*\*\s*(.+)$') { $d[$cur] = $Matches[1] }
  }
  $bad = @(); foreach ($k in $d.Keys) { if ($m.ContainsKey($k) -and ((K $m[$k].s) -ne (K $d[$k]))) { $bad += "$k matrix='$($m[$k].s)' detail='$($d[$k])'" } }
  Chk 'owner-actions: matrix and detail statuses agree' ($bad.Count -eq 0) ($bad -join '; ')
  $act = @($m.Values | Where-Object { $_.u -notmatch 'N/A' })
  $tot = $act.Count; $dn = @($act | Where-Object { (K $_.s) -eq 'Done' }).Count; $op = @($act | Where-Object { (K $_.s) -eq 'Open' }).Count; $ow = $tot - $dn - $op
  $row = ($oa | Select-String 'Total Actionable Items' | Select-Object -First 1).Line
  $nums = @([regex]::Matches($row,'\*\*(\d+)\*\*') | ForEach-Object { [int]$_.Groups[1].Value })
  Chk 'owner-actions: dashboard totals match matrix' (($nums -join ',') -eq "$tot,$dn,$op,$ow") "dashboard=$($nums -join ',') computed=$tot,$dn,$op,$ow"
  $pt = Get-Content PENDING-TASKS.md -Raw
  $cited = @([regex]::Matches($pt,'OA-\d+') | ForEach-Object { $_.Value } | Sort-Object -Unique)
  $missing = @($cited | Where-Object { -not $m.ContainsKey($_) })
  Chk 'PENDING-TASKS cites only existing OA ids' ($missing.Count -eq 0) ($missing -join ',')
}
if ($Mode -eq 'Live') {
  Chk 'main equals origin/main' ((git rev-parse HEAD) -eq (git rev-parse origin/main))
  $u = 'https://quranific.com'
  foreach ($p in '/','/courses','/faq','/tuition-fee','/legal/impressum','/legal/refund','/quran-classes/for-adults','/quran-teacher/for-kids','/api/consent-bucket','/api/geo-currency') { Chk "GET $p = 200" ((CodeL "$u$p") -eq '200') }
  Chk 'www -> 301' ((Code 'https://www.quranific.com/') -eq '301')
  Chk 'retry-queue without auth -> 401' ((CodePost "$u/api/internal/retry-queue") -eq '401')
  Chk 'newsletter confirm without token -> 400' ((Code "$u/api/newsletter/confirm") -eq '400')
  Chk 'alarm workers.dev -> 404' ((Code 'https://quranific-alarm.faisalkhan-llc-ltd.workers.dev') -eq '404')
  Chk 'root workers.dev -> 404' ((Code 'https://quranific.faisalkhan-llc-ltd.workers.dev') -eq '404')
  foreach ($p in '/','/courses/') { $h = (curl.exe -sI "$u$p" | Out-String); Chk "headers $p : CSP present, no unsafe-eval, HSTS" (($h -match '(?i)content-security-policy') -and ($h -notmatch 'unsafe-eval') -and ($h -match '(?i)strict-transport-security')) }
  $o = (curl.exe -sI -H 'Origin: https://evil.example' "$u/api/consent-bucket" | Out-String)
  Chk 'CORS locked' ($o -notmatch '(?i)access-control-allow-origin:\s*(\*|https://evil)')
  $r = Invoke-RestMethod 'https://dns.google/resolve?name=quranific.com&type=A'
  Chk 'DNSSEC valid (Status 0, AD true)' (($r.Status -eq 0) -and ($r.AD -eq $true))
  $imp = (curl.exe -s "$u/legal/impressum" | Out-String)
  if ($imp -match 'email-protection|cdn-cgi/l/email') { 'WARN  Email Address Obfuscation is ON (turn off in Cloudflare Scrape Shield)' } else { 'PASS  Email Address Obfuscation OFF' }
}
'----'
"FAILS: $script:fail"
