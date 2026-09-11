import fs from 'node:fs';
import path from 'node:path';

const ROOT='public';
const ASSETS=path.join(ROOT,'assets');

function pngSize(buf){
  if(buf.length<24||buf.toString('ascii',1,4)!=='PNG') return null;
  return {width:buf.readUInt32BE(16),height:buf.readUInt32BE(20)};
}
function jpegSize(buf){
  if(buf.length<4||buf[0]!==0xff||buf[1]!==0xd8) return null;
  let i=2;
  while(i<buf.length){
    if(buf[i]!==0xff){i++;continue;}
    const marker=buf[i+1];
    if(marker===0xd8||marker===0xd9){i+=2;continue;}
    if(i+3>=buf.length) break;
    const len=buf.readUInt16BE(i+2);
    if(len<2) break;
    if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)){
      return {height:buf.readUInt16BE(i+5),width:buf.readUInt16BE(i+7)};
    }
    i+=2+len;
  }
  return null;
}
function imageSize(file){
  try{const buf=fs.readFileSync(file);return pngSize(buf)||jpegSize(buf);}catch{return null;}
}
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}

const sizeCache=new Map();
function localDimensions(src){
  if(!src.startsWith('/assets/')) return null;
  const rel=src.replace(/^\/assets\//,'').split(/[?#]/)[0];
  if(sizeCache.has(rel)) return sizeCache.get(rel);
  const dims=imageSize(path.join(ASSETS,rel));
  sizeCache.set(rel,dims);
  return dims;
}
function externalDimensions(src){
  if(src.includes('images.pexels.com/')) return {width:1200,height:800};
  if(src.includes('images.unsplash.com/')) return {width:1600,height:1000};
  return null;
}
function setAttr(tag,name,value){
  const re=new RegExp(`\\s+${name}=["'][^"']*["']`,'i');
  return re.test(tag)?tag.replace(re,` ${name}="${value}"`):tag.replace(/<img\b/i,`<img ${name}="${value}"`);
}
function enrichImg(tag){
  const src=tag.match(/\bsrc=["']([^"']+)["']/i)?.[1];
  if(!src) return tag;
  let out=tag;
  const dims=localDimensions(src)||externalDimensions(src);
  if(dims){out=setAttr(out,'width',dims.width);out=setAttr(out,'height',dims.height);}
  out=setAttr(out,'decoding','async');
  const hero=/\/assets\/hero-antennista\.(?:png|jpe?g)(?:[?#]|$)/i.test(src);
  if(hero){out=setAttr(out,'loading','eager');out=setAttr(out,'fetchpriority','high');}
  else if(!/\bloading=["']eager["']/i.test(out)){out=setAttr(out,'loading','lazy');}
  return out;
}

if(!fs.existsSync(ROOT)) throw new Error('image-metadata: falta public/');
let changed=0,images=0;
for(const file of walk(ROOT).filter(f=>f.endsWith('.html'))){
  const html=fs.readFileSync(file,'utf8');
  const next=html.replace(/<img\b[^>]*>/gi,tag=>{images++;const enriched=enrichImg(tag);if(enriched!==tag)changed++;return enriched;});
  if(next!==html) fs.writeFileSync(file,next);
}
console.log(`Imágenes revisadas: ${images}; etiquetas optimizadas: ${changed}.`);
