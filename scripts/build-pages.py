#!/usr/bin/env python3
"""Build the agreed ten-page site from content JSON and shared templates."""
import html, json, re, shutil
from pathlib import Path
from urllib.parse import urljoin, urlsplit
ROOT = Path(__file__).resolve().parents[1]
DOMAIN = json.loads((ROOT/'content/site.json').read_text())['domain'].rstrip('/')
SLUGS = ['distancionnaya-otsenka','akusticheskiy-zamer','proektirovanie','spetsproekty','promyshlennaya-akustika']
OBJECTS = ['kvartira','chastnyy-dom','studiya-kinoteatr','ofis','horeca','promyshlennyy-obekt']
ROUTES = ['/', *['/services/'+s+'/' for s in SLUGS], '/about/', '/blog/', '/privacy.html', '/consent.html']

def target(url):
    path, sep, frag = url.partition('#')
    if path == '/services/': return '/#services'
    if path == '/objects/': return '/#objects'
    if path.startswith('/objects/'): return '/#object-'+path.strip('/').split('/')[-1]
    if path.startswith('/geography/'): return '/about/#geography'
    if path.startswith('/blog/') and path != '/blog/': return '/blog/#'+path.strip('/').split('/')[-1]
    if path == '/qr/': return '/#diagnose'
    return url

def link(url, base):
    return base + target(url).lstrip('/') if url.startswith('/') else url

def md(text, base):
    text = html.escape(text)
    return re.sub(r'\[([^\]]+)\]\(([^)]+)\)', lambda m: '<a href="'+html.escape(link(html.unescape(m[2]),base),quote=True)+'">'+m[1].replace('|cta','')+'</a>', text)

def body(blocks, base):
    out=[]
    for b in blocks:
        t=b['type']; text=md(b.get('text',''),base)
        if t in ['h2','h3','p']: out.append(f'<{t}>{text}</{t}>')
        elif t in ['ul','ol']: out.append('<'+t+'>'+''.join('<li>'+md(i,base)+'</li>' for i in b['items'])+'</'+t+'>')
        elif t=='callout': out.append('<aside class="seo-callout seo-callout--tip"><p class="seo-callout__title">'+md(b['title'],base)+'</p><p>'+text+'</p></aside>')
        elif t=='scenario': out.append('<div class="seo-scenario"><p class="seo-scenario__label">Ситуация</p><p>'+md(b['situation'],base)+'</p><p class="seo-scenario__label">Что проверяет ЦИА</p><p>'+md(b['check'],base)+'</p></div>')
        elif t=='cta-block': out.append('<aside class="seo-callout"><p class="seo-callout__title">'+md(b['title'],base)+'</p><ul>'+''.join('<li>'+md(i,base)+'</li>' for i in b['items'])+'</ul></aside>')
        else: raise ValueError('Unknown block: '+t)
    return '\n'.join(out)

def faq(items,base):
    if not items:return ''
    return '<section class="seo-page__content"><h2>Частые вопросы</h2>'+''.join('<details class="article-faq"><summary>'+md(i['q'],base)+'</summary><p>'+md(i['a'],base)+'</p></details>' for i in items)+'</section>'

def page(route,title,lead,content,context=None):
    base='../'*len(route.strip('/').split('/'))
    tpl=(ROOT/'templates/page.tpl').read_text()
    context=context or {'intro':'Опишите помещение и задачу — подскажем формат работы ЦИА.'}
    data={'TITLE':html.escape(title+' — ЦИА'),'META_DESCRIPTION':html.escape(lead,quote=True),'CANONICAL_PATH':DOMAIN+route,'OG_IMAGE':DOMAIN+'/assets/og/og-image.jpg','BASE':base,
          'SCHEMA_JSON':json.dumps({'@context':'https://schema.org','@type':'WebPage','name':title,'url':DOMAIN+route},ensure_ascii=False),
          'BREADCRUMB':f'<a href="{base}">Главная</a> / <span aria-current="page">{html.escape(title)}</span>',
          'SITE_HEADER':(ROOT/'templates/header.tpl').read_text().replace('{{BASE}}',base),'CLUSTER_NAV':'','HERO_BLOCK':f'<header class="seo-page__hero"><h1 class="section-title">{html.escape(title)}</h1><p class="seo-page__lead">{html.escape(lead)}</p></header>',
          'BODY':content,'FAQ_BLOCK':'','DIAGNOSE_BLOCK':'','LEAD_BLOCK':(ROOT/'templates/lead-form-embed.tpl').read_text().replace('{{BASE}}',base),'CLUSTER_PAGER':'','RELATED_BLOCK':'',
          'DIAGNOSE_CONTEXT_SCRIPT':'window.__CIA_DIAGNOSE_CONTEXT = '+json.dumps(context,ensure_ascii=False)+';'}
    for k,v in data.items():tpl=tpl.replace('{{'+k+'}}',v)
    if re.search(r'{{[A-Z_]+}}',tpl):raise ValueError('Unresolved template token')
    dest=ROOT/route.strip('/')/'index.html';dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text('\n'.join(line.rstrip() for line in tpl.splitlines())+'\n')

def service_sections(blocks, base):
    groups=[]
    for block in blocks:
        if block['type']=='h2': groups.append([block['text'],[]])
        else: groups[-1][1].append(block)
    out=[]
    for i,(heading,items) in enumerate(groups):
        inner=body(items,base)
        if i<6:
            out.append(f'<section class="service-section"><header><p class="section-label">{i+1:02d} / ФОРМАТ РАБОТЫ</p><h2>{html.escape(heading)}</h2></header><div class="service-section__body">{inner}</div></section>')
        else:
            if i==6:out.append('<section class="service-details"><p class="section-label">ДЕТАЛИ / ПОДРОБНЕЕ О ФОРМАТЕ</p><h2 class="section-title">Что ещё важно знать</h2>')
            out.append(f'<details class="service-detail"><summary>{html.escape(heading)}</summary><div class="service-section__body">{inner}</div></details>')
    if len(groups)>6:out.append('</section>')
    return ''.join(out)

for index,slug in enumerate(SLUGS,1):
    d=json.loads((ROOT/f'content/services/{slug}.json').read_text());base='../../'
    title=d['h1'];lead=d['lead']
    content=service_sections(d['body'],base)
    content+='<section class="service-faq"><p class="section-label">ВОПРОСЫ / ПЕРЕД СТАРТОМ</p><h2 class="section-title">Ответы на ваши вопросы</h2>'+''.join('<details class="service-detail"><summary>'+md(i['q'],base)+'</summary><div class="service-section__body"><p>'+md(i['a'],base)+'</p></div></details>' for i in d.get('faq',[]))+'</section>'
    content+='<section class="service-related"><p class="section-label">УСЛУГИ / ДРУГИЕ ФОРМАТЫ</p><h2 class="section-title">Выберите следующий шаг</h2><div class="service-related__grid">'
    for other in SLUGS:
        if other==slug:continue
        o=json.loads((ROOT/f'content/services/{other}.json').read_text())
        content+=f'<a class="seo-card seo-card--with-image" href="../{other}/"><figure class="seo-card__image"><img src="{base}{o["image"]}" alt="{html.escape(o.get("imageAlt",o["h1"]),quote=True)}" loading="lazy" width="896" height="560"></figure><h3 class="seo-card__title">{html.escape(o["h1"])}</h3><span class="service-related__link">О формате →</span></a>'
    content+='</div></section>'
    context=d.get('diagnoseContext',{})|{'pageType':'services','pageSlug':'services/'+slug,'sourceLabel':title,'defaultService':{'distancionnaya-otsenka':'remote','akusticheskiy-zamer':'measurement','proektirovanie':'design','spetsproekty':'special','promyshlennaya-akustika':'industrial'}[slug]}
    page('/services/'+slug+'/',title,lead,content,context)
    dest=ROOT/f'services/{slug}/index.html';txt=dest.read_text()
    hero=f'<header class="service-hero"><div class="service-hero__copy"><p class="section-label">0{index} / УСЛУГИ ЦИА</p><h1>{html.escape(title)}</h1><p class="service-hero__lead">{html.escape(lead)}</p><div class="service-hero__actions"><a href="#lead" class="btn btn--primary">Обсудить задачу <span aria-hidden="true">→</span></a><a href="{base}about/" class="link-underline">30 лет инженерной практики StP</a></div></div><figure class="service-hero__image"><img src="{base}{d["image"]}" alt="{html.escape(d.get("imageAlt",title),quote=True)}" width="896" height="560" fetchpriority="high"></figure></header>'
    txt=re.sub(r'<header class="seo-page__hero">.*?</header>',hero,txt,flags=re.S)
    dest.write_text(txt.replace('class="seo-page"','class="seo-page service-page"'))

catalog=json.loads((ROOT/'content/catalogs/blog.json').read_text())
articles=[]
for card in catalog['cards']:
    slug=card['href'].strip('/').split('/')[-1]
    articles.append(json.loads((ROOT/f'content/blog/{slug}.json').read_text()))
content='<section class="seo-page__catalog" aria-labelledby="articles-grid-title"><h2 id="articles-grid-title">Выберите тему</h2><div class="seo-page__grid seo-page__grid--cards">'
for d, card in zip(articles, catalog['cards']):
    image=html.escape(d['image'], quote=True)
    alt=html.escape(d.get('imageAlt', d['h1']), quote=True)
    content+=f'<a href="#{d["slug"]}" class="seo-card seo-card--with-image"><figure class="seo-card__image"><img src="../{image}" alt="{alt}" width="896" height="560" loading="lazy" decoding="async"></figure><h3 class="seo-card__title">{html.escape(d["h1"])}</h3><p class="seo-card__text">{html.escape(card["text"])}</p></a>'
content+='</div></section>'

for d in articles:
    content+=f'<details class="article-entry" id="{d["slug"]}"><summary>{html.escape(d["h1"])}</summary><div class="seo-page__content"><p class="seo-page__lead">{html.escape(d["lead"])}</p>'+body(d['body'],'../')+faq(d.get('faq',[]),'../')+'<p><a href="#lead" class="btn btn--primary">Обсудить мою задачу</a></p></div></details>'
page('/blog/','Статьи и ответы','Материалы об акустике помещений: источники шума, обследование, звукоизоляция и проектирование.',content)

about=json.loads((ROOT/'content/about.json').read_text())
page('/about/','О Центре инновационной акустики',about['lead'],(ROOT/'templates/about-content.tpl').read_text())
about_page=ROOT/'about/index.html'
about_page.write_text(about_page.read_text().replace('class="seo-page"', 'class="seo-page about-page"'))


# Object descriptions stay in native dialogs on the homepage, with no extra pages.
home=ROOT/'index.html'
home_text=home.read_text()
home_text=re.sub(r'<header class="header[^"]*".*?</header>', (ROOT/'templates/header.tpl').read_text().replace('{{BASE}}','./'), home_text, count=1, flags=re.S)
home_text=home_text.replace('cia-trust-1','site-pages-2')
if 'js/site-nav.js' not in home_text:home_text=home_text.replace('</body>','<script src="js/site-nav.js" defer></script>\n</body>')
home_text=re.sub(r'<!-- OBJECT MODALS START -->.*?<!-- OBJECT MODALS END -->\s*', '', home_text, flags=re.S)
modals='<!-- OBJECT MODALS START -->\n'
for slug in OBJECTS:
    d=json.loads((ROOT/f'content/objects/{slug}.json').read_text())
    title=html.escape(d['h1'])
    modals+=f'<dialog class="object-modal" id="object-dialog-{slug}" aria-labelledby="object-dialog-title-{slug}" data-lenis-prevent><div class="object-modal__toolbar"><button type="button" class="object-modal__close" aria-label="Закрыть описание объекта" autofocus>Закрыть ×</button></div><div class="object-modal__body"><h2 id="object-dialog-title-{slug}">{title}</h2><p class="seo-page__lead">{html.escape(d["lead"])}</p><figure class="service-preview"><img src="{html.escape(d["image"],quote=True)}" alt="{html.escape(d.get("imageAlt",d["h1"]),quote=True)}" width="896" height="560" loading="lazy"></figure><div class="seo-page__content">'+body(d['body'],'')+'</div>'+faq(d.get('faq',[]),'')+'<p><a href="#lead" class="btn btn--primary">Обсудить мой объект</a></p></div></dialog>\n'
    pattern=r'(<article\b[^>]*id="object-'+slug+r'"[^>]*>)(.*?)(</article>)'
    def update_card(m):
        inner=re.sub(r'href="[^"]+"', 'href="#object-dialog-'+slug+'"', m[2])
        return m[1].replace('tabindex="0"','tabindex="0" role="button" aria-haspopup="dialog" aria-controls="object-dialog-'+slug+'"')+inner+m[3] if 'aria-haspopup' not in m[1] else m[1]+inner+m[3]
    home_text=re.sub(pattern,update_card,home_text,flags=re.S)
modals+='<!-- OBJECT MODALS END -->\n'
home_text=home_text.replace('</body>',modals+'</body>')
if 'js/object-modals.js' not in home_text:home_text=home_text.replace('</body>','<script src="js/object-modals.js" defer></script>\n</body>')
home.write_text(home_text)

# Remove retired published pages; keep their source JSON for reference.
keep={ROOT/r.strip('/')/'index.html' for r in ROUTES if r!='/' and r.endswith('/')}
for section in ['services','objects','geography','blog','qr']:
    for p in (ROOT/section).rglob('*.html'):
        if p not in keep:p.unlink()

# Rewrite relative links and JSON-LD URLs on remaining pages.
for p in [ROOT/'index.html',*keep,ROOT/'privacy.html',ROOT/'consent.html']:
    route='/' if p==ROOT/'index.html' else '/'+str(p.relative_to(ROOT)).replace('index.html','')
    depth=len(p.relative_to(ROOT).parts)-1;base='../'*depth
    txt=p.read_text()
    def rewrite(m):
        url=html.unescape(m[2])
        if url.startswith(('#','mailto:','tel:','data:')):return m[0]
        if url.startswith(DOMAIN):logical=url[len(DOMAIN):] or '/'
        elif re.match(r'https?://',url):return m[0]
        else:logical=urljoin(route,url)
        replacement=target(logical)
        if replacement==logical:return m[0]
        return m[1]+'"'+base+replacement.lstrip('/')+'"'
    txt=re.sub(r'((?:href|src)=)"([^"]+)"',rewrite,txt)
    for old in re.findall(r'"(/(?:services|objects|geography|blog|qr)/[^"\s]*)"',txt):txt=txt.replace('"'+old+'"','"'+target(old)+'"')
    p.write_text(txt)

(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join('  <url><loc>'+DOMAIN+r+'</loc></url>\n' for r in ROUTES)+'</urlset>\n')
print('Built 10 public pages; retired source content preserved.')

for name in ['privacy.html','consent.html']:
    p=ROOT/name;txt=p.read_text()
    txt=re.sub(r'<header class="header[^"]*".*?</header>\s*', '', txt, count=1, flags=re.S)
    txt=txt.replace('<body>','<body>\n'+(ROOT/'templates/header.tpl').read_text().replace('{{BASE}}','./'))
    if 'js/site-nav.js' not in txt:txt=txt.replace('</body>','<script src="js/site-nav.js" defer></script>\n</body>')
    txt=re.sub(r'css/main.css(?:\?[^"]*)?', 'css/main.css?v=site-pages-2', txt)
    p.write_text(txt)
