import {createAccount,createClient} from '../frontend/node_modules/genlayer-js/dist/index.js';
import {studioDevnet} from '../frontend/node_modules/genlayer-js/dist/chains/index.js';

const contract=process.env.DISCLOSURE_CONTRACT||'0x752eA1c5B3b7b192019781a6392f278a959077C9';
const key=(name)=>{const v=process.env[name];if(!v)throw new Error(`${name} required`);return createAccount(v.startsWith('0x')?v:`0x${v}`)};
const sponsor=key('DISCLOSURE_SPONSOR_KEY'),claimant=key('DISCLOSURE_CLAIMANT_KEY');
const client=(account)=>createClient({chain:studioDevnet,account});
const s=client(sponsor),c=client(claimant),reader=createClient({chain:studioDevnet});
const out=(x)=>JSON.stringify(x,(_,v)=>typeof v==='bigint'?v.toString():v);
async function send(who,label,functionName,args){
  const fees=await who.estimateTransactionFees({});
  const hash=await who.writeContract({address:contract,functionName,args,fees});
  console.log(`${label}.tx=${hash}`);
  await who.waitForTransactionReceipt({hash,waitUntil:'finalized',interval:4000,retries:300});
  const receipt=await who.getTransaction({hash});
  console.log(`${label}.consensus=${receipt.result_name||receipt.result}`);
  return hash;
}
async function read(functionName,args=[]){return reader.readContract({address:contract,functionName,args,jsonSafeReturn:true})}

await send(s,'self_claim_rejected','submit_filing',[1,'0001140361-25-025275','ef20051741_8k.htm','79d278b5c34a40ec5618d5286c983120346ebb58ccd8587339533b88e7f22e37']);
console.log(`after_self_claim=${out(await read('get_submission',[1]))}`);
await send(s,'outsider_finalize_rejected','finalize_match',[1]);
console.log(`after_outsider_finalize=${out(await read('get_submission',[1]))}`);
await send(c,'replay_rejected','submit_filing',[1,'0001140361-25-025275','ef20051741_8k.htm','79d278b5c34a40ec5618d5286c983120346ebb58ccd8587339533b88e7f22e37']);
console.log(`after_replay=${out(await read('get_submission',[1]))}`);
const sub=await read('get_submission',[1]);
console.log(`challenge_deadline=${sub.challenge_deadline}`);
console.log(`current_chain_time=${Math.floor(Date.now()/1000)}`);
if(Math.floor(Date.now()/1000)<=Number(sub.challenge_deadline)){
  console.log('finalize=WAITING_FOR_SETTLEMENT_DELAY');
  process.exit(3);
}
const before=await c.getBalance({address:claimant.address});
await send(c,'finalize_payout','finalize_match',[1]);
const after=await c.getBalance({address:claimant.address});
console.log(`claimant_balance_before=${before}`);
console.log(`claimant_balance_after=${after}`);
console.log(`final_submission=${out(await read('get_submission',[1]))}`);
console.log(`final_bounty=${out(await read('get_bounty',[1]))}`);
console.log(`final_totals=${out(await read('get_totals'))}`);
await send(c,'double_finalize_rejected','finalize_match',[1]);
console.log(`post_replay_totals=${out(await read('get_totals'))}`);
