import {createAccount,createClient} from '../frontend/node_modules/genlayer-js/dist/index.js';
import {studioDevnet} from '../frontend/node_modules/genlayer-js/dist/chains/index.js';

const contract=process.env.DISCLOSURE_CONTRACT||'0x752eA1c5B3b7b192019781a6392f278a959077C9';
const sponsorSecret=process.env.DISCLOSURE_SPONSOR_KEY;
const claimantSecret=process.env.DISCLOSURE_CLAIMANT_KEY;
if(!sponsorSecret||!claimantSecret)throw new Error('Both test keys are required');
const account=(secret)=>createAccount(secret.startsWith('0x')?secret:`0x${secret}`);
const sponsor=account(sponsorSecret),claimant=account(claimantSecret);
const sponsorClient=createClient({chain:studioDevnet,account:sponsor});
const claimantClient=createClient({chain:studioDevnet,account:claimant});
const reader=createClient({chain:studioDevnet});
const out=(x)=>JSON.stringify(x,(_,v)=>typeof v==='bigint'?v.toString():v);

async function send(client,label,functionName,args,value=0n){
  const fees=await client.estimateTransactionFees({});
  const hash=await client.writeContract({address:contract,functionName,args,value,fees});
  console.log(`${label}.tx=${hash}`);
  await client.waitForTransactionReceipt({hash,waitUntil:'finalized',interval:4000,retries:300});
  const receipt=await client.getTransaction({hash});
  console.log(`${label}.consensus=${receipt.result_name||receipt.result}`);
  if(receipt.result_name!=='MAJORITY_AGREE')throw new Error(`${label} failed consensus`);
  return hash;
}
async function read(functionName,args=[]){return reader.readContract({address:contract,functionName,args,jsonSafeReturn:true})}

console.log(`sponsor=${sponsor.address}`);
console.log(`claimant=${claimant.address}`);
const initial=await read('get_totals');
const bid=Number(initial.bounties)+1;
await send(sponsorClient,'create_bounty','create_bounty',[
  'Apple COO succession disclosure',
  "Confirm a planned COO succession naming the successor and the outgoing executive's transition duties.",
  '0000320193','8-K',1700000000,1800000000,86400,300
],10n**16n);
console.log(`bounty=${out(await read('get_bounty',[bid]))}`);
const beforeSubmit=await read('get_totals');
const sid=Number(beforeSubmit.submissions)+1;
await send(claimantClient,'submit_filing','submit_filing',[
  bid,'0001140361-25-025275','ef20051741_8k.htm','79d278b5c34a40ec5618d5286c983120346ebb58ccd8587339533b88e7f22e37'
]);
console.log(`submission=${out(await read('get_submission',[sid]))}`);
await send(sponsorClient,'assess_submission','assess_submission',[sid,1]);
console.log(`assessed=${out(await read('get_submission',[sid]))}`);
console.log(`totals=${out(await read('get_totals'))}`);
console.log(`ids=${out({bountyId:bid,submissionId:sid})}`);
