import fs from 'node:fs';
import path from 'node:path';
import { transformConsent, writeAssets } from './cookie-consent.mjs';
import { applyServiceInformation } from './service-information.mjs';
const ROOT = 'public';
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const files = walk(ROOT).filter(f => f.endsWith('.html'));
if (!files.length) throw new Error('Analytics: no hay páginas HTML');
let phoneLinks = 0, whatsappLinks = 0;
// Validate every transformation before writing any HTML.
const changes = files.map(file => {
  const html = applyServiceInformation(transformConsent(fs.readFileSync(file, 'utf8')));
  const hrefs = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)].map(m => m[1]);
  phoneLinks += hrefs.filter(h => /^tel:/i.test(h)).length;
  whatsappLinks += hrefs.filter(h => /(?:^whatsapp:|wa\.me|(?:api\.|web\.)?whatsapp\.com)/i.test(h)).length;
  return [file, html];
});
const cabrejas = path.join(ROOT, 'soria', 'cabrejas-del-pinar', 'index.html');
if (!changes.some(([file]) => file === cabrejas)) throw new Error('Analytics: falta Cabrejas del Pinar');
if (!whatsappLinks || !phoneLinks) throw new Error('Analytics: faltan contactos');
writeAssets(ROOT);
for (const [file, html] of changes) fs.writeFileSync(file, html);
console.log(`CONSENTIMIENTO OK: ${files.length} páginas; GA4 bloqueado hasta aceptar; ${phoneLinks} llamadas y ${whatsappLinks} enlaces WhatsApp conservados.`);
