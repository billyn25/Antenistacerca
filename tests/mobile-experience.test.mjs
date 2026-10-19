import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {CSS,runtime,quickForm,transformMobile} from '../scripts/mobile-experience.mjs';
import {transform,CENTRAL,NORTH} from '../scripts/regional-contact.mjs';
const provinces=[{slug:'bizkaia',name:'Bizkaia'},{slug:'madrid',name:'Madrid'},{slug:'guadalajara',name:'Guadalajara'},{slug:'toledo',name:'Toledo'}];
test('menú y formulario conservan canonical, H1, fotografía y teléfono regional',()=>{
 for(const province of provinces){
  const route='/'+province.slug+'/pueblo/';
  const source=`<html><head><link rel="canonical" href="https://antenistacerca.es${route}"><meta name="robots" content="index,follow"></head><body><header><div class="head"><a class="brand" href="/"><img src="/logo.webp"></a><nav><a href="#servicios">Servicios</a></nav><div class="hcontact"><a class="tel" href="tel:+34641589394">☎ 641 589 394</a></div></div></header><main><h1>Antenista en Pueblo</h1><section id="servicios"></section><img src="/foto.jpg"></main><footer></footer></body></html>`;
  const h=transformMobile(transform(source,route),route,provinces,'Pueblo & Valle');
  assert(h.includes('aria-controls="ac-navigation"'));assert(h.includes('id="ac-consulta"'));
  assert(h.includes('Pueblo &amp; Valle'));assert.equal(transformMobile(h,route,provinces),h);
  const contact=province.slug==='bizkaia'?NORTH:CENTRAL;assert(h.includes('data-phone="'+contact.wa+'"'));
 }
});
test('menú abre, cierra al elegir enlace y responde a Escape',()=>{
 const e={},attrs={};let focus=false;const header={dataset:{},querySelector:s=>s==='[data-ac-menu]'?button:nav,addEventListener:(k,f)=>e[k]=f};
 const button={setAttribute:(k,v)=>attrs[k]=v,getAttribute:k=>attrs[k],addEventListener:(k,f)=>e.toggle=f,focus:()=>focus=true};const nav={addEventListener:(k,f)=>e.link=f};
 vm.runInNewContext('('+runtime.toString()+')()',{document:{querySelector:s=>s==='[data-ac-header]'?header:null}});
 e.toggle();assert.equal(attrs['aria-expanded'],'true');e.link({target:{closest:()=>({})}});assert.equal(attrs['aria-expanded'],'false');e.toggle();e.keydown({key:'Escape'});assert(focus);assert.equal(attrs['aria-expanded'],'false');
});
test('aviso desde provincia norte cambia de destinatario al elegir centro y mantiene los datos',()=>{
 const events={};const province={value:'bizkaia',selectedIndex:0,options:[{text:'Bizkaia'},{text:'Madrid'},{text:'Guadalajara'},{text:'Toledo'}]},place={value:'Mi pueblo'},service={value:'reparación de portero'},detail={value:'No abre & no suena'},label={};
 const fields={'[name="province"]':province,'[name="locality"]':place,'[name="service"]':service,'[name="detail"]':detail,'[data-ac-recipient]':label};
 const form={dataset:{},hidden:true,querySelector:s=>fields[s],addEventListener:(k,f)=>events[k]=f,reportValidity:()=>true};let opened;
 vm.runInNewContext('('+runtime.toString()+')()',{document:{querySelector:s=>s==='[data-ac-quick-form]'?form:null,querySelectorAll:()=>[]},window:{open:(url)=>opened=url}});
 for(const [value,index,phone] of [['bizkaia',0,'34641589394'],['madrid',1,'34614789945'],['guadalajara',2,'34614789945'],['toledo',3,'34614789945']]){
  province.value=value;province.selectedIndex=index;events.change();events.submit({preventDefault(){}});const u=new URL(opened);assert.equal(u.pathname,'/'+phone);assert.equal(form.dataset.phone,phone);assert(u.searchParams.get('text').includes('Mi pueblo'));assert(u.searchParams.get('text').includes('No abre & no suena'));
 }
 assert.equal(form.hidden,false);
});

test('cabecera de provincias limita el logo en escritorio sin depender de header-brand',()=>{
 assert.match(CSS,/@media\(min-width:901px\)\{\.ac-header a\.brand\.ac-brand-logo>img\{width:180px!important/);
 assert.match(CSS,/max-height:64px!important/);
 assert.match(CSS,/@media\(max-width:640px\)[\s\S]*?width:140px!important/);
});
