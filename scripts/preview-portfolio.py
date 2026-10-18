"""Local QA server for a CRA build hosted at its configured /portfolio/ path."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(Path(__file__).resolve().parents[1] / 'build'), **kwargs)

    def do_GET(self):
        if self.path.startswith('/_qa'):
            body = b'''<html><head><style>html,body{margin:0}iframe{width:100%;height:100vh;border:0}</style></head><body><iframe src="/portfolio/"></iframe><script>setInterval(()=>{const f=document.querySelector('iframe');const d=f.contentDocument;const params=new URLSearchParams(location.search);const mode=params.get('theme');const site=d.querySelector('.site');if(site&&mode&&site.classList.contains('light')!==(mode==='light'))d.querySelector('.theme-toggle').click();const project=params.get('project');if(project!==null&&!d.querySelector('[role=dialog]'))d.querySelectorAll('.project-card')[Number(project)]?.click();const target=params.get('section')||'experience';const el=d.querySelector('#'+target);if(el){d.documentElement.style.scrollBehavior='auto';f.contentWindow.scrollTo(0,el.offsetTop-80)}},300)</script></body></html>'''
            if self.path.startswith('/_qa-mobile'):
                body = body.replace(b'width:100%;height:100vh', b'width:390px;height:100vh')
            self.send_response(200)
            self.send_header('Content-Type','text/html')
            self.end_headers()
            self.wfile.write(body)
            return
        if self.path.startswith('/portfolio/'):
            self.path = self.path[len('/portfolio'):]
        super().do_GET()

ThreadingHTTPServer(('127.0.0.1', 8765), Handler).serve_forever()
