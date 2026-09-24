import {createAccount,createClient} from '../frontend/node_modules/genlayer-js/dist/index.js';
import {studioDevnet} from '../frontend/node_modules/genlayer-js/dist/chains/index.js';
const contract=process.env.DISCLOSURE_CONTRACT||'0x752eA1c5B3b7b192019781a6392f278a959077C9';
const secret=process.env.DISCLOSURE_CLAIMANT_KEY;if(!secret)throw new Error('key required');
const account=createAccount(secret.startsWith('0x')?secret:`0x${secret}`),client=createClient({chain:studioDevnet,account}),reader=createClient({chain:studioDevnet});
const out=(x)=>JSON.stringify(x,(_,v)=>typeof v==='bigint'?v.toString():v);
async function send(label){const fees=await client.estimateTransactionFees({});const hash=await client.writeContract({address:contract,functionName:'finalize_match',args:[1],fees});console.log(`${label}.tx=${hash}`);await client.waitForTransactionReceipt({hash,waitUntil:'finalized',interval:4000,retries:300});const r=await client.getTransaction({hash});console.log(`${label}.consensus=${r.result_name||r.result}`)}
const read=(functionName,args=[])=>reader.readContract({address:contract,functionName,args,jsonSafeReturn:true});
const before=await client.getBalance({address:account.address});await send('finalize_payout');const after=await client.getBalance({address:account.address});
console.log(`balance_before=${before}`);console.log(`balance_after=${after}`);console.log(`submission=${out(await read('get_submission',[1]))}`);console.log(`bounty=${out(await read('get_bounty',[1]))}`);console.log(`totals=${out(await read('get_totals'))}`);
await send('double_finalize_rejected');console.log(`post_replay_totals=${out(await read('get_totals'))}`);
