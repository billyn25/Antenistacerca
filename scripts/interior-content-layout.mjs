import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {sections} from './home-content-layout.mjs';
const CSS=`<style id="ac-interior-mobile">@media(max-width:640px){body[data-ac-interior] .ac-header a.brand.ac-brand-logo>img{width:128px!important}body[data-ac-interior] .ac-header a.brand.ac-brand-logo>small{font-size:9px!important}body[data-ac-interior] .ac-header-urgent{font-size:10px;padding:7px 8px}body[data-ac-interior][data-ac-mobile-release] .hero.ac-hero-full .hero-copy{padding:18px 16px 20px!important}body[data-ac-interior][data-ac-mobile-release] .hero.ac-hero-full h1{font-size:clamp(28px,7.8vw,34px)!important;line-height:1.08!important;margin:0 0 10px!important}body[data-ac-interior][data-ac-mobile-release] .hero.ac-hero-full .hero-copy>h2{font-size:16px!important;line-height:1.4!important;font-weight:400;margin:0 0 14px!important}body[data-ac-interior][data-ac-mobile-release] .hero .kicker{font-size:10px!important;margin:0 0 10px!important}body[data-ac-interior][data-ac-mobile-release] .hero .checks{display:flex;flex-wrap:wrap;gap:7px 12px}body[data-ac-interior][data-ac-mobile-release] .hero .checks li{display:flex;align-items:center;font-size:12px!important;line-height:1.4!important}body[data-ac-interior][data-ac-mobile-release] .hero .checks li::before{margin-right:0;width:15px!important;height:15px!important;min-width:15px!important;flex-basis:15px!important;font-size:10px!important;line-height:15px!important}}@media(max-width:359px){body[data-ac-interior] .ac-header a.brand.ac-brand-logo>img{width:110px!important}body[data-ac-interior] .ac-header-urgent{font-size:9px;padding:6px}}</style>`;
const protectedTags=h=>[...h.matchAll(/<h1\b[\s\S]*?<\/h1>|<img\b[^>]*>|<link\b[^>]*rel="canonical"[^>]*>|<meta\b[^>]*name="robots"[^>]*>/g)].map(x=>x[0]).sort();
export function interiorLayout(html){
 if(html.includes('data-ac-interior='))return html;
 const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);if(!main||html.includes('data-ac-home='))return html;
 const blocks=sections(main[1]);if(!blocks.length)return html;
 const isLocal=blocks.some(b=>/^<section class="hero/.test(b));
 const isProvince=blocks.some(b=>/^<section[^>]*class="alpha-localities"/.test(b));if(!isLocal&&!isProvince)return html;
 const before=protectedTags(html);
 const priority=b=>{
  const opening=b.match(/^<section[^>]*>/)[0],id=opening.match(/\bid="([^"]+)"/)?.[1];
  if(isProvince)return ({localidades:20,'frecuencias-provincia':30})[id]??10;
  if(/class="hero/.test(opening))return 0;
  const order={servicios:10,'problemas-frecuentes':20,reparacion:30,tdt:40,parabolicas:50,'tdt-satelite':60,'canales-tdt':70,porteros:80,'telefonia-movil':90,'reparaciones-electricas':100,'soluciones-profesionales':110,'preparar-aviso':140,faq:160,contacto:180,zona:200};
  if(id in order)return order[id];
  if(/class="local wrap"|class="band local-seo"/.test(opening))return 120;
  if(/local-faq/.test(opening))return 150;
  if(/town-trust/.test(opening))return 170;
  return 130;
 };
 let body=main[1];blocks.forEach((b,i)=>{body=body.replace(b,`<!--AC-SECTION-${i}-->`);});
 const ordered=blocks.map((b,i)=>({b,i})).sort((a,b)=>priority(a.b)-priority(b.b)||a.i-b.i);let n=0;
 body=body.replace(/<!--AC-SECTION-\d+-->/g,()=>ordered[n++].b);
 let output=html.replace(main[0],main[0].replace(main[1],body));
 if(isLocal)output=output.replace(/(<section class="hero[^\"]*"[\s\S]*?<h2>)[\s\S]*?(<\/h2>)/,'$1Instalación y reparación para viviendas, comunidades y negocios.$2').replace(/(<section class="hero[^\"]*"[\s\S]*?)<ul class="checks">[\s\S]*?<\/ul>/,'$1<ul class="checks"><li>Averías de señal</li><li>TDT y satélite</li><li>Porteros y videoporteros</li></ul>');
 output=output.replace(/<body\b/,'<body data-ac-interior="v1"').replace('</head>',CSS+'</head>');
 assert.deepEqual(protectedTags(output),before,'Título local, imágenes o metadatos alterados');
 const ids=h=>[...h.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]).sort();assert.deepEqual(ids(output).filter(x=>x!=='ac-interior-mobile'),ids(html),'Anclas alteradas');
 return output;
}
export function applyInteriorLayout(root='public'){
 let count=0;const walk=dir=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())walk(f);else if(e.name.endsWith('.html')){const h=fs.readFileSync(f,'utf8'),out=interiorLayout(h);if(h!==out){fs.writeFileSync(f,out);count++;}}}};walk(root);console.log('INTERIORES OK: '+count+' páginas; hero móvil compacto, servicios agrupados y zona al final.');return count;
}
