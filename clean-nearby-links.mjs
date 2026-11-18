import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';

const snapshot=JSON.parse(fs.readFileSync(new URL('./content/municipal-coordinates.json',import.meta.url),'utf8'));
export const coordinates=snapshot.municipalities;
export const NEARBY_POLICY=Object.freeze({limit:4,maxDistanceKm:35});
export const keyOf=row=>`${row.provinciaSlug}/${row.slug}`;
const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const radians=degrees=>degrees*Math.PI/180;

// Selection only: no distances or travel times are added to the page or data.
export function distanceKm(a,b){
  const latA=radians(a.latitude),latB=radians(b.latitude);
  const latDelta=latB-latA,lonDelta=radians(b.longitude-a.longitude);
  const h=Math.min(1,Math.max(0,Math.sin(latDelta/2)**2+Math.cos(latA)*Math.cos(latB)*Math.sin(lonDelta/2)**2));
  return 6371.0088*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
}

function reference(row,points){
  const key=keyOf(row),point=points[key];
  assert.ok(point,`Falta referencia geográfica verificada: ${key}`);
  assert.ok(Number.isFinite(point.latitude)&&Number.isFinite(point.longitude)&&Math.abs(point.latitude)<=90&&Math.abs(point.longitude)<=180,`Coordenadas inválidas: ${key}`);
  return point;
}

export function selectNearby(row,candidates,points=coordinates,policy=NEARBY_POLICY){
  const origin=reference(row,points),key=keyOf(row);
  return candidates.filter(other=>other.provinciaSlug===row.provinciaSlug&&keyOf(other)!==key)
    .map(other=>({row:other,distance:distanceKm(origin,reference(other,points))}))
    .filter(other=>other.distance<=policy.maxDistanceKm)
    .sort((a,b)=>a.distance-b.distance||keyOf(a.row).localeCompare(keyOf(b.row),'es'))
    .slice(0,policy.limit).map(other=>other.row);
}

const joined=names=>names.length<2?names.join(''):`${names.slice(0,-1).join(', ')} y ${names.at(-1)}`;

// Preserve genuine manual geography even if another place is slightly nearer.
// Replace only exact old enumerations asserting proximity to a distant place.
export function synchronizeNearbyProse(row,nearby,byName,points=coordinates,policy=NEARBY_POLICY){
  const original=String(row.zonaLocal||''),previous=row.cercanas||[];
  if(previous.length<2||!/(?:cercan|proxim|alrededor|entorno)/.test(norm(original)))return original;
  const origin=reference(row,points);
  const hasDistant=previous.some(name=>{
    const other=byName.get(`${row.provinciaSlug}/${norm(name)}`);
    return !other||distanceKm(origin,reference(other,points))>policy.maxDistanceKm;
  });
  if(!hasDistant)return original;
  const formats=[joined(previous),previous.join(', ')].filter(Boolean);
  let result=original;
  for(const oldList of formats)if(result.includes(oldList)){
    result=result.replaceAll(oldList,joined(nearby.map(t=>t.localidad)));
    break;
  }
  return result;
}

export function cleanNearbyRows(rows,points=coordinates,policy=NEARBY_POLICY){
  assert.ok(Number.isInteger(policy.limit)&&policy.limit>0&&Number.isFinite(policy.maxDistanceKm)&&policy.maxDistanceKm>0,'Política de cercanía inválida');
  const byProvince=new Map(),byName=new Map(),seen=new Set();
  for(const row of rows){
    const key=keyOf(row);assert.ok(!seen.has(key),`Ruta duplicada: ${key}`);seen.add(key);reference(row,points);
    if(!byProvince.has(row.provinciaSlug))byProvince.set(row.provinciaSlug,[]);
    byProvince.get(row.provinciaSlug).push(row);
    byName.set(`${row.provinciaSlug}/${norm(row.localidad)}`,row);
  }
  let changed=0,proseChanged=0;
  const distribution={};
  const updated=rows.map(row=>{
    const nearby=selectNearby(row,byProvince.get(row.provinciaSlug),points,policy);
    const cercanas=nearby.map(t=>t.localidad);
    const zonaLocal=synchronizeNearbyProse(row,nearby,byName,points,policy);
    if(JSON.stringify(cercanas)!==JSON.stringify(row.cercanas||[]))changed++;
    if(zonaLocal!==String(row.zonaLocal||''))proseChanged++;
    distribution[cercanas.length]=(distribution[cercanas.length]||0)+1;
    return {...row,cercanas,...(Object.hasOwn(row,'zonaLocal')?{zonaLocal}:{})};
  });
  return {rows:updated,report:{municipalities:rows.length,changed,proseChanged,distribution,policy,source:snapshot.source.page,sourceReview:snapshot.source.workbookReviewDate}};
}

export function main(file='src/localidades.json'){
  const before=JSON.parse(fs.readFileSync(file,'utf8'));
  const {rows,report}=cleanNearbyRows(before);
  fs.writeFileSync(file,JSON.stringify(rows,null,2)+'\n');
  fs.mkdirSync('.cache',{recursive:true});
  fs.writeFileSync('.cache/nearby-links-report.json',JSON.stringify(report,null,2)+'\n');
  console.log(`ENLACES CERCANOS OK: ${report.municipalities} municipios con referencias verificadas; ${report.changed} listas actualizadas y ${report.proseChanged} enumeraciones de cercanía corregidas.`);
  return report;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main();
