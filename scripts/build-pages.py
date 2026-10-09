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
          'CLUSTER_NAV':'','HERO_BLOCK':f'<header class="seo-page__hero"><h1 class="section-title">{html.escape(title)}</h1><p class="seo-page__lead">{html.escape(lead)}</p></header>',
          'BODY':content,'FAQ_BLOCK':'','DIAGNOSE_BLOCK':'','LEAD_BLOCK':(ROOT/'templates/lead-form-embed.tpl').read_text().replace('{{BASE}}',base),'CLUSTER_PAGER':'','RELATED_BLOCK':'',
          'DIAGNOSE_CONTEXT_SCRIPT':'window.__CIA_DIAGNOSE_CONTEXT = '+json.dumps(context,ensure_ascii=False)+';'}
    for k,v in data.items():tpl=tpl.replace('{{'+k+'}}',v)
    if re.search(r'{{[A-Z_]+}}',tpl):raise ValueError('Unresolved template token')
    dest=ROOT/route.strip('/')/'index.html';dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text('\n'.join(line.rstrip() for line in tpl.splitlines())+'\n')

for slug in SLUGS:
    d=json.loads((ROOT/f'content/services/{slug}.json').read_text());base='../../'
    title=d['h1'];lead=d['lead']
    content='<div class="seo-page__content">'+body(d['body'],base)+'</div>'+faq(d.get('faq',[]),base)
    if d.get('image'):content=f'<figure class="seo-page__hero-media"><img src="{base}{d["image"]}" alt="{html.escape(d.get("imageAlt",title))}" width="896" height="560" loading="lazy"></figure>'+content
    context=d.get('diagnoseContext',{})|{'pageType':'services','pageSlug':'services/'+slug,'sourceLabel':title,'defaultService':{'distancionnaya-otsenka':'remote','akusticheskiy-zamer':'measurement','proektirovanie':'design','spetsproekty':'special','promyshlennaya-akustika':'industrial'}[slug]}
    page('/services/'+slug+'/',title,lead,content,context)

catalog=json.loads((ROOT/'content/catalogs/blog.json').read_text())
articles=[]
for card in catalog['cards']:
    slug=card['href'].strip('/').split('/')[-1]
    articles.append(json.loads((ROOT/f'content/blog/{slug}.json').read_text()))
content='<nav class="seo-page__content" aria-label="Оглавление статей"><h2>Выберите тему</h2><ul>'+''.join(f'<li><a href="#{d["slug"]}">{html.escape(d["h1"])}</a></li>' for d in articles)+'</ul></nav>'
for d in articles:
    content+=f'<details class="article-entry" id="{d["slug"]}"><summary>{html.escape(d["h1"])}</summary><div class="seo-page__content"><p class="seo-page__lead">{html.escape(d["lead"])}</p>'+body(d['body'],'../')+faq(d.get('faq',[]),'../')+'<p><a href="#lead" class="btn btn--primary">Обсудить мою задачу</a></p></div></details>'
page('/blog/','Статьи и ответы','Материалы об акустике помещений: источники шума, обследование, звукоизоляция и проектирование.',content)

about=json.loads((ROOT/'content/about.json').read_text())
page('/about/',about['h1'],about['lead'],'<div class="seo-page__content">'+body(about['body'],'../').replace('<h2>География работы</h2>', '<h2 id="geography">География работы</h2>').replace('<h2>Контакты</h2>', '<h2 id="contacts">Контакты</h2>')+'</div>')

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
