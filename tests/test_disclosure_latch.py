import hashlib, importlib.util, json, sys, types
from pathlib import Path
import pytest

SPONSOR="0x1111111111111111111111111111111111111111";HUNTER="0x2222222222222222222222222222222222222222";OTHER="0x3333333333333333333333333333333333333333"

class TreeMap(dict):
    @classmethod
    def __class_getitem__(cls,_):return cls
class U256(int):pass
class ContractBase:
    def __init_subclass__(cls,**kw):
        original=cls.__dict__.get("__init__")
        def init(self,*args,**kwargs):
            for name,kind in cls.__annotations__.items():
                if kind is TreeMap:setattr(self,name,TreeMap())
            original(self,*args,**kwargs)
        cls.__init__=init
class Write:
    def __call__(self,fn):return fn
    def payable(self,fn):return fn
class Public:
    write=Write();view=staticmethod(lambda fn:fn)
class Response:
    def __init__(self,status,body):self.status=status;self.body=body if isinstance(body,bytes) else body.encode()
class Nondet:
    def __init__(self):self.responses={};self.answer={"verdict":"MATCH","subject_match":True,"event_match":True,"time_match":True,"reason_code":"REQUIREMENT_SATISFIED"};self.web=types.SimpleNamespace(get=self.get)
    def get(self,url,headers=None):
        for key,response in self.responses.items():
            if key in url:return response
        return Response(404,b"")
    def exec_prompt(self,*_,**__):return self.answer
class Eq:
    forced=None
    def prompt_comparative(self,fn,*_,**__):return self.forced if self.forced is not None else fn()

@pytest.fixture
def runtime(monkeypatch):
    nondet=Nondet();transfers=[]
    gl=types.ModuleType("genlayer");gl.__all__=["gl","u256","TreeMap","Address"]
    gl.gl=gl;gl.Contract=ContractBase;gl.public=Public();gl.vm=types.SimpleNamespace(UserError=RuntimeError);gl.nondet=nondet;gl.eq_principle=Eq();gl.message=types.SimpleNamespace(sender_address=SPONSOR,value=0);gl.message_raw={"datetime":"2026-09-24T00:00:00+00:00"}
    gl.get_contract_at=lambda address:types.SimpleNamespace(emit_transfer=lambda value:transfers.append((str(address).lower(),int(value))))
    def contract_interface(_cls):
        class Proxy:
            def __init__(self,address):self.address=address
            def emit_transfer(self,value):return gl.get_contract_at(self.address).emit_transfer(value=value)
        return Proxy
    gl.evm=types.SimpleNamespace(contract_interface=contract_interface)
    gl.u256=U256;gl.TreeMap=TreeMap;gl.Address=lambda value:value
    monkeypatch.setitem(sys.modules,"genlayer",gl)
    spec=importlib.util.spec_from_file_location("disclosure_latch_test",Path("contracts/disclosure_latch.py"));module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    return module.DisclosureLatch(),gl,nondet,transfers

def set_sender(gl,address,value=0):gl.message.sender_address=address;gl.message.value=value
def create(c,gl,value=10**18):
    set_sender(gl,SPONSOR,value)
    return c.create_bounty("COO succession disclosure","Confirm a planned COO succession naming the successor and the outgoing executive's transition duties.","0000320193","8-K",1700000000,1800000000,86400,300)
def submit(c,gl,body=b"official filing",digest=None,accession="0001140361-25-025275"):
    set_sender(gl,HUNTER);return c.submit_filing(U256(1),accession,"ef20051741_8k.htm",digest or hashlib.sha256(body).hexdigest())
def sources(n,body=b"official filing"):
    n.responses={"index-headers":Response(200,"0000320193 0001140361-25-025275 ef20051741_8k.htm 8-K"),"ef20051741_8k.htm":Response(200,body)}

def test_permissionless_sponsor_and_separation(runtime):
    c,gl,_,_=runtime;set_sender(gl,OTHER,10**18)
    assert int(c.create_bounty("valid title","x"*50,"0000320193","8-K",1,2,3600,300))==1
    assert c.get_bounty(U256(1))["sponsor"]==OTHER
    assert c.submit_filing(U256(1),"0001140361-25-025275","ef20051741_8k.htm","0"*64)=="SPONSOR_CANNOT_CLAIM"

def test_happy_path_real_custody_and_payout(runtime):
    c,gl,n,transfers=runtime;assert int(create(c,gl))==1;body=b"official filing";assert int(submit(c,gl,body))==1;sources(n,body)
    assert c.assess_submission(U256(1),U256(1))=="MATCH_PENDING"
    assert c.finalize_match(U256(1))=="NOT_FINALIZABLE"
    gl.message_raw["datetime"]="2026-09-24T00:06:00+00:00";set_sender(gl,HUNTER)
    assert c.finalize_match(U256(1))=="PAID";assert transfers[-1]==(HUNTER,10**18)
    assert c.get_totals()=={"bounties":1,"submissions":1,"locked_wei":"0","paid_wei":str(10**18),"refunded_wei":"0"}
    assert c.finalize_match(U256(1))=="NOT_FINALIZABLE"

def test_digest_mismatch_retries_then_refund(runtime):
    c,gl,n,transfers=runtime;create(c,gl);submit(c,gl,b"expected");sources(n,b"changed")
    assert c.assess_submission(U256(1),U256(1))=="UNRESOLVED"
    assert c.retry_unresolved(U256(1),U256(1))=="STALE_REVISION"
    assert c.retry_unresolved(U256(1),U256(2))=="CLAIMED"
    assert c.assess_submission(U256(1),U256(2))=="UNRESOLVED"
    set_sender(gl,SPONSOR);assert c.recover_bounty(U256(1))=="REFUNDED";assert transfers[-1]==(SPONSOR,10**18)

def test_not_match_reopens_and_accession_replay_blocked(runtime):
    c,gl,n,_=runtime;create(c,gl);body=b"unrelated filing";submit(c,gl,body);sources(n,body);n.answer={"verdict":"NOT_MATCH","subject_match":True,"event_match":False,"time_match":True,"reason_code":"EVENT_MISMATCH"}
    assert c.assess_submission(U256(1),U256(1))=="NOT_MATCH" and c.get_bounty(U256(1))["status"]=="OPEN"
    assert submit(c,gl,body)=="ACCESSION_ALREADY_USED"

def test_provenance_and_model_contradiction_fail_closed(runtime):
    c,gl,n,_=runtime;create(c,gl);body=b"official filing";submit(c,gl,body)
    n.responses={"index-headers":Response(200,"wrong object"),"ef20051741_8k.htm":Response(200,body)}
    assert c.assess_submission(U256(1),U256(1))=="UNRESOLVED"

def test_model_contradiction_fails_closed(runtime):
    c,gl,n,_=runtime;create(c,gl);body=b"official filing";submit(c,gl,body);sources(n,body)
    n.answer={"verdict":"MATCH","subject_match":True,"event_match":False,"time_match":True,"reason_code":"REQUIREMENT_SATISFIED"}
    assert c.assess_submission(U256(1),U256(1))=="UNRESOLVED"
    assert c.get_submission(U256(1))["reason"]=="MODEL_CONTRADICTION"

def test_consensus_conflict_or_malformed_output_fails_closed(runtime):
    c,gl,n,_=runtime;create(c,gl);body=b"official filing";submit(c,gl,body);sources(n,body)
    gl.eq_principle.forced='{"conflicting":"validator outputs"}'
    assert c.assess_submission(U256(1),U256(1))=="UNRESOLVED"
    assert c.get_submission(U256(1))["reason"]=="UNRESOLVED"

def test_outsider_cannot_consume_assessment_or_retry_budget(runtime):
    c,gl,n,_=runtime;create(c,gl);body=b"official filing";submit(c,gl,body);sources(n,body)
    set_sender(gl,OTHER)
    assert c.assess_submission(U256(1),U256(1))=="ONLY_PARTICIPANT"
    assert c.get_submission(U256(1))["attempts"]==0
    set_sender(gl,HUNTER);n.responses={}
    assert c.assess_submission(U256(1),U256(1))=="UNRESOLVED"
    set_sender(gl,OTHER)
    assert c.retry_unresolved(U256(1),U256(2))=="ONLY_PARTICIPANT"
    assert c.assess_submission(U256(1),U256(2))=="ONLY_PARTICIPANT"
    assert c.get_submission(U256(1))["attempts"]==1

def test_invalid_payable_inputs_are_returned(runtime):
    c,gl,_,transfers=runtime;set_sender(gl,SPONSOR,10**18)
    assert c.create_bounty("x","too short","bad","?",2,1,1,1)=="INVALID_TEXT"
    assert transfers[-1]==(SPONSOR,10**18) and c.get_totals()["locked_wei"]=="0"

def test_only_bounty_sponsor_can_recover(runtime):
    c,gl,_,transfers=runtime;create(c,gl);gl.message_raw["datetime"]="2026-09-26T00:00:00+00:00"
    set_sender(gl,OTHER);assert c.recover_bounty(U256(1))=="ONLY_BOUNTY_SPONSOR"
    set_sender(gl,SPONSOR);assert c.recover_bounty(U256(1))=="REFUNDED"
    assert transfers[-1]==(SPONSOR,10**18)

def test_economic_conservation_across_independent_bounties(runtime):
    c,gl,_,transfers=runtime
    assert int(create(c,gl,2*10**18))==1
    set_sender(gl,OTHER,3*10**18)
    assert int(c.create_bounty("Second bounty","y"*50,"0000320193","8-K",1,2,3600,300))==2
    assert c.get_totals()["locked_wei"]==str(5*10**18)
    gl.message_raw["datetime"]="2026-09-26T00:00:00+00:00"
    set_sender(gl,SPONSOR);assert c.recover_bounty(U256(1))=="REFUNDED"
    set_sender(gl,OTHER);assert c.recover_bounty(U256(2))=="REFUNDED"
    totals=c.get_totals()
    assert totals["locked_wei"]=="0" and totals["refunded_wei"]==str(5*10**18)
    assert transfers[-2:]==[(SPONSOR,2*10**18),(OTHER,3*10**18)]

def test_rejected_payable_call_cannot_increase_liability(runtime):
    c,gl,_,transfers=runtime;set_sender(gl,OTHER,10**14)
    assert c.create_bounty("valid title","z"*50,"0000320193","8-K",1,2,3600,300)=="BOUNTY_TOO_SMALL"
    assert c.get_totals()=={"bounties":0,"submissions":0,"locked_wei":"0","paid_wei":"0","refunded_wei":"0"}
    assert transfers==[(OTHER,10**14)]
