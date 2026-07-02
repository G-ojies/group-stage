import type { AppProps } from "next/app";
import { Inter, Space_Grotesk } from "next/font/google";
import dynamic from "next/dynamic";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });

// Wallet provider touches browser APIs — load client-side only.
const AppWalletProvider = dynamic(() => import("@/components/WalletProvider"), { ssr: false });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${inter.variable} ${grotesk.variable}`}>
      <AppWalletProvider>
        <Component {...pageProps} />
      </AppWalletProvider>
    </div>
  );
}
