import fs from 'node:fs';

const file='public/index.html';
let h=fs.readFileSync(file,'utf8');

const css=`<style id="home-polish">
@media (hover:hover) and (pointer:fine){
.service-grid article,.area,.towns a,.direct-home,.btn,.areahead a{transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease,filter .18s ease,background-color .18s ease}
.service-grid article:hover{transform:translateY(-2px);box-shadow:0 15px 32px rgba(16,45,72,.13);border-color:#cbdde9}
.towns a:hover{transform:translateY(-1px);background:#f1f7fb;border-color:#bfd4e3}
.area:hover{box-shadow:0 8px 20px rgba(16,45,72,.08)}
.btn:hover{filter:brightness(.96)}
.direct-home:hover{box-shadow:0 8px 18px rgba(16,45,72,.09)}
.areahead a:hover{transform:translateX(3px)}
}
.trust-home{padding:4px 0 38px}.trust-card{position:relative;overflow:hidden;text-align:center;padding:31px 28px;border:1px solid #dce5ec;border-radius:16px;background:linear-gradient(135deg,#f8fbfd,#eef6fb);box-shadow:0 10px 26px rgba(16,45,72,.07)}.trust-stars{color:#e6a800;font-size:27px;letter-spacing:4px;line-height:1;margin-bottom:11px}.trust-card h2{margin:0 0 8px;color:#0a3f73;font-size:30px;line-height:1.15}.trust-card>p{max-width:780px;margin:0 auto;color:#536373}.trust-points{display:flex;justify-content:center;flex-wrap:wrap;gap:9px 12px;margin:19px auto 21px}.trust-points span{display:inline-flex;align-items:center;padding:8px 11px;border:1px solid #d7e4ed;border-radius:999px;background:#fff;color:#29465f;font-size:13px;font-weight:700}.trust-call{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap}.trust-phone{font-size:25px;font-weight:900;color:#d92128!important}
@media(max-width:640px){.trust-home{padding:0 0 24px}.trust-card{padding:24px 14px;border-radius:13px}.trust-stars{font-size:23px;letter-spacing:3px}.trust-card h2{font-size:24px}.trust-card>p{font-size:14px}.trust-points{gap:7px;margin:16px 0 18px}.trust-points span{font-size:12px;padding:7px 9px}.trust-phone{font-size:22px}}
@media(prefers-reduced-motion:reduce){.service-grid article,.area,.towns a,.direct-home,.btn,.areahead a{transition:none!important}}
</style>`;

const trust=`<section class="trust-home" aria-labelledby="trust-title"><div class="w"><div class="trust-card"><div class="trust-stars" aria-hidden="true">★★★★★</div><h2 id="trust-title">Atención cercana y trato directo con el técnico</h2><p>Servicio técnico de antenas organizado por localidades para viviendas y comunidades.</p><div class="trust-points"><span>✓ Antenas individuales y colectivas</span><span>✓ TDT y parabólicas</span><span>✓ Porteros y videoporteros</span><span>✓ Cobertura móvil</span></div><div class="trust-call"><a class="trust-phone" href="tel:+34641589394">☎ 641 589 394</a><a class="btn green" href="https://wa.me/34641589394">WhatsApp</a></div></div></div></section>`;

if(!h.includes('id="home-polish"')) h=h.replace('</head>',css+'</head>');
if(!h.includes('class="trust-home"')) h=h.replace('<section id="contacto"',trust+'<section id="contacto"');
fs.writeFileSync(file,h);
console.log('Portada mejorada: confianza + microinteracciones.');
