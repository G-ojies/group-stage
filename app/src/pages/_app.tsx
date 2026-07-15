import type { AppProps } from "next/app";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import dynamic from "next/dynamic";
import Aurora from "@/components/Aurora";
import "@/styles/globals.css";

// Wallet provider touches browser APIs, so load it client-side only.
const AppWalletProvider = dynamic(() => import("@/components/WalletProvider"), { ssr: false });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`font-root ${GeistSans.variable} ${GeistMono.variable}`}>
      <Aurora />
      <AppWalletProvider>
        <Component {...pageProps} />
      </AppWalletProvider>
    </div>
  );
}
