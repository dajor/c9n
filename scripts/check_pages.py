"""Check page structure, cross-page section links and locale counterparts."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
root=Path(__file__).resolve().parents[1]/'docs'
class Page(HTMLParser):
 def __init__(self,path):
  super().__init__();self.ids=set();self.links=[];self.h1=0;self.canonical=[];self.language=[];self.feed(path.read_text())
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.add(a['id'])
  if tag=='h1':self.h1+=1
  if tag=='a' and 'href' in a:self.links.append(a['href'])
  if tag=='a' and 'data-language' in a:self.language.append(a['href'])
  if tag=='link' and a.get('rel')=='canonical':self.canonical.append(a['href'])
names=['index.html','en.html']+[p+s+'.html' for p in ['product','evidence','community','download','contact'] for s in ['', '.en']]
for name in names:
 path=root/name;p=Page(path)
 assert p.h1==1,(name,'heading count',p.h1)
 assert len(p.canonical)==1,(name,'canonical')
 assert len(p.language)==1,(name,'language switch')
 for href in p.links:
  u=urlsplit(href)
  if u.scheme or u.netloc:continue
  target=(path.parent/unquote(u.path)).resolve() if u.path else path
  if target.is_dir():target=target/'index.html'
  assert target.exists(),(name,href)
  if u.fragment and target.suffix=='.html':assert unquote(u.fragment) in Page(target).ids,(name,href,'missing section')
 for section in ['community','contact','download','product','evidence']:
  if name in ['index.html','en.html']:assert section not in p.ids,(name,'homepage still contains',section)
print('12 pages: headings, language switches, canonical URLs and section links passed.')
