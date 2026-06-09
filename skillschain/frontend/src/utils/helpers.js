export function shortenAddress(addr, chars = 4) {
  if (!addr) return "";
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`;
}

export function getExplorerUrl(txHash) {
  return `https://mumbai.polygonscan.com/tx/${txHash}`;
}

export function getAddressExplorerUrl(addr) {
  return `https://mumbai.polygonscan.com/address/${addr}`;
}

export function formatDate(ts) {
  const d = new Date(Number(ts) * 1000);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export async function copyToClipboard(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch { const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); document.execCommand("copy"); document.body.removeChild(t); return true; }
}

export function isValidAddress(addr) {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}
