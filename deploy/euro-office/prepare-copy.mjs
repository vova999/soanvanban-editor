// Service copy overlay for a locally built, pinned editor. Never publishes or deploys.
// Modified 2026-10-03; preserve upstream source, notices and attribution.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import assert from 'node:assert/strict';

const [inputArg, outputArg] = process.argv.slice(2);
assert.ok(inputArg && outputArg, 'Usage: node prepare-copy.mjs INPUT OUTPUT');
const input = resolve(inputArg), output = resolve(outputArg);
assert.ok(input !== output && !input.startsWith(output + '/') && !output.startsWith(input + '/'), 'Output must be a separate local staging directory');
const prefix = 'apps/documenteditor/main/';
const changes = [];
function emit(file, text) {
  const target = resolve(output, prefix + file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, text);
  changes.push(prefix + file);
}

const key = 'DE.Controllers.Main.textNoLicenseTitle';
for (const [lang, expected, title] of [
  ['en', 'License limit reached', 'Soạn Văn Bản — editor limit reached'],
  ['vi', 'Phiên bản mã nguồn mở ONLYOFFICE', 'Soạn Văn Bản — giới hạn soạn thảo'],
]) {
  const data = JSON.parse(readFileSync(resolve(input, prefix + 'locale/' + lang + '.json'), 'utf8'));
  assert.equal(data[key], expected, 'Pinned locale changed; inspect before preparing copy');
  data[key] = title;
  emit('locale/' + lang + '.json', JSON.stringify(data, null, 2) + '\n');
}

const credit = '<p class="service-copy-notice">Soạn Văn Bản browser guide, adapted on 2026-10-03 from Euro-Office documentation based on ONLYOFFICE by Ascensio System SIA. Original technical content and this adaptation retain <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a> attribution. See <a href="https://soanvanban.com/about.html">About and licenses</a>.</p>';
for (const file of ['HelpfulHints/About.htm', 'HelpfulHints/Viewer.htm', 'ProgramInterface/ProgramInterface.htm']) {
  let html = readFileSync(resolve(input, prefix + 'resources/help/en/' + file), 'utf8');
  if (file.endsWith('About.htm')) {
    assert.match(html, /<span class="desktopDocumentFeatures">/);
    html = html.replace(/<span class="desktopDocumentFeatures">[\s\S]*?<\/span>/g, '');
    html = html.replace('<h1>About the Document Editor</h1>', '<h1>About the Soạn Văn Bản browser editor</h1>');
  } else if (file.endsWith('Viewer.htm')) {
    assert.match(html, /ONLYOFFICE Document Viewer/);
    html = html.replaceAll('ONLYOFFICE Document Viewer', 'Soạn Văn Bản document viewer');
  } else {
    assert.match(html, /The <b>Editor header<\/b> displays the ONLYOFFICE logo/);
    html = html.replace('The <b>Editor header</b> displays the ONLYOFFICE logo', 'The <b>Editor header</b> displays Soạn Văn Bản branding');
  }
  assert.match(html, /<\/body>/);
  html = html.replace('</body>', credit + '\n</body>');
  emit('resources/help/en/' + file, html);
}

writeFileSync(resolve(output, 'LOCAL-ONLY.json'), JSON.stringify({
  preparedOn: '2026-10-03', sourceDependent: true, deploymentAllowed: false,
  requiresMatchingEditorSourceOffer: true, files: changes,
}, null, 2) + '\n');
console.log('Prepared local-only locale/help overlay:', changes.length, 'files. No deployment or source publication.');
