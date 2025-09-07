// src/pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

// Páginas que NO requieren autenticación
const publicPages = ['/auth/signin'];

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps } 
}: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Si estamos en una página pública, no hacer nada
    if (publicPages.includes(router.pathname)) {
      return;
    }

    // Para páginas privadas, NextAuth manejará la redirección
  }, [router.pathname]);

  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}