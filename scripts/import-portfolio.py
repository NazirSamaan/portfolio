"""Build a static portfolio catalogue without changing the original coursework.

OOXML text and embedded pictures are read without running macros or source code.
Unsupported native formats receive an explicitly labelled file cover.
"""
from pathlib import Path
import html
import json
import re
import shutil
import textwrap
import zipfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'Portfolio'
OUT = ROOT / 'public' / 'portfolio'
(OUT / 'previews').mkdir(parents=True, exist_ok=True)
(OUT / 'files').mkdir(exist_ok=True)

def slug(value):
    return re.sub(r'[^a-z0-9]+', '-', value.lower()).strip('-')

def xml_text(z, name):
    root = ET.fromstring(z.read(name))
    return [x.text.strip() for x in root.iter() if x.tag.split('}')[-1] in ('t',) and x.text and x.text.strip()]

def excerpt(path):
    try:
        with zipfile.ZipFile(path) as z:
            if path.suffix == '.docx':
                return xml_text(z, 'word/document.xml')[:45]
            if path.suffix in ('.pptm', '.pptx'):
                slides = sorted(n for n in z.namelist() if re.match(r'ppt/slides/slide\d+.xml$', n))
                return [t for n in slides[:3] for t in xml_text(z, n)][:30]
            if path.suffix == '.xlsx':
                sheets = ET.fromstring(z.read('xl/workbook.xml'))
                names = [n.attrib['name'] for n in sheets.iter() if n.tag.endswith('}sheet')]
                # Display worksheet names; never expose customer/student row data.
                return ['Workbook worksheets'] + names
    except (zipfile.BadZipFile, KeyError, ET.ParseError):
        pass
    return []

def cover(target, title, kind, lines, category):
    bg = '#e9efdc' if category == 'Data Analytics' else '#ecebe3'
    rows = []
    y = 170
    for line in lines[:12]:
        for part in textwrap.wrap(line, 64)[:2]:
            rows.append(f'<text x="65" y="{y}" font-size="16" fill="#505548">{html.escape(part)}</text>')
            y += 27
        if y > 420:
            break
    titles = textwrap.wrap(title, 32)[:2]
    if not rows:
        rows = [f'<text x="65" y="{185+i*49}" font-size="32" fill="#30382a">{html.escape(t)}</text>' for i,t in enumerate(titles)]
    label = 'DOCUMENT EXCERPT' if lines and kind in ('DOCX', 'PPTM', 'PPTX') else 'WORKSHEET INDEX' if lines and kind == 'XLSX' else 'FILE COVER / ORIGINAL AVAILABLE'
    target.write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560"><rect width="900" height="560" fill="{bg}"/><rect x="30" y="30" width="840" height="500" rx="5" fill="#fafbf6"/><g font-family="Arial,sans-serif"><text x="65" y="81" font-size="12" letter-spacing="2" fill="#64734c">{label}</text><path d="M65 107H835" stroke="#d6dccb"/>{''.join(rows)}<text x="65" y="485" font-size="12" fill="#68705f">{html.escape(category.upper())}</text><text x="835" y="485" text-anchor="end" font-size="18" fill="#3f5030">{kind}</text></g></svg>''', encoding='utf-8')

def preview(path, ident, title, category):
    ext = path.suffix.lower()
    if ext in ('.jpg', '.jpeg', '.png'):
        dest = OUT / 'previews' / (ident + ext)
        shutil.copy2(path, dest)
        return 'portfolio/previews/' + dest.name, 'Original image'
    if ext in ('.docx', '.pptm', '.pptx'):
        with zipfile.ZipFile(path) as z:
            images = [n for n in z.namelist() if '/media/' in n and n.lower().endswith(('.png','.jpeg','.jpg'))]
            if images:
                chosen = max(images, key=lambda n:z.getinfo(n).file_size)
                dest = OUT / 'previews' / (ident + Path(chosen).suffix)
                dest.write_bytes(z.read(chosen))
                return 'portfolio/previews/' + dest.name, 'Image from original document'
    dest = OUT / 'previews' / (ident + '.svg')
    lines = excerpt(path) if ext in ('.docx','.xlsx','.pptm','.pptx') else []
    cover(dest, title, ext[1:].upper(), lines, category)
    return 'portfolio/previews/' + dest.name, 'Worksheet index' if ext == '.xlsx' else 'Document excerpt' if lines else 'File cover'

entries = []
grouped = ['Programming Assignment','Website Design 1','Website Design 2']
ignored = {'.vs','bin','obj'}
for path in sorted(SOURCE.rglob('*')):
    if not path.is_file() or any(p in ignored for p in path.relative_to(SOURCE).parts):
        continue
    rel = path.relative_to(SOURCE)
    if rel.parts[0] in grouped or path.suffix == '.sln':
        continue
    ident = slug(str(rel))
    title = path.stem.replace('.docx','')
    category = 'Data Analytics' if path.suffix.lower() in ('.xlsx','.pbix','.accdb','.mdb','.drawio') or rel.parts[0] in ('Basic Database','Database Assignment','Miss Den') or title == 'DatabaseSDLC' else 'Software Development'
    image, note = preview(path, ident, title, category)
    dest = OUT / 'files' / (ident + path.suffix.lower())
    shutil.copy2(path, dest)
    entry = dict(id=ident,title=title,category=category,type=path.suffix[1:].upper(),image=image,previewNote=note,file='portfolio/files/'+dest.name,size=path.stat().st_size,source=str(rel).replace('\\','/'))
    if path.suffix == '.mp4': entry['video'] = entry['file']
    if path.suffix == '.txt':
        value = path.read_text().strip()
        if value.startswith('https://'): entry['website'] = value
    entries.append(entry)

for folder, title in [('Programming Assignment','Student & subject management'),('Website Design 1','Kingdom Rides Cycling Club'),('Website Design 2','Bright Master College')]:
    directory = SOURCE / folder
    ident = slug(folder)
    showcase = folder == 'Website Design 2'
    dest = OUT / 'files' / (ident + ('-showcase.zip' if showcase else '.zip'))
    files = [p for p in directory.rglob('*') if p.is_file() and not any(x in ignored for x in p.relative_to(directory).parts)]
    if showcase:
        files = [p for p in files if p.suffix.lower() not in ('.mp4', '.mov', '.avi')]
    with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED,compresslevel=1) as z:
        for path in files: z.write(path,str(path.relative_to(SOURCE)))
        if folder == 'Programming Assignment':
            z.write(SOURCE / 'Programming Assignment.sln','Programming Assignment.sln')
        if showcase:
            z.writestr('SHOWCASE-README.txt', 'Bright Master College website showcase\n\nIncludes the original HTML pages, CSS, JavaScript, images, and fonts.\nOpen Website Design 2/home.html to view the site.\nLarge original video assets are omitted from this showcase download.\n')
    screenshot = OUT / 'previews' / (ident + '.png')
    image = screenshot if screenshot.exists() else OUT / 'previews' / (ident + '.svg')
    if not screenshot.exists():
        cover(image,title,'C#' if folder == 'Programming Assignment' else 'HTML / CSS',[], 'Software Development')
    entries.append(dict(id=ident,title=title,category='Software Development',type='ZIP',image='portfolio/previews/'+image.name,previewNote='Website screenshot' if screenshot.exists() else 'Source project cover',file='portfolio/files/'+dest.name,size=dest.stat().st_size,source=folder,fileCount=len(files)))

entries.sort(key=lambda x: (0 if x['previewNote'] == 'Website screenshot' else 1 if x['previewNote'] in ('Original image','Image from original document') else 2 if x['type'] in ('XLSX','PBIX') else 3, x['title']))
(ROOT / 'src' / 'portfolioArchive.json').write_text(json.dumps(entries,indent=2),encoding='utf-8')
print(f'Imported {len(entries)} portfolio entries. Original folders remain unchanged.')
