import { ethers } from "ethers";

const SDK_ABI = [
  "function getCredentials(address student) view returns (tuple(string name, string skill, address issuer, uint256 timestamp, uint256 id, bool exists)[])",
  "function getCredentialById(uint256 id) view returns (tuple(string name, string skill, address issuer, uint256 timestamp, uint256 id, bool exists))",
  "function verifyCredential(uint256 id) returns (tuple(string name, string skill, address issuer, uint256 timestamp, uint256 id, bool exists))",
  "function issueCredential(address student, string name, string skill) returns (uint256)",
  "function getTotalCredentials() view returns (uint256)",
];

function fmt(c) { return { id: Number(c.id), name: c.name, skill: c.skill, issuer: c.issuer, timestamp: new Date(Number(c.timestamp)*1000).toISOString(), exists: c.exists }; }

export async function verifyCredential(addr, id, provider) { return fmt(await new ethers.Contract(addr, SDK_ABI, provider).verifyCredential(id)); }
export async function getCredentials(addr, wallet, provider) { return (await new ethers.Contract(addr, SDK_ABI, provider).getCredentials(wallet)).map(fmt); }
export async function getCredentialById(addr, id, provider) { return fmt(await new ethers.Contract(addr, SDK_ABI, provider).getCredentialById(id)); }
export async function getTotalCredentials(addr, provider) { return Number(await new ethers.Contract(addr, SDK_ABI, provider).getTotalCredentials()); }
export function createProvider(url = "https://rpc-mumbai.maticvigil.com") { return new ethers.JsonRpcProvider(url); }
export async function getSigner() { if (!window.ethereum) throw new Error("MetaMask required"); const p = new ethers.BrowserProvider(window.ethereum); await p.send("eth_requestAccounts",[]); return p.getSigner(); }
