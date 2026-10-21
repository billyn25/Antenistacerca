"""Fixed sample before/after; editorial similarity is not a Google threshold."""
import json,re,statistics,itertools,unicodedata,sys
from pathlib import Path
from lxml import html
root=Path('public');towns=json.loads(Path('src/localidades.json').read_text());selected=[]
for province in sorted({d['provinciaSlug'] for d in towns}):
 group=sorted([d for d in towns if d['provinciaSlug']==province],key=lambda d:d['slug'])
 for i in [0,len(group)//2,len(group)-1]:selected.append(group[i])
def normal(s):return ''.join(c for c in unicodedata.normalize('NFD',s.lower()) if unicodedata.category(c)!='Mn')
sets=[]
for d in selected:
 page=html.fromstring((root/d['provinciaSlug']/d['slug']/'index.html').read_text())
 for node in page.xpath('//script|//style|//header|//footer|//nav|//svg|//iframe|//form|//*[@id="contacto"]|//*[contains(concat(" ",normalize-space(@class)," ")," mobilebar ")]'):
  if node.getparent() is not None:node.getparent().remove(node)
 text=normal(' '.join(page.itertext()))
 for name in [d['localidad'],d['provincia']]:text=text.replace(normal(name),'LOCAL')
 text=re.sub(r'\b\d[\d ]{7,}\d\b','PHONE',text);words=re.findall(r'\w+',text);sets.append(set(zip(*(words[i:] for i in range(5)))))
values=[round(100*len(a&b)/len(a|b),2) for a,b in itertools.combinations(sets,2)]
report={'sample_municipalities':len(selected),'pairs':len(values),'provinces':len({d['provinciaSlug'] for d in selected}),'method':'Jaccard sobre secuencias de 5 palabras; primer, medio y último slug de cada provincia; nombres municipales y provinciales normalizados; sin cabecera, pie, navegación, formulario, scripts ni SVG. Comparación editorial, no umbral de Google.','median':round(statistics.median(values),2),'maximum':max(values),'minimum':min(values),'sample':[d['provinciaSlug']+'/'+d['slug'] for d in selected]}
Path(sys.argv[1]).write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps({k:v for k,v in report.items() if k not in ['sample','method']},ensure_ascii=False))
