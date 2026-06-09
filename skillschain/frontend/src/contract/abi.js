export const SKILLSCHAIN_ABI = [
  { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
  { "inputs": [], "name": "CredentialNotFound", "type": "error" },
  { "inputs": [], "name": "EmptyString", "type": "error" },
  { "inputs": [], "name": "InvalidAddress", "type": "error" },
  { "anonymous": false, "inputs": [
    { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
    { "indexed": true, "internalType": "address", "name": "student", "type": "address" },
    { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
    { "indexed": false, "internalType": "string", "name": "skill", "type": "string" },
    { "indexed": false, "internalType": "address", "name": "issuer", "type": "address" },
    { "indexed": false, "internalType": "uint256", "name": "ts", "type": "uint256" }
  ], "name": "CredentialIssued", "type": "event" },
  { "anonymous": false, "inputs": [
    { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
    { "indexed": true, "internalType": "address", "name": "verifier", "type": "address" },
    { "indexed": false, "internalType": "uint256", "name": "ts", "type": "uint256" }
  ], "name": "CredentialVerified", "type": "event" },
  { "inputs": [
    { "internalType": "address", "name": "student", "type": "address" },
    { "internalType": "string", "name": "name", "type": "string" },
    { "internalType": "string", "name": "skill", "type": "string" }
  ], "name": "issueCredential", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
  "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "student", "type": "address" }],
    "name": "getCredentials", "outputs": [{ "components": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "skill", "type": "string" },
      { "internalType": "address", "name": "issuer", "type": "address" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "bool", "name": "exists", "type": "bool" }
    ], "internalType": "struct SkillsChain.Credential[]", "name": "", "type": "tuple[]" }],
    "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "getCredentialById", "outputs": [{ "components": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "skill", "type": "string" },
      { "internalType": "address", "name": "issuer", "type": "address" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "bool", "name": "exists", "type": "bool" }
    ], "internalType": "struct SkillsChain.Credential", "name": "", "type": "tuple" }],
    "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "verifyCredential", "outputs": [{ "components": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "skill", "type": "string" },
      { "internalType": "address", "name": "issuer", "type": "address" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "bool", "name": "exists", "type": "bool" }
    ], "internalType": "struct SkillsChain.Credential", "name": "", "type": "tuple" }],
    "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "getTotalCredentials", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "getAllCredentialIds", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view", "type": "function" }
];

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const POLYGON_MUMBAI = {
  chainId: "0x13881",
  chainName: "Polygon Mumbai Testnet",
  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
  blockExplorerUrls: ["https://mumbai.polygonscan.com"],
};
