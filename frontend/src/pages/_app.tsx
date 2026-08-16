import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { AuthProvider } from "@/lib/authContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        <title>FasalDirect - Aggregating Small-Farmer Produce for Better Pricing</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="FasalDirect aggregates up to 4 compatible smallholder Indian farmers into collective selling teams to unlock bulk buyer pricing, optimize shared transport logistics, and receive automatic wallet payouts." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen flex flex-col bg-[#f8faf9] text-slate-800">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
