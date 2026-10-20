import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import {enrich,plan} from '../technical-content.mjs';
import {antennaModels,terrestrial,headends,satellite,satelliteTdt} from '../content/technical-diagnostics.mjs';
const towns=JSON.parse(fs.readFileSync('src/localidades.json','utf8'));
test('todos los diagnósticos y modelos se utilizan; selección estable y casos secundarios diferentes',()=>{
 const used=new Set();
 for(const d of towns){const p=plan(d);assert.deepEqual(plan(d),p);const cases=[p.tdt,p.amp,p.sat,...p.others];assert.equal(new Set(cases.map(c=>c.id)).size,6);for(const c of [...cases,p.model,p.tdtSat])used.add(c.id)}
 for(const c of [...antennaModels,...terrestrial,...headends,...satellite,...satelliteTdt])assert.ok(used.has(c.id),`Caso sin utilizar: ${c.id}`);
});
test('salida municipal completa; contacto territorial y originales visuales preservados por el transformador',()=>{
 for(const d of towns){
  const h=fs.readFileSync(`public/${d.provinciaSlug}/${d.slug}/index.html`,'utf8');
  assert.equal(h.split('data-technical-content="v1"').length-1,1,d.slug);
  assert.equal((h.match(/class="antenna-choice"/g)||[]).length,1,d.slug);
  assert.equal((h.match(/data-diagnostic=/g)||[]).length,3,d.slug);
  assert.ok(h.includes(plan(d).model.name),d.slug);
  const ids=[...h.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,d.slug);
  assert.throws(()=>enrich(h,d),/ya aplicado/);
 }
});
