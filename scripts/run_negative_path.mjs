import {createAccount,createClient} from '../frontend/node_modules/genlayer-js/dist/index.js';
import {studioDevnet} from '../frontend/node_modules/genlayer-js/dist/chains/index.js';
const contract='0x752eA1c5B3b7b192019781a6392f278a959077C9';
const get=(n)=>{const v=process.env[n];if(!v)throw Error(`${n} required`);return createAccount(v.startsWith('0x')?v:`0x${v}`)};
const sponsor=get('DISCLOSURE_SPONSOR_KEY'),claimant=get('DISCLOSURE_CLAIMANT_KEY'),s=createClient({chain:studioDevnet,account:sponsor}),c=createClient({chain:studioDevnet,account:claimant}),r=createClient({chain:studioDevnet});
const out=(v)=>JSON.stringify(v,(_,x)=>typeof x==='bigint'?x.toString():x),read=(fn,args=[])=>r.readContract({address:contract,functionName:fn,args,jsonSafeReturn:true});
async function send(client,label,fn,args,value=0n){const fees=await client.estimateTransactionFees({});const hash=await client.writeContract({address:contract,functionName:fn,args,value,fees});console.log(`${label}.tx=${hash}`);await client.waitForTransactionReceipt({hash,waitUntil:'finalized',interval:4000,retries:300});const x=await client.getTransaction({hash});console.log(`${label}.consensus=${x.result_name||x.result}`);return hash}
const t=await read('get_totals'),bid=Number(t.bounties)+1,sid=Number(t.submissions)+1;
await send(s,'negative_create','create_bounty',['Unrelated acquisition disclosure','Confirm that Apple disclosed a completed acquisition of a Martian mining company and transferred ownership on the filing date.','0000320193','8-K',1700000000,1800000000,86400,300],10n**16n);
await send(c,'negative_submit','submit_filing',[bid,'0001140361-25-025275','ef20051741_8k.htm','79d278b5c34a40ec5618d5286c983120346ebb58ccd8587339533b88e7f22e37']);
await send(s,'negative_assess','assess_submission',[sid,1]);console.log(`submission=${out(await read('get_submission',[sid]))}`);console.log(`bounty=${out(await read('get_bounty',[bid]))}`);
