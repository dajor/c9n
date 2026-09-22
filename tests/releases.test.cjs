const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync('docs/releases.js','utf8');
async function run(payload, fail=false, lang='de') {
 const elements=Object.fromEntries(['.release-badge','[data-release-status]','[data-release-notes]','[data-release-zip]','[data-release-checksum]','[data-release-shell]'].map(k=>[k,{href:'original',textContent:'0.1.0-alpha.1',hidden:false}]));
 const card={dataset:{bundledVersion:'0.1.0-alpha.1'},querySelector:k=>elements[k]};
 vm.runInNewContext(source,{document:{documentElement:{lang},querySelector:()=>card},AbortController,setTimeout,clearTimeout,fetch:async()=>{if(fail)throw Error();return {ok:true,json:async()=>payload};}});
 await new Promise(resolve=>setImmediate(resolve));return elements;
}
const release={tag_name:'v0.2.0',published_at:'2026-09-22',prerelease:false,assets:[{name:'c9n-installer-0.2.0.zip',browser_download_url:'https://github.com/dajor/c9n/releases/download/v0.2.0/c9n-installer-0.2.0.zip'}]};
test('latest release updates badge, notes and matching download; hides stale assets',async()=>{const e=await run([release,{...release,tag_name:'v0.1.1',published_at:'2026-09-20'}]);assert.equal(e['.release-badge'].textContent,'0.2.0');assert.match(e['[data-release-notes]'].href,/v0.2.0$/);assert.match(e['[data-release-zip]'].href,/0.2.0.zip$/);assert.equal(e['[data-release-shell]'].hidden,true);assert.equal(e['[data-release-checksum]'].hidden,true);});
test('network failure preserves known links and explains stale status',async()=>{const e=await run(null,true);assert.equal(e['[data-release-notes]'].href,'original');assert.match(e['[data-release-status]'].textContent,/Live-Abfrage/);});
test('empty or malformed response keeps known release',async()=>{for(const input of [[],{},[{...release,draft:true}]]){const e=await run(input);assert.equal(e['.release-badge'].textContent,'0.1.0-alpha.1');assert.match(e['[data-release-status]'].textContent,/Live-Abfrage/);}});
test('English prerelease is explicitly labelled',async()=>{const e=await run([{...release,prerelease:true}],false,'en');assert.equal(e['.release-badge'].textContent,'0.2.0 · Preview');});
