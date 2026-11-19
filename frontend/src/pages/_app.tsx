import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { AuthProvider } from "@/lib/authContext";
import { RouteGuard } from "@/components/RouteGuard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LandingTicker } from "@/components/LandingTicker";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAuthPage = router.pathname === "/login" || router.pathname === "/register";

  return (
    <AuthProvider>
      <Head>
        <title>FasalDirect - Aggregating Small-Farmer Produce for Better Pricing</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="FasalDirect aggregates up to 4 compatible smallholder Indian farmers into collective selling teams to unlock bulk buyer pricing, optimize shared transport logistics, and receive automatic wallet payouts." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`min-h-screen flex flex-col ${isAuthPage ? "bg-slate-950/20" : "bg-[#f8faf9]"} text-slate-800`}>
        <Navbar />
        {router.pathname === "/" && <LandingTicker />}
        <main className={`flex-1 w-full ${isAuthPage ? "max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex flex-col justify-center" : "max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-10"}`}>
          <RouteGuard>
            <Component {...pageProps} />
          </RouteGuard>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
