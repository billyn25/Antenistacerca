(()=>{
 const input=document.getElementById('ac-madrid-query');if(!input)return;
 const results=[...document.querySelectorAll('[data-madrid-search]')],groups=[...document.querySelectorAll('.alpha-group')];
 const status=document.getElementById('ac-madrid-status'),alphabet=document.querySelector('.alpha-nav');
 const norm=s=>s.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
 const texts=results.map(el=>norm(el.dataset.madridSearch));
 function update(){
  const terms=norm(input.value).split(' ').filter(Boolean);let count=0;
  results.forEach((el,i)=>{el.hidden=!terms.every(t=>texts[i].includes(t));if(!el.hidden)count++;});
  groups.forEach(g=>{g.hidden=![...g.querySelectorAll('[data-madrid-search]')].some(el=>!el.hidden);});
  if(alphabet)alphabet.hidden=terms.length>0;
  status.textContent=count?`${count} municipio${count===1?'':'s'} encontrado${count===1?'':'s'}. Selecciona la localidad para consultar el servicio.`:'No hay coincidencias. Prueba con el nombre del municipio o comprueba el código postal.';
 }
 input.addEventListener('input',update);input.addEventListener('search',update);
})();
