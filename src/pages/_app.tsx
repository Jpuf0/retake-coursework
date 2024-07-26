import { GeistSans } from "geist/font/sans";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { Toaster } from "~/components/ui/sonner";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import NavBar from "~/components/nav/navbar";

const app: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <div className={GeistSans.className}>
        <div className="flex h-screen flex-col">
          <NavBar />
          <Component {...pageProps} />
        </div>
      </div>
      <Toaster richColors />
    </SessionProvider>
  );
};

export default api.withTRPC(app);
