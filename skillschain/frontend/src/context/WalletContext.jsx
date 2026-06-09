import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { SKILLSCHAIN_ABI, CONTRACT_ADDRESS, POLYGON_MUMBAI } from "../contract/abi";

const WalletContext = createContext(null);
export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
};

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [balance, setBalance] = useState(null);

  const switchToMumbai = useCallback(async () => {
    try {
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: POLYGON_MUMBAI.chainId }] });
    } catch (e) {
      if (e.code === 4902) await window.ethereum.request({ method: "wallet_addEthereumChain", params: [POLYGON_MUMBAI] });
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) { toast.error("Please install MetaMask"); return; }
    setConnecting(true);
    try {
      const [addr] = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(addr);
      const p = new ethers.BrowserProvider(window.ethereum);
      const s = await p.getSigner();
      setProvider(p);
      setSigner(s);
      const bal = await p.getBalance(addr);
      setBalance(ethers.formatEther(bal));
      toast.success("Wallet connected!");
    } catch (e) {
      if (e.code !== 4001) toast.error("Failed to connect wallet");
    } finally { setConnecting(false); }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccount(null); setProvider(null); setSigner(null);
    setBalance(null);
    toast("Wallet disconnected", { icon: "🔌" });
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    const onAcc = (a) => { a.length === 0 ? disconnectWallet() : connectWallet(); };
    const onChain = () => window.location.reload();
    window.ethereum.on("accountsChanged", onAcc);
    window.ethereum.on("chainChanged", onChain);
    return () => { window.ethereum.removeListener("accountsChanged", onAcc); window.ethereum.removeListener("chainChanged", onChain); };
  }, [connectWallet, disconnectWallet]);

  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.request({ method: "eth_accounts" }).then(a => { if (a.length > 0) connectWallet(); }).catch(() => {});
  }, [connectWallet]);

  return (
    <WalletContext.Provider value={{ account, provider, signer, connecting, balance, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
}
