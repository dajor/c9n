"""Validate curated public links and keep application data out of this repository."""
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit
root=Path(__file__).resolve().parents[1]
errors=[]
for p in root.rglob('*'):
    if not p.is_file() or '.git' in p.parts:continue
    if p.suffix in {'.sqlite','.db','.pem','.key'} or p.name.startswith('.env'):
        errors.append(f'Forbidden private artifact: {p.relative_to(root)}')
    if p.suffix not in {'.md','.html','.css','.yml','.py','.txt','.csv'}:continue
    text=p.read_text()
    if re.search(r'gh[pousr]_[A-Za-z0-9]{30,}|sk-(?:proj-)?[A-Za-z0-9_-]{35,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',text):
        errors.append(f'Possible secret: {p.relative_to(root)}')
    if p.suffix=='.md': links=re.findall(r'!?\[[^\]]*\]\(([^)]+)\)',text)
    elif p.suffix=='.html':links=re.findall(r'(?:href|src)="([^"]+)"',text)
    else:links=[]
    for link in links:
        parsed=urlsplit(link)
        if parsed.scheme or link.startswith('#'):continue
        target=(p.parent/unquote(parsed.path)).resolve()
        if not target.is_relative_to(root) or not target.exists():errors.append(f'Broken local link in {p.relative_to(root)}: {link}')
if errors:raise SystemExit('\n'.join(errors))
print('Public artifact checks passed: local links, scope and obvious secret patterns.')
