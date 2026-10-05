"""Smoke tests for the generated site; no calls or messages are sent."""
import http.server,json,os,threading,urllib.parse
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]/'public'
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
    def do_GET(self):
        parsed=urllib.parse.urlparse(self.path)
        if parsed.path=='/.netlify/images':self.path=urllib.parse.parse_qs(parsed.query).get('url',['/'])[0]
        super().do_GET()
    def log_message(self,*a):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Handler)
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
postal=json.loads((ROOT.parent/'src/postal-codes-madrid.json').read_text())['municipalities']
shared=next(c for c in sorted({c for t in postal for c in t['postalCodes']}) if sum(c in t['postalCodes'] for t in postal)>1)
shared_count=sum(shared in t['postalCodes'] for t in postal)
checks=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    for width in [320,390,768,1440]:
        context=browser.new_context(viewport={'width':width,'height':900})
        page=context.new_page()
        context.route('https://**/*',lambda r:r.abort())
        for url in ['/madrid/','/madrid/coslada/','/madrid/gargantilla-del-lozoya-y-pinilla-de-buitrago/','/bizkaia/galdakao/']:
            response=page.goto(base+url,wait_until='domcontentloaded');assert response.status==200
            page.add_style_tag(content='html,body,*{scroll-behavior:auto!important}')
            assert page.locator('h1').count()==1
            assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1'),(url,width)
            if url=='/madrid/':
                query=page.locator('#ac-madrid-query')
                for text,count in [('28801',1),('alcala de henares',1),(shared,shared_count),('zzzzzzzzz',0),('',179)]:
                    query.fill(text);assert page.locator('[data-madrid-search]:visible').count()==count,(text,width)
            else:
                detail=page.locator('.local-faq details').first
                detail.locator('summary').click();assert detail.get_attribute('open') is not None
                detail.locator('summary').click();assert detail.get_attribute('open') is None
                for key in ['reparacion-porteros','instalacion-videoporteros','tdt-satelite']:assert page.locator('#'+key).count()==1
            checks.append({'width':width,'route':url,'passed':True})
        page.goto(base+'/',wait_until='domcontentloaded')
        page.add_style_tag(content='html,body,*{scroll-behavior:auto!important}')
        area=page.locator('section.area').filter(has=page.get_by_role('heading',name='Madrid',exact=True))
        assert area.locator('.towns a').count()==24;assert area.locator('.town-more-links a').count()==155
        area.locator('summary').click();assert area.locator('.town-more-links a').first.is_visible()
        assert area.locator('.town-more-links').evaluate('(e)=>getComputedStyle(e).overflowY') not in ['auto','scroll']
        context.close()
    context=browser.new_context(java_script_enabled=False,viewport={'width':390,'height':844})
    page=context.new_page();page.goto(base+'/madrid/',wait_until='domcontentloaded')
    assert page.locator('[data-madrid-search]:visible').count()==179
    page.goto(base+'/madrid/madrid/',wait_until='domcontentloaded')
    page.add_style_tag(content='html,body,*{scroll-behavior:auto!important}')
    more=page.locator('.ac-postal-more');more.locator('summary').click();assert more.locator('.ac-postal-code').first.is_visible()
    checks.append({'javaScript':False,'directory179':True,'postalDisclosure':True,'passed':True})
    browser.close()
server.shutdown()
out=ROOT.parent/'.quality';out.mkdir(exist_ok=True)
(out/'madrid-browser.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2))
print('NAVEGADOR MADRID OK:',len(checks),'escenarios; portada, buscador postal, FAQ y móvil/escritorio.')
