import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const source=fs.readFileSync(process.argv[2], 'utf8');
const group={appendTo(){return this},append(){return this}};
const Common={Controllers:{},UI:{isRTL:()=>false},Utils:{lockControls(){}},enumLock:{}};
const context={Common,Backbone:{Controller:{extend:obj=>({prototype:obj})}},_:{extend:Object.assign},define:(_deps,fn)=>fn(),$:()=>group,console};
vm.runInNewContext(source,context);
const handler=Common.Controllers.Plugins.prototype.onResetPlugins;
for(const count of [1,2,0]){
 const control={customButtonsArr:[],appOptions:{},$toolbarPanelPlugins:{empty(){}},viewPlugins:{_state:{docProtection:{}},lockedControls:[]},created:0,shown:0,addBackgroundPluginsButton(g){this.created++;this.viewPlugins.backgroundBtn={show:()=>this.shown++,menu:{on(){}},on(){}};return g}};
 handler.call(control,{isEmpty:()=>count===0,each:fn=>Array.from({length:count},()=>({get:key=>key==='isBackgroundPlugin'})).forEach(fn)});
 assert.equal(control.created,count?1:0);assert.equal(control.shown,count?1:0);assert.equal(control.appOptions.canPlugins,count>0);
}
console.log('Background-only plugin menu regression checks passed (one, multiple, empty).');
