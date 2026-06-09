import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { WalletProvider } from "./context/WalletContext";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <WalletProvider>
        <App />
        <Toaster position="top-right" toastOptions={{
          style: { background: "#1A1A2E", color: "#fff", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "12px" },
          success: { iconTheme: { primary: "#10B981", secondary: "#1A1A2E" } },
          error: { iconTheme: { primary: "#EF4444", secondary: "#1A1A2E" } },
        }} />
      </WalletProvider>
    </BrowserRouter>
  </React.StrictMode>
);
