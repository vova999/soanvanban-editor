// Runs the stable release's build targets sequentially to limit peak memory.
import { spawnSync } from 'node:child_process';
import { cpSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const here=resolve(fileURLToPath(new URL('.',import.meta.url)));
const root=resolve(process.env.EURO_SOURCE_ROOT || here+'/source');
const env={...process.env,PRODUCT_VERSION:'9.3.4',BUILD_NUMBER:'1',THEME:'soanvanban',BUILD_ROOT:resolve(process.env.EURO_BUILD_ROOT || here+'/built'),NODE_ENV:'production',WATCH:'0',NODE_OPTIONS:'--max-old-space-size=1536'};
function run(args,cwd=root+'/build',command=process.execPath){
 console.log('Building',args.join(' '));
 const result=spawnSync(command,args,{cwd,env,stdio:'inherit'});
 if(result.status!==0)throw new Error('Build failed: '+args.join(' '));
}
run([fileURLToPath(new URL('./verify-background-only.mjs',import.meta.url)),root+'/apps/common/main/lib/controller/Plugins.js'],root+'/build');
run(['merge_and_check.py'],root+'/translation',process.env.PYTHON || 'python3');
run(['scripts/verify-replacements.mjs']);
for(const name of ['deploy-sprites','deploy-common','deploy-html','deploy-reporter','deploy-embed'])run(['scripts/'+name+'.js']);
for(const name of ['documenteditor','spreadsheeteditor','presentationeditor','visioeditor','pdfeditor','forms'])run(['node_modules/webpack-cli/bin/cli.js','--config','webpack.'+name+'.mjs']);
for(const editor of ['word','cell','slide','visio']){
 env.TARGET_EDITOR=editor;run(['build/build.js'],root+'/vendor/framework7-react');
}
delete env.TARGET_EDITOR;
for(const name of ['deploy-mobile','deploy-resources','deploy-theme-images','inline-svgs'])run(['scripts/'+name+'.js']);
for(const name of ['verify-bundles','verify-deploy','verify-browser-target'])run(['scripts/'+name+'.mjs']);

run([fileURLToPath(new URL('./verify-locales.mjs',import.meta.url))],root+'/build');

// Prepare static VI/EN copy after the pinned build; no image or archive is published.
run([fileURLToPath(new URL('./prepare-copy.mjs',import.meta.url)),env.BUILD_ROOT+'/web-apps',env.BUILD_ROOT+'/branding-overlay'],here);
cpSync(env.BUILD_ROOT+'/branding-overlay/apps',env.BUILD_ROOT+'/web-apps/apps',{recursive:true});
