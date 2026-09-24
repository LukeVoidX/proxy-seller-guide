import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pages = [
  { path: 'index.html', lang: 'en', terms: ['static residential IP', 'ISP proxy', 'LUKE25', 'LUKEFANS'] },
  { path: 'zh/index.html', lang: 'zh-CN', terms: ['静态住宅IP', 'ISP代理', 'LUKE25', 'LUKEFANS'] },
];

const failures = [];

for (const page of pages) {
  const html = await readFile(resolve(root, page.path), 'utf8');
  for (const term of page.terms) {
    if (!html.includes(term)) failures.push(`${page.path}: missing required term ${term}`);
  }
  if (!html.includes(`<html lang="${page.lang}">`)) failures.push(`${page.path}: incorrect lang`);
  if (!html.includes('rel="canonical"')) failures.push(`${page.path}: missing canonical`);
  if (!html.includes('hreflang="zh-CN"') || !html.includes('hreflang="en"')) failures.push(`${page.path}: missing hreflang pair`);

  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (scripts.length !== 2) failures.push(`${page.path}: expected two JSON-LD blocks`);
  for (const [, source] of scripts) {
    try { JSON.parse(source); } catch (error) { failures.push(`${page.path}: invalid JSON-LD: ${error.message}`); }
  }

  for (const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const target = match[1];
    if (/^(https?:|mailto:)/.test(target)) continue;
    const destination = resolve(root, page.path === 'index.html' ? '.' : 'zh', target);
    const normalized = target.endsWith('/') ? resolve(destination, 'index.html') : destination;
    try { await access(normalized); } catch { failures.push(`${page.path}: broken local reference ${target}`); }
  }
}

const readme = await readFile(resolve(root, 'README.md'), 'utf8');
for (const term of ['静态住宅IP', 'ISP代理', '住宅代理', 'LUKE25', 'LUKEFANS']) {
  if (!readme.includes(term)) failures.push(`README.md: missing required term ${term}`);
}

const englishReadme = await readFile(resolve(root, 'README.en.md'), 'utf8');
const normalizedEnglishReadme = englishReadme.toLowerCase();
for (const term of ['static residential IP', 'ISP proxy', 'residential proxy', 'LUKE25', 'LUKEFANS']) {
  if (!normalizedEnglishReadme.includes(term.toLowerCase())) failures.push(`README.en.md: missing required term ${term}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('Static pages, local references, JSON-LD, language metadata, and required search terms passed.');
