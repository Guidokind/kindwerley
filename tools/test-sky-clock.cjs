const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../sky-clock.js','utf8');
function scene(zone,date,query=''){
 const c={window:{location:{search:query}},URLSearchParams,Intl:{DateTimeFormat:()=>({resolvedOptions:()=>({timeZone:zone})})}};
 vm.runInNewContext(source,c);return c.window.SkyClock.scene(new Date(date));
}
function label(s){return s.mix<.5?s.from:s.to;}
assert.equal(label(scene('America/Buenos_Aires','2026-11-03T20:00:00Z')),'day');
assert.equal(label(scene('America/Buenos_Aires','2026-11-04T03:00:00Z')),'night');
assert.equal(label(scene('Asia/Tokyo','2026-11-03T03:00:00Z')),'day');
assert.equal(label(scene('Asia/Tokyo','2026-11-03T15:00:00Z')),'night');
assert.equal(label(scene('Arctic/Longyearbyen','2026-06-21T22:00:00Z')),'day');
assert.equal(label(scene('Arctic/Longyearbyen','2026-12-21T11:00:00Z')),'night');
for(const z of ['America/New_York','Europe/London','Australia/Sydney','Unknown/Zone','UTC'])
 for(const day of ['2026-03-08','2026-11-01','2028-02-29'])
  for(let h=0;h<24;h++){
   const s=scene(z,day+'T'+String(h).padStart(2,'0')+':00:00Z');
   assert(Number.isFinite(s.mix)&&s.mix>=0&&s.mix<=1);
  }
assert.equal(label(scene('Asia/Tokyo','2026-11-03T03:00:00Z','?scene=night')),'night');
const inline=source.replace(/\/\*[\s\S]*?\*\//g,'').trim();
for(const path of ['index.html','es/index.html','pt/index.html','fr/index.html','it/index.html','privacy.html']){
 const html=fs.readFileSync(__dirname+'/../'+path,'utf8');
 assert.equal(html.match(/<script id="sky-clock">([\s\S]*?)<\/script>/)[1],inline);
 assert(html.includes('sky.js?v=20261103-4'));
 assert(!html.includes('var segments ='));
}
console.log('PASS: day/night, hemispheres, polar seasons, DST dates, leap day, fallback, previews and all six inline clocks');
