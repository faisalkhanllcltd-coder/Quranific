import fs from 'fs';

const tomlPath = 'C:\\Users\\pak\\AppData\\Roaming\\xdg.config\\.wrangler\\config\\default.toml';
if (fs.existsSync(tomlPath)) {
  const content = fs.readFileSync(tomlPath, 'utf8');
  const tokenMatch = content.match(/oauth_token\s*=\s*"([^"]+)"/);
  if (tokenMatch) {
    const token = tokenMatch[1];
    const accId = 'a4fa216703f27e36d764375a879e75c4';
    try {
      const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accId}/workers/subdomain`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      console.log('Subdomain API response:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Fetch error:', e.message);
    }
  } else {
    console.log('No oauth_token found in default.toml');
  }
} else {
  console.log('default.toml does not exist');
}
