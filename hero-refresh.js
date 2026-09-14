import fs from 'node:fs';
import path from 'node:path';

const ROOT='public';
const OLD='/assets/hero-antennista.png';
const HERO='/assets/hero-antennista.webp';
const STYLE=`<style id="hero-refresh-css">
.hero-photo:after{display:none!important}
.hero-photo img,.heroimg img{object-position:64% center}
@media(max-width:900px){.hero-photo img,.heroimg img{object-position:66% center}}
@media(max-width:640px){.hero-photo img,.heroimg img{object-position:68% center}}
</style>`;
const widths=[480,640,768,960,1280];
const cdn=w=>`/.netlify/images?url=${HERO}&amp;w=${w}&amp;q=90`;
const srcset=widths.map(w=>`${cdn(w)} ${w}w`).join(', ');
const sizes='(max-width: 900px) 100vw, 52vw';

function validateHeroAsset(){
  const file=path.join(ROOT,'assets','hero-antennista.webp');
  if(!fs.existsSync(file))throw new Error('hero-refresh: falta el asset WebP nuevo');
  const b=fs.readFileSync(file);
  if(b.length<30||b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WEBP')throw new Error('hero-refresh: asset WebP inválido');
  const riffBytes=b.readUInt32LE(4)+8;
  if(riffBytes!==b.length)throw new Error(`hero-refresh: WebP truncado/corrupto (${b.length} bytes, RIFF declara ${riffBytes})`);
  if(b.toString('ascii',12,16)!=='VP8 ')throw new Error('hero-refresh: formato WebP inesperado');
  if(b[23]!==0x9d||b[24]!==0x01||b[25]!==0x2a)throw new Error('hero-refresh: cabecera VP8 inválida');
  const width=b.readUInt16LE(26)&0x3fff,height=b.readUInt16LE(28)&0x3fff;
  if(width!==1280||height!==720)throw new Error(`hero-refresh: dimensiones inesperadas ${width}x${height}`);
  if(b.length>260000)throw new Error(`hero-refresh: hero demasiado pesado (${Math.round(b.length/1024)} KiB)`);
  console.log(`Hero asset OK: ${width}x${height}, ${Math.round(b.length/1024)} KiB.`);
}
function setAttr(tag,name,value){
  const re=new RegExp(`\\s+${name}=["'][^"']*["']`,'i');
  return re.test(tag)?tag.replace(re,` ${name}="${value}"`):tag.replace(/<img\b/i,`<img ${name}="${value}"`);
}
function heroTag(tag){
  const src=tag.match(/\bsrc=["']([^"']+)["']/i)?.[1];
  if(src!==OLD&&src!==HERO)return tag;
  let out=tag;
  out=setAttr(out,'src',cdn(1280));
  out=setAttr(out,'srcset',srcset);
  out=setAttr(out,'sizes',sizes);
  out=setAttr(out,'width','1280');
  out=setAttr(out,'height','720');
  out=setAttr(out,'loading','eager');
  out=setAttr(out,'fetchpriority','high');
  out=setAttr(out,'decoding','async');
  return out;
}
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)])}

if(!fs.existsSync(ROOT))throw new Error('hero-refresh: falta public/');
validateHeroAsset();
let pages=0;
for(const file of walk(ROOT).filter(f=>f.endsWith('.html'))){
  let h=fs.readFileSync(file,'utf8');
  const hadHero=h.includes(OLD)||h.includes(HERO);
  if(!hadHero)continue;
  h=h.replace(/<img\b[^>]*>/gi,heroTag);
  if(!h.includes('id="hero-refresh-css"'))h=h.replace('</head>',STYLE+'</head>');
  if(h.includes(OLD))throw new Error(`hero-refresh: queda hero antiguo en ${file}`);
  if(!h.includes('/assets/hero-antennista.webp'))throw new Error(`hero-refresh: falta hero nuevo en ${file}`);
  if(!h.includes('fetchpriority="high"')||!h.includes('loading="eager"'))throw new Error(`hero-refresh: prioridad LCP incompleta en ${file}`);
  fs.writeFileSync(file,h);
  pages++;
}
if(!pages)throw new Error('hero-refresh: no se encontró ninguna página con hero');
console.log(`Hero nuevo aplicado a ${pages} páginas: WebP de alta calidad, responsive, sin velo gris y con textos HTML intactos.`);
