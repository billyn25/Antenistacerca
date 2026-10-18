import {applyMobile} from './mobile-experience.mjs';
/** Complete Madrid content, district presentation and footers before regional contacts. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {applyDistrictDesign} from './madrid-district-design.mjs';
import {applyBoost,auditBoost} from './madrid-seo-boost.mjs';
const style='<style id="regional-added-footer-style">footer.rc-added-footer{background:#0a2e4c;color:#fff;padding:20px 0;margin-top:28px;clear:both}footer.rc-added-footer *{box-sizing:border-box}</style>';
const footer='<footer class="rc-added-footer"></footer>';
export function ensureFooter(html){
 if(/<footer\b/i.test(html))return html;
 assert.ok(/<\/head>/i.test(html)&&/<\/body>/i.test(html),'No se añade un pie a HTML incompleto');
 const after=html.replace(/<\/head>/i,style+'$&').replace(/<\/body>/i,footer+'$&');
 assert.equal(after.replace(style,'').replace(footer,''),html,'El pie no puede alterar el contenido anterior');
 return after;
}
export function testFooter(){
 const fixture='<!doctype html><html><head><link rel="canonical" href="https://antenistacerca.es/madrid/"><meta name="robots" content="noindex,follow"></head><body><main><a href="/madrid/ajalvir/">Ajalvir</a></main></body></html>';
 const after=ensureFooter(fixture);assert.equal(ensureFooter(after),after);assert.equal(after.replace(style,'').replace(footer,''),fixture);
 assert.equal(ensureFooter(fixture.replace('</body>','<footer>Original</footer></body>')),fixture.replace('</body>','<footer>Original</footer></body>'));
 assert.throws(()=>ensureFooter('<html></html>'));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 testFooter();
 if(process.argv.includes('--self-test')){console.log('PIES PROVINCIALES OK: contenido preservado, sin duplicados');}
 else {
  const checks=spawnSync(process.execPath,['--test','tests/madrid-district-design.test.mjs','tests/madrid-seo-boost.test.mjs','tests/mobile-experience.test.mjs'],{stdio:'inherit'});
  if(checks.error)throw checks.error;if(checks.status!==0)process.exit(checks.status||1);
  applyDistrictDesign('public');
  applyBoost('public');
  const added=[];
  const visit=dir=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory())visit(file);else if(e.name.endsWith('.html')){const before=fs.readFileSync(file,'utf8'),after=ensureFooter(before);if(before!==after){fs.writeFileSync(file,after);added.push(path.relative('public',file));}}}};
  visit('public');fs.mkdirSync('.cache',{recursive:true});fs.writeFileSync('.cache/regional-contact-footers.json',JSON.stringify({added,contentPreserved:true},null,2));
  console.log('PIES AÑADIDOS A PÁGINAS SIN PIE:',added.length);
  const result=spawnSync(process.execPath,['scripts/regional-contact.mjs'],{stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0)process.exit(result.status||1);
  auditBoost('public');
  applyMobile('public');
 }
}
