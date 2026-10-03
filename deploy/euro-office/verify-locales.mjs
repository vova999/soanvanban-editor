import {readdirSync,readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(process.env.EURO_BUILD_ROOT || process.env.BUILD_ROOT || 'hosting-staging/euro-office/built');
let checked=0;
for(const editor of ['documenteditor','spreadsheeteditor','presentationeditor','pdfeditor','visioeditor']){
 const dir=join(root,'web-apps/apps',editor,'main/locale');
 const english=JSON.parse(readFileSync(join(dir,'en.json'),'utf8'));
 for(const name of readdirSync(dir).filter(n=>n.endsWith('.json'))){
  const locale=JSON.parse(readFileSync(join(dir,name),'utf8'));
  for(const [key,value] of Object.entries(english)){
   if(!key.startsWith('del_'))assert.ok(locale[key]!==undefined,`${editor}/${name} missing ${key}`);
  }
  checked++;
 }
}
console.log(`Validated English fallback keys in ${checked} desktop locale files.`);
