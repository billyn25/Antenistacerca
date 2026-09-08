import fs from 'node:fs';
import path from 'node:path';

const OUT='public';
const HERO='/assets/hero-antennista.jpg';
const PUEBLO='https://images.pexels.com/photos/33057075/pexels-photo-33057075.jpeg?cs=srgb&fm=jpg';

function walk(dir){
  for(const name of fs.readdirSync(dir)){
    const p=path.join(dir,name);
    const st=fs.statSync(p);
    if(st.isDirectory()) walk(p);
    else if(name==='index.html') patch(p);
  }
}

function patch(file){
  let h=fs.readFileSync(file,'utf8');
  h=h.replace(/(<div class="heroimg"><img src=")[^"]+("[^>]*>)/,`$1${HERO}$2`);
  h=h.replace(/(<div class="hero-photo"><img src=")[^"]+("[^>]*>)/,`$1${HERO}$2`);
  h=h.replace(/(<div class="localpic"><img src=")[^"]+("[^>]*>)/,`$1${PUEBLO}$2`);
  fs.writeFileSync(file,h);
}

walk(OUT);
console.log('Imágenes fijadas en portada y páginas locales.');
