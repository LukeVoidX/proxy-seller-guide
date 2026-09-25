const host = 'lukevoidx.github.io';
const key = '35a59773bb11fe044a44281181e6778a';
const keyLocation = `https://${host}/proxy-seller-guide/${key}.txt`;
const defaults = [
  `https://${host}/proxy-seller-guide/`,
  `https://${host}/proxy-seller-guide/zh/`,
];

const urls = process.argv.slice(2).length ? process.argv.slice(2) : defaults;

for (const url of urls) {
  const parsed = new URL(url);
  if (parsed.hostname !== host || !parsed.pathname.startsWith('/proxy-seller-guide/')) {
    throw new Error(`IndexNow URL must belong to the Proxy-Seller guide: ${url}`);
  }
}

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation, urlList: urls }),
});

if (![200, 202].includes(response.status)) {
  throw new Error(`IndexNow rejected the submission: HTTP ${response.status} ${await response.text()}`);
}

console.log(`IndexNow accepted ${urls.length} URL(s): HTTP ${response.status}`);
