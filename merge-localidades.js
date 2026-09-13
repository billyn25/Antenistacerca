import fs from 'node:fs';

const BASE='src/localidades.json';
const EXTRAS=[
  'src/localidades-mungialdea.json',
  'src/localidades-uribe-kosta.json',
  'src/localidades-durangaldea-extra.json',
  'src/localidades-enkarterri.json'
];

const base=JSON.parse(fs.readFileSync(BASE,'utf8'));
let merged=[...base];

for(const file of EXTRAS){
  if(!fs.existsSync(file)) continue;
  const extra=JSON.parse(fs.readFileSync(file,'utf8'));
  merged=merged.concat(extra);
}

fs.writeFileSync(BASE,JSON.stringify(merged,null,2)+'\n');
console.log(`Localidades combinadas: ${merged.length} (${EXTRAS.length} archivo(s) extra).`);
