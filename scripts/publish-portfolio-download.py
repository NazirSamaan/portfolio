"""Publish the oversized coursework archive using the existing Git credential.

Credentials are kept in memory and are never written to disk or printed.
"""
import json
import os
from pathlib import Path
import subprocess
import urllib.error
import urllib.request

REPO = 'NazirSamaan/portfolio'
TAG = 'portfolio-assets-v1'
ROOT = Path(__file__).resolve().parents[1]
path = ROOT / 'public/portfolio/files/website-design-2.zip'
os.environ['GIT_TERMINAL_PROMPT'] = '0'
result = subprocess.run(['git','credential','fill'], input='protocol=https\nhost=github.com\n\n',text=True,capture_output=True,check=True,timeout=30)
credential = dict(line.split('=',1) for line in result.stdout.splitlines() if '=' in line)
headers = {'Authorization':'Bearer '+credential['password'],'Accept':'application/vnd.github+json','User-Agent':'portfolio-publisher','X-GitHub-Api-Version':'2022-11-28'}

def api(route, data=None, method=None):
    request = urllib.request.Request('https://api.github.com/repos/'+REPO+route, data=json.dumps(data).encode() if data is not None else None, headers=headers,method=method)
    with urllib.request.urlopen(request,timeout=60) as response:
        return json.load(response)

releases = api('/releases')
release = next((r for r in releases if r['tag_name'] == TAG),None)
if release is None:
    release = api('/releases',{'tag_name':TAG,'name':'Portfolio project downloads','body':'Original coursework files linked from the portfolio website. The college website archive includes the original video assets.','draft':True})
existing = next((a for a in release['assets'] if a['name'] == path.name and a['size'] == path.stat().st_size),None)
if existing is None:
    print('Uploading college project archive to GitHub Releases...',flush=True)
    class ProgressFile:
        def __init__(self, stream): self.stream=stream;self.sent=0;self.next=50*1024*1024
        def read(self, amount):
            block=self.stream.read(amount);self.sent+=len(block)
            if self.sent >= self.next:
                print(f'Uploaded {self.sent//1024//1024} MB',flush=True);self.next+=50*1024*1024
            return block
    with path.open('rb') as stream:
        request = urllib.request.Request(release['upload_url'].split('{')[0]+'?name='+path.name,data=ProgressFile(stream),headers={**headers,'Content-Type':'application/zip','Content-Length':str(path.stat().st_size)},method='POST')
        with urllib.request.urlopen(request,timeout=600) as response:
            existing = json.load(response)
if existing['size'] != path.stat().st_size:
    raise RuntimeError('Uploaded archive size does not match the original')
if release['draft']:
    api('/releases/'+str(release['id']),{'draft':False},method='PATCH')
manifest = ROOT / 'src/portfolioArchive.json'
entries = json.loads(manifest.read_text())
next(item for item in entries if item['id'] == 'website-design-2')['file'] = existing['browser_download_url']
manifest.write_text(json.dumps(entries,indent=2),encoding='utf-8')
print('Verified download: '+existing['browser_download_url'],flush=True)
