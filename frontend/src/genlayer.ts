import {createClient} from 'genlayer-js';
import {studioDevnet} from 'genlayer-js/chains';

export const CONTRACT=(import.meta.env.VITE_CONTRACT_ADDRESS||'0x752eA1c5B3b7b192019781a6392f278a959077C9').trim();
export const configured=/^0x[a-fA-F0-9]{40}$/.test(CONTRACT);
export const explorer=configured?`https://explorer-studio-dev.genlayer.com/address/${CONTRACT}`:'';
export const reader=createClient({chain:studioDevnet});
export const writer=()=>{if(!window.ethereum)throw Error('Install and connect an injected wallet on GenLayer Studio Next.');return createClient({chain:studioDevnet,provider:window.ethereum})};
export const short=(v:string)=>v?`${v.slice(0,6)}...${v.slice(-4)}`:'Not deployed';
export const genToWei=(v:string)=>BigInt(Math.round(Number(v)*1e6))*10n**12n;
export const txUrl=(hash:string)=>`https://explorer-studio-dev.genlayer.com/tx/${hash}`;
export const normalizeTx=(v:unknown)=>typeof v==='string'?v:String((v as {txId?:string})?.txId||'');
