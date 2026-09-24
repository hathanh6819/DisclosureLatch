import {createAccount,createClient} from '../frontend/node_modules/genlayer-js/dist/index.js';
import {studioDevnet,studionet} from '../frontend/node_modules/genlayer-js/dist/chains/index.js';

const useStudioDev=process.env.DISCLOSURE_NETWORK==='studio-dev';
const chain=useStudioDev?studioDevnet:studionet;
const contract=process.env.DISCLOSURE_PROBE_ADDRESS||(useStudioDev?'0x60d3f54658b15b07F29f08103317324a876CF638':'0xd172557c6Cfc249E2A9fBA5611112C21D9d67bBa');
const expected='200:38298:79d278b5c34a40ec5618d5286c983120346ebb58ccd8587339533b88e7f22e37';
const secret=process.env.DISCLOSURE_TEST_KEY;
if(!secret)throw new Error('DISCLOSURE_TEST_KEY is required');
const account=createAccount(secret.startsWith('0x')?secret:`0x${secret}`);
const client=createClient({chain,account});
console.log(`network=${useStudioDev?'studio-dev':'studionet'} chain=${chain.id}`);
console.log(`contract=${contract}`);
console.log(`caller=${account.address}`);
const fees=useStudioDev?await client.estimateTransactionFees({}):undefined;
if(fees)console.log(`feeValue=${fees.feeValue}`);
const hash=await client.writeContract({address:contract,functionName:'probe',args:[],...(fees?{fees}: {})});
console.log(`tx=${hash}`);
await client.waitForTransactionReceipt({hash,waitUntil:'finalized',interval:4000,retries:300});
const receipt=await client.getTransaction({hash});
console.log(`consensus=${receipt.result_name||receipt.result}`);
if(receipt.result_name!=='MAJORITY_AGREE'){
  console.log('match=false');
  process.exitCode=2;
}else{
  const actual=await client.readContract({address:contract,functionName:'get_latest',args:[],jsonSafeReturn:true});
  console.log(`result=${actual}`);
  console.log(`match=${actual===expected}`);
  if(actual!==expected)process.exitCode=2;
}
