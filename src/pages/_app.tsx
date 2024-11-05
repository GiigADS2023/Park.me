import SidebarProvider from "@/components/SidebarContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head"; // Adicione essa importação

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Park.Me</title>
        <link rel="shortcut icon" href="/favicon.png" type="image/x-icon" /> {/* Move o favicon para cá */}
      </Head>
      <SidebarProvider>
        <Component {...pageProps} />
      </SidebarProvider>
    </>
  );
}