/** Apply the approved municipal presentation to Madrid districts only. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {transformHeader,validateLogo,LOGO} from '../header-brand.mjs';
import {transformHero,validateAsset,HERO} from '../hero-full-width.js';
import {madridDistricts} from '../src/madrid-districts.mjs';

export const VERSION='cerca-distritos-diseno-v1';
const marker=`data-ac-district-design="${VERSION}"`;
const cityRoute='/madrid/madrid/';
const allowed=new Set(madridDistricts.map(d=>d.route));
const stylesRE=/<style\b[^>]*>[\s\S]*?<\/style>|<link\b(?=[^>]*\brel\s*=\s*["']stylesheet["'])[^>]*>/gi;
const headerRE=/<header\b[^>]*>[\s\S]*?<\/header>/gi;
const heroRE=/<section\b[^>]*\bclass="hero(?:\s[^"]*)?"[^>]*>[\s\S]*?<\/section>/gi;
const one=(html,re,label)=>{const matches=[...html.matchAll(re)];assert.equal(matches.length,1,label);return matches[0][0];};
const head=html=>one(html,/<head\b[^>]*>[\s\S]*?<\/head>/gi,'Falta un head único');
export const styleTags=html=>[...head(html).matchAll(stylesRE)].map(m=>m[0]);
const hrefs=html=>[...html.matchAll(/\bhref=["']([^"']+)["']/gi)].map(m=>m[1]);
const imageTags=html=>[...html.matchAll(/<img\b[^>]*>/gi)].map(m=>m[0]);
const visible=html=>html.replace(/<style\b[^>]*>[\s\S]*?<\/style>|<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
const fileFor=(root,route)=>path.join(root,route.slice(1),'index.html');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');

export function assertDistrictDesign(html,city,route){
 assert.ok(allowed.has(route),'Solo se permiten los 21 distritos de Madrid: '+route);
 assert.ok(html.includes(marker),route+': falta versión de diseño');
 assert.deepEqual(styleTags(html),styleTags(city),route+': la cascada CSS difiere del municipio de referencia');
 const header=one(html,headerRE,route+': cabecera');
 assert.equal((header.match(/class="brand-logo"/g)||[]).length,1,route+': falta el logo aprobado');
 assert.ok(header.includes(`src="${LOGO}"`),route+': logo distinto');
 assert.ok(!header.includes('📡'),route+': sigue la marca antigua');
 const hero=one(html,heroRE,route+': hero');
 assert.ok(hero.includes('ac-hero-full'),route+': hero antiguo');
 assert.ok(imageTags(hero)[0]?.includes(HERO),route+': foto principal distinta de la aprobada');
 for(const css of ['shared-ui.css','town-enhancements.css','hero-panorama-v3.css','header-brand-v1.css'])assert.ok(head(html).includes('/assets/'+css),route+': falta '+css);
 return true;
}

export function upgradeDistrict(html,city,route){
 assert.ok(allowed.has(route),'No modificar municipios, provincias ni otras webs');
 if(html.includes(marker)){assertDistrictDesign(html,city,route);return html;}
 const original=html;
 const oldHeader=one(html,headerRE,route+': cabecera original');
 const oldHero=one(html,heroRE,route+': hero original');
 html=transformHero(transformHeader(html));
 // Reuse the exact current stylesheet cascade, not an independent district theme.
 const municipalStyles=styleTags(city);
 assert.ok(municipalStyles.length>=4,'CSS municipal incompleto');
 const oldHead=head(html);
 html=html.replace(oldHead,()=>oldHead.replace(stylesRE,'').replace(/<\/head>/i,()=>municipalStyles.join('\n')+'</head>'));
 assert.ok(/<body\b/i.test(html),'Falta body');
 html=html.replace(/<body\b/i,'<body '+marker);
 // Preserve metadata, JSON-LD, all existing links, footer, cookies and scripts.
 const unchangedRE=/<title\b[^>]*>[\s\S]*?<\/title>|<meta\b[^>]*>|<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>|<script\b[^>]*>[\s\S]*?<\/script>/gi;
 assert.deepEqual([...html.matchAll(unchangedRE)].map(m=>m[0]),[...original.matchAll(unchangedRE)].map(m=>m[0]),route+': cambio de metadatos o scripts');
 const body=h=>one(h,/<body\b[^>]*>[\s\S]*?<\/body>/gi,'Body único');
 assert.deepEqual(hrefs(body(html)),hrefs(body(original)),route+': enlaces modificados');
 const outside=h=>body(h).replace(headerRE,'').replace(heroRE,'').replace(' '+marker,'');
 assert.equal(outside(html),outside(original),route+': contenido fuera de cabecera/hero modificado');
 assert.equal(visible(one(html,heroRE,'Hero nuevo')),visible(oldHero),route+': texto hero modificado');
 const oldTagline=oldHeader.match(/<small\b[^>]*>[\s\S]*?<\/small>/)?.[0];
 if(oldTagline)assert.ok(one(html,headerRE,'Cabecera nueva').includes(oldTagline));
 assertDistrictDesign(html,city,route);
 return html;
}

export function applyDistrictDesign(root='public'){
 assert.equal(allowed.size,21,'Inventario de distritos incorrecto');
 validateLogo(path.join(root,LOGO.slice(1)));
 validateAsset(path.join(root,HERO.slice(1)));
 const cityFile=fileFor(root,cityRoute),city=fs.readFileSync(cityFile,'utf8');
 const targets=new Set(madridDistricts.map(d=>fileFor(root,d.route)));
 const allFiles=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?allFiles(path.join(dir,e.name)):[path.join(dir,e.name)]);
 const controls=new Map(allFiles(root).filter(file=>!targets.has(file)).map(file=>[file,sha(fs.readFileSync(file))]));
 const changes=madridDistricts.map(d=>{
  const file=fileFor(root,d.route),before=fs.readFileSync(file,'utf8'),after=upgradeDistrict(before,city,d.route);
  return {file,route:d.route,before,after};
 });
 // Do not write any district until all 21 pass validation.
 for(const item of changes)if(item.before!==item.after)fs.writeFileSync(item.file,item.after);
 for(const [file,digest] of controls)assert.equal(sha(fs.readFileSync(file)),digest,'Se alteró otro archivo: '+file);
 const report={version:VERSION,checkedAt:new Date().toISOString(),reference:cityRoute,districts:changes.map(x=>({route:x.route,changed:x.before!==x.after,ok:true})),otherFilesUnchanged:controls.size,metadataAndLinksPreserved:true,ok:true};
 fs.mkdirSync('.cache',{recursive:true});fs.writeFileSync('.cache/district-design-build.json',JSON.stringify(report,null,2));
 console.log(`DISEÑO CERCA OK: 21 distritos con logo, hero y CSS municipal actuales; ${controls.size} archivos ajenos intactos.`);
 return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)applyDistrictDesign();
