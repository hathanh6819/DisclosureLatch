# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import hashlib

class SecSourceProbe(gl.Contract):
    latest:str
    def __init__(self): self.latest="NOT_RUN"
    @gl.public.write
    def probe(self)->str:
        url="https://www.sec.gov/Archives/edgar/data/320193/000114036125025275/ef20051741_8k.htm"
        def fetch():
            try:
                r=gl.nondet.web.get(url,headers={"Accept":"text/html","User-Agent":"DisclosureLatch/1.0 research-contact@example.org"});body=r.body or b""
                return str(int(r.status))+":"+str(len(body))+":"+hashlib.sha256(body).hexdigest()
            except Exception:return "SOURCE_UNAVAILABLE"
        self.latest=gl.eq_principle.strict_eq(fetch);return self.latest
    @gl.public.view
    def get_latest(self)->str:return self.latest
Contract=SecSourceProbe
