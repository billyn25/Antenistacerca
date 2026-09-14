import fs from 'node:fs';
import path from 'node:path';

const ROOT='public';
const ASSETS=path.join(ROOT,'assets');
const HEAVY=new Set(['/assets/hero-antennista.png','/assets/cobertura-movil.png','/assets/parabolica.jpeg']);

function pngSize(buf){if(buf.length<24||buf.toString('ascii',1,4)!=='PNG')return null;return{width:buf.readUInt32BE(16),height:buf.readUInt32BE(20)}}
function jpegSize(buf){if(buf.length<4||buf[0]!==0xff||buf[1]!==0xd8)return null;let i=2;while(i<buf.length){if(buf[i]!==0xff){i++;continue}const m=buf[i+1];if(m===0xd8||m===0xd9){i+=2;continue}if(i+3>=buf.length)break;const len=buf.readUInt16BE(i+2);if(len<2)break;if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(m))return{height:buf.readUInt16BE(i+5),width:buf.readUInt16BE(i+7)};i+=2+len}return null}
function imageSize(file){try{const b=fs.readFileSync(file);return pngSize(b)||jpegSize(b)}catch{return null}}
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)])}
const cache=new Map();function dimensions(src){if(src.startsWith('/assets/')){const rel=src.slice(8).split(/[?#]/)[0];if(!cache.has(rel))cache.set(rel,imageSize(path.join(ASSETS,rel)));return cache.get(rel)}if(src.includes('images.pexels.com/'))return{width:1200,height:800};if(src.includes('images.unsplash.com/'))return{width:1600,height:1000};return null}
function setAttr(tag,name,value){const re=new RegExp(`\\s+${name}=["'][^"']*["']`,'i');return re.test(tag)?tag.replace(re,` ${name}="${value}"`):tag.replace(/<img\b/i,`<img ${name}="${value}"`)}
function cdn(src,w,q=80){return`/.netlify/images?url=${src}&amp;w=${w}&amp;q=${q}`}
function optimize(tag){const original=tag.match(/\bsrc=["']([^"']+)["']/i)?.[1];if(!original)return tag;let out=tag,d=dimensions(original);if(d){out=setAttr(out,'width',d.width);out=setAttr(out,'height',d.height)}out=setAttr(out,'decoding','async');const hero=original==='/assets/hero-antennista.png'||original==='/assets/hero-antennista.jpg';if(hero){out=setAttr(out,'loading','eager');out=setAttr(out,'fetchpriority','high')}else if(!/\bloading=["']eager["']/i.test(out))out=setAttr(out,'loading','lazy');
  if(HEAVY.has(original)){
    const widths=hero?[480,768,960,1280,1600]:[320,480,640,800,1000];
    const fallback=hero?1280:800;
    out=setAttr(out,'src',cdn(original,fallback,80));
    out=setAttr(out,'srcset',widths.map(w=>`${cdn(original,w,80)} ${w}w`).join(', '));
    out=setAttr(out,'sizes',hero?'(max-width: 900px) 100vw, 52vw':'(max-width: 640px) 50vw, (max-width: 900px) 50vw, 33vw');
  }
  return out;
}
if(!fs.existsSync(ROOT))throw new Error('image-metadata: falta public/');let changed=0,images=0,cdnImages=0;for(const file of walk(ROOT).filter(f=>f.endsWith('.html'))){const html=fs.readFileSync(file,'utf8');const next=html.replace(/<img\b[^>]*>/gi,tag=>{images++;const original=tag.match(/\bsrc=["']([^"']+)["']/i)?.[1];if(original&&HEAVY.has(original))cdnImages++;const n=optimize(tag);if(n!==tag)changed++;return n});if(next!==html)fs.writeFileSync(file,next)}console.log(`Imágenes revisadas: ${images}; etiquetas optimizadas: ${changed}; usos servidos por Image CDN: ${cdnImages}.`);
