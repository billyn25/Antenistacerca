import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanNearbyRows,coordinates,distanceKm,keyOf,NEARBY_POLICY,selectNearby} from '../clean-nearby-links.mjs';

const source=JSON.parse(fs.readFileSync(new URL('../content/municipal-coordinates.json',import.meta.url),'utf8'));
const assignments=JSON.parse(fs.readFileSync(new URL('../content/tdt-areas.json',import.meta.url),'utf8')).municipalities;
const rows=Object.entries(coordinates).map(([key,point])=>{
  const [provinciaSlug,slug]=key.split('/');
  return {provinciaSlug,slug,localidad:point.officialName,cercanas:[]};
});
const byKey=new Map(rows.map(row=>[keyOf(row),row]));

test('las referencias IGN cubren exactamente las rutas municipales y sus códigos INE',()=>{
  assert.deepEqual(Object.keys(coordinates).sort(),Object.keys(assignments).sort());
  assert.equal(new Set(Object.values(coordinates).map(point=>point.ine)).size,rows.length);
  assert.equal(new URL(source.source.download).hostname,'www.ign.es');
  assert.match(source.source.sha256,/^[a-f0-9]{64}$/);
  for(const [key,point] of Object.entries(coordinates)){
    assert.equal(point.ine,assignments[key].ine,key);
    assert.ok(point.latitude>=35&&point.latitude<=44.5&&point.longitude>=-10&&point.longitude<=5,key);
  }
});

test('las páginas con antiguos enlaces lejanos ofrecen municipios geográficamente próximos',()=>{
  const expected={
    'zamora/puebla-de-sanabria':['robleda-cervantes','pedralba-de-la-praderia','galende','cobreros'],
    'leon/boca-de-huergano':['riano','prioro','buron','acebedo'],
    'zamora/porto':['pias','lubian','cobreros','requejo'],
    'leon/bonar':['vegaquemada','valdepielago','la-vecilla','la-ercina'],
    'asturias/llanes':['penamellera-alta','cabrales','penamellera-baja','ribadedeva'],
  };
  for(const [key,slugs] of Object.entries(expected)){
    const origin=byKey.get(key),nearby=selectNearby(origin,rows);
    assert.deepEqual(nearby.map(row=>row.slug),slugs,key);
    assert.ok(nearby.every(row=>distanceKm(coordinates[key],coordinates[keyOf(row)])<=NEARBY_POLICY.maxDistanceKm),key);
  }
});

test('la selección omite el propio municipio, otras provincias y lugares fuera del radio',()=>{
  const fixture=[
    {provinciaSlug:'a',slug:'origin',localidad:'Origen',cercanas:[]},
    {provinciaSlug:'a',slug:'near',localidad:'Cerca',cercanas:[]},
    {provinciaSlug:'a',slug:'far',localidad:'Lejos',cercanas:[]},
    {provinciaSlug:'b',slug:'border',localidad:'Otra provincia',cercanas:[]},
  ];
  const points={
    'a/origin':{latitude:43,longitude:-3},
    'a/near':{latitude:43.01,longitude:-3},
    'a/far':{latitude:42,longitude:-3},
    'b/border':{latitude:43.001,longitude:-3},
  };
  assert.deepEqual(selectNearby(fixture[0],fixture,points).map(keyOf),['a/near']);
  assert.equal(selectNearby(byKey.get('asturias/degana'),rows).length,3,'No se rellena un cuarto enlace lejano');
  assert.throws(()=>cleanNearbyRows(fixture,{}),/Falta referencia geográfica/);
  assert.throws(()=>cleanNearbyRows(fixture,{...points,'a/origin':{latitude:NaN,longitude:-3}}),/Coordenadas inválidas/);
});

test('se corrige solo la enumeración falsa y se conserva la información manual real',()=>{
  const origin=byKey.get('navarra/baztan');
  const names={
    'doneztebe-santesteban':'Doneztebe-Santesteban','bera':'Bera','lesaka':'Lesaka','pamplona-iruna':'Pamplona-Iruña',
  };
  const fixture=rows.map(row=>({...row,localidad:row.provinciaSlug==='navarra'?(names[row.slug]||row.localidad):row.localidad}));
  const row=fixture.find(row=>keyOf(row)===keyOf(origin));
  row.cercanas=['Doneztebe-Santesteban','Bera','Lesaka','Pamplona-Iruña'];
  row.zonaLocal='En Baztan atendemos municipios cercanos como Doneztebe-Santesteban, Bera, Lesaka y Pamplona-Iruña. Revisamos el cableado de la comunidad antes de cambiar equipos.';
  row.introLocal='Texto manual verificado que no debe cambiar.';
  row.descripcion='Descripción existente';
  const {rows:updated}=cleanNearbyRows(fixture);
  const result=updated.find(x=>keyOf(x)===keyOf(row));
  assert.ok(!result.zonaLocal.includes('Pamplona-Iruña'));
  assert.ok(result.zonaLocal.endsWith('Revisamos el cableado de la comunidad antes de cambiar equipos.'));
  assert.equal(result.introLocal,row.introLocal);
  assert.equal(result.descripcion,row.descripcion);
  assert.equal(row.cercanas.at(-1),'Pamplona-Iruña','La función no altera su entrada');
  const valid={...row,cercanas:['Doneztebe-Santesteban','Bera','Lesaka'],zonaLocal:'Municipios cercanos como Doneztebe-Santesteban, Bera y Lesaka. Texto manual.'};
  const check=cleanNearbyRows(fixture.map(x=>keyOf(x)===keyOf(valid)?valid:x));
  assert.equal(check.rows.find(x=>keyOf(x)===keyOf(valid)).zonaLocal,valid.zonaLocal,'Se conservan cercanías válidas fuera del top cuatro');
});

test('la limpieza es estable y mantiene la cobertura sin añadir datos de viaje al contenido',()=>{
  const first=cleanNearbyRows(rows),second=cleanNearbyRows(first.rows);
  assert.deepEqual(second.rows,first.rows);
  assert.equal(second.report.changed,0);
  assert.equal(first.rows.length,rows.length);
  assert.deepEqual(first.rows.map(keyOf),rows.map(keyOf));
  for(const row of first.rows){
    assert.ok(row.cercanas.length>0&&row.cercanas.length<=4,keyOf(row));
    assert.equal(row.cercanas.length,new Set(row.cercanas).size,keyOf(row));
    assert.equal(Object.hasOwn(row,'distanceKm'),false);
    assert.equal(Object.hasOwn(row,'travelTime'),false);
  }
});
