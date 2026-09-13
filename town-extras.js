import fs from 'node:fs';
import path from 'node:path';
import localidades from './src/localidades.json' with { type:'json' };

const STYLE=`<style id="town-backtop-style">.town-backtop{position:fixed;right:18px;bottom:18px;width:42px;height:42px;border:1px solid rgba(255,255,255,.22);border-radius:12px;background:#0a3f73;color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;line-height:1;box-shadow:0 8px 22px rgba(10,63,115,.24);z-index:80;opacity:0;visibility:hidden;transform:translateY(8px);transition:opacity .18s ease,transform .18s ease,visibility .18s ease;cursor:pointer}.town-backtop.is-visible{opacity:.95;visibility:visible;transform:translateY(0)}.town-backtop:hover{opacity:1;transform:translateY(-1px)}.town-backtop:focus-visible{outline:3px solid #9fc3df;outline-offset:2px}@media(max-width:640px){.town-backtop{right:12px;bottom:12px;width:40px;height:40px;border-radius:11px;font-size:20px}}@media(prefers-reduced-motion:reduce){.town-backtop{transition:none}}</style>`;
const BUTTON=`<button class="town-backtop" type="button" aria-label="Volver arriba" title="Volver arriba">↑</button>`;
const SCRIPT=`<script id="town-backtop-script">(()=>{const b=document.querySelector('.town-backtop');if(!b)return;const show=()=>b.classList.toggle('is-visible',window.scrollY>650);show();window.addEventListener('scroll',show,{passive:true});b.addEventListener('click',()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));})();</script>`;

for(const d of localidades){
  const file=path.join('public',d.provinciaSlug,d.slug,'index.html');
  if(!fs.existsSync(file)) continue;
  let h=fs.readFileSync(file,'utf8');
  if(!h.includes('town-backtop-style')) h=h.replace('</head>',STYLE+'</head>');
  if(!h.includes('class="town-backtop"')) h=h.replace('</body>',BUTTON+SCRIPT+'</body>');
  fs.writeFileSync(file,h);
}
console.log(`Flecha volver arriba añadida a ${localidades.length} localidades.`);
