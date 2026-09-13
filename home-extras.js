import fs from 'node:fs';
import localidades from './src/localidades.json' with { type: 'json' };

const FILE='public/index.html';
const STYLE_ID='home-extras-style';
const SCRIPT_ID='home-extras-script';

const statsBlock=`<section class="home-stats" aria-labelledby="home-stats-title"><div class="w"><div class="home-stats-head"><div class="kicker">ANTENISTA CERCA</div><h2 id="home-stats-title">Servicio técnico de proximidad</h2></div><div class="home-stats-grid"><div class="home-stat"><strong data-count="${localidades.length}">${localidades.length}</strong><span>Localidades preparadas</span></div><div class="home-stat"><strong>24H</strong><span>Atención de urgencias</span></div><div class="home-stat"><strong data-count="9">9</strong><span>Servicios principales</span></div><div class="home-stat"><strong>Directo</strong><span>Trato con el técnico</span></div></div></div></section>`;

const moreServicesBlock=`<section class="section home-more-services" aria-labelledby="home-more-services-title"><div class="w"><div class="kicker">MÁS SERVICIOS DE ANTENAS</div><h2 id="home-more-services-title">Instalaciones colectivas, amplificación y distribución</h2><div class="home-more-grid"><article><img src="/assets/antena.jpeg" alt="Antena colectiva para comunidad de propietarios"><div><h3>Antenas colectivas y comunidades</h3><p>Instalación y reparación de antenas comunitarias. Revisamos cabeceras, líneas, derivadores y señal cuando falla todo el edificio o solo algunas viviendas.</p></div></article><article><img src="/assets/monocanales-cabecera.jpeg" alt="Amplificadores, repartidores y distribución de señal de televisión"><div><h3>Amplificadores y distribución</h3><p>Diagnóstico y reparación de amplificadores, fuentes, repartidores y derivadores para recuperar nivel y calidad de señal en toda la instalación.</p></div></article><article><img src="/assets/parabolica.jpeg" alt="Cableado coaxial y tomas de televisión y satélite"><div><h3>Tomas, cableado TV y SAT</h3><p>Nuevas tomas, sustitución de cable coaxial, conectores y líneas de TV o satélite cuando hay pérdidas, cortes o puntos sin señal.</p></div></article></div></div></section>`;

const css=`<style id="${STYLE_ID}">
.home-more-services{padding-top:0}.home-more-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:22px}.home-more-grid article{border:1px solid #e3ebf1;border-radius:15px;overflow:hidden;background:#fff;box-shadow:0 12px 30px rgba(16,45,72,.10);min-width:0}.home-more-grid img{width:100%;height:175px;object-fit:cover;background:#eef3f6}.home-more-grid article>div{padding:16px}.home-more-grid h3{margin:0 0 7px;color:#0a3f73;font-size:19px;line-height:1.2}.home-more-grid p{margin:0;color:#536373;font-size:14px;line-height:1.5}
.home-stats{background:#0b1c31;color:#fff;padding:56px 0 52px;margin:12px 0 36px}.home-stats-head{text-align:center;margin-bottom:32px}.home-stats-head .kicker{color:#9fc3df}.home-stats-head h2{margin:0;color:#fff;font-size:30px}.home-stats-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0}.home-stat{text-align:center;padding:16px 12px}.home-stat+.home-stat{border-left:1px solid rgba(255,255,255,.12)}.home-stat strong{display:block;color:#fff;font-size:50px;line-height:1;font-weight:900;letter-spacing:-.03em}.home-stat span{display:block;margin-top:10px;color:#dce8f2;font-size:16px}
@media(max-width:900px){.home-more-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:640px){.home-more-grid{grid-template-columns:1fr 1fr;gap:10px}.home-more-grid img{height:116px}.home-more-grid article>div{padding:11px}.home-more-grid h3{font-size:16px;overflow-wrap:anywhere}.home-more-grid p{font-size:12px;line-height:1.45}.home-stats{padding:42px 0 38px;margin-bottom:24px}.home-stats-head{margin-bottom:20px}.home-stats-head h2{font-size:24px}.home-stats-grid{grid-template-columns:1fr 1fr}.home-stat{padding:20px 7px}.home-stat strong{font-size:40px}.home-stat span{font-size:13px}.home-stat+.home-stat{border-left:0}.home-stat:nth-child(even){border-left:1px solid rgba(255,255,255,.12)}.home-stat:nth-child(n+3){border-top:1px solid rgba(255,255,255,.12)}}
</style>`;

const js=`<script id="${SCRIPT_ID}">(()=>{const els=[...document.querySelectorAll('.home-stat [data-count]')];if(!els.length)return;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const run=el=>{const end=Number(el.dataset.count)||0;if(reduced){el.textContent=end;return}const start=performance.now(),duration=900;const tick=now=>{const p=Math.min(1,(now-start)/duration),e=1-Math.pow(1-p,3);el.textContent=Math.round(end*e);if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)};if(!('IntersectionObserver'in window)){els.forEach(run);return}const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){run(entry.target);io.unobserve(entry.target)}}),{threshold:.45});els.forEach(el=>io.observe(el))})();</script>`;

if(!fs.existsSync(FILE)) throw new Error('Home extras: falta public/index.html');
let html=fs.readFileSync(FILE,'utf8');
if(!html.includes('id="contacto"')) throw new Error('Home extras: no encuentro el bloque de contacto');
if(!html.includes('class="home-more-services"')){
  const zones='<section id="zonas"';
  if(!html.includes(zones)) throw new Error('Home extras: no encuentro el bloque de zonas');
  html=html.replace(zones,moreServicesBlock+zones);
}
if(!html.includes(`id="${STYLE_ID}"`)) html=html.replace('</head>',css+'</head>');
if(!html.includes('class="home-stats"')) html=html.replace('<section id="contacto"',statsBlock+'<section id="contacto"');
if(!html.includes(`id="${SCRIPT_ID}"`)) html=html.replace('</body>',js+'</body>');
fs.writeFileSync(FILE,html);
console.log(`Extras de portada aplicados: ${localidades.length} localidades y 9 servicios principales.`);
