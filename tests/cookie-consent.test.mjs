import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { transformConsent, auditConsent, writeAssets, RUNTIME, CSS, JS_PATH, CSS_PATH, GA_ID } from '../cookie-consent.mjs';

export const legacy = `<!-- Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>\n<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');</script><script id="antenistacerca-conversions">console.log('old');</script>`;
export const fixture = (footer = true) => `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Antenista en Amurrio | Reparación</title><meta name="robots" content="index,follow"><link rel="canonical" href="https://antenistacerca.es/alava/amurrio/">${legacy}<style>body{margin:0;font:16px Arial}img{max-width:100%;height:auto}.w{max-width:1280px;margin:auto}header{height:80px;background:#fff}main{min-height:1000px;background:#f7fbff}footer{background:#082b4d;color:#fff}nav{display:none!important}.mobilebar{display:none}@media(max-width:640px){body{padding-bottom:62px}.mobilebar{display:flex;position:fixed;bottom:0;width:100%;height:62px;background:#fff;z-index:80}.mobilebar a{width:50%;padding:16px;text-align:center;color:white;background:#d92128}.mobilebar a:last-child{background:#10ad3e}}</style></head><body><header><strong>ANTENISTA CERCA</strong></header><main><h1>Antenista en Amurrio</h1><p>Instalación y reparación de antenas TDT.</p><a id="phone" href="tel:+34641589394">Llamar 641 589 394</a><a id="wa" href="https://wa.me/34641589394?text=privado" target="_blank">WhatsApp</a><a href="/alava/">Álava</a><img src="/assets/hero-antenista-panorama.webp" alt="Técnico" width="1916" height="821"></main>${footer ? '<footer><div class="w">Pie original</div></footer>' : ''}<div class="mobilebar"><a href="tel:+34641589394">Llamar</a><a href="https://wa.me/34641589394">WhatsApp</a></div></body></html>`;

test('removes immediate Google load and config; keeps one consent-controlled tracker', () => {
 const h = transformConsent(fixture()); assert.deepEqual(auditConsent(h), []);
 assert.ok(!h.includes('googletagmanager.com')); assert.ok(!h.includes("gtag('config'"));
 assert.equal((h.match(/id="antenistacerca-conversions"/g)||[]).length,1);
});
test('idempotent: second pass is byte-identical', () => {const h=transformConsent(fixture());assert.equal(transformConsent(h),h);});
test('does not alter main content, contact URLs, titles or canonical', () => {
 const a=fixture(),b=transformConsent(a);const main=h=>h.match(/<main>[\s\S]*?<\/main>/)[0];assert.equal(main(a),main(b));
 for(const regex of [/<title>.*?<\/title>/,/<link rel="canonical"[^>]+>/,/<meta name="robots"[^>]+>/,/<header>.*?<\/header>/,/<div class="mobilebar">.*?<\/div>/]) assert.equal(a.match(regex)[0],b.match(regex)[0]);
});
test('province without footer gets accessible cookie information', () => assert.deepEqual(auditConsent(transformConsent(fixture(false))),[]));
test('fails closed for unrecognized pre-existing direct Google tag', () => assert.throws(()=>transformConsent(fixture().replace('</head>','<script src="https://www.googletagmanager.com/gtm.js?id=unexpected"></script></head>')),/sin consentimiento/));
test('refuses malformed HTML', () => assert.throws(()=>transformConsent('<body></body>'),/incompleta/));
test('initial analytic checkbox is not preselected', () => assert.ok(!transformConsent(fixture()).match(/id="ac-cookie-analytics"[^>]*checked/)));
test('runtime is syntactically valid; Google script is created dynamically', () => {assert.doesNotThrow(()=>new vm.Script(RUNTIME));assert.ok(RUNTIME.includes('if (!allowed() || started) return;'));});
test('generated assets are complete and auditable', () => {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'ac-cookie-'));try{writeAssets(root);assert.equal(fs.readFileSync(path.join(root,JS_PATH.slice(1)),'utf8'),RUNTIME);assert.equal(fs.readFileSync(path.join(root,CSS_PATH.slice(1)),'utf8'),CSS);}finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('static information and buttons are available on every page', () => {const h=transformConsent(fixture());assert.ok(h.includes('data-ac-cookie-reject'));assert.ok(h.includes('<summary>Política de cookies</summary>'));assert.ok(h.includes('data-nosnippet'));assert.ok(h.includes('<noscript>'));});
