import { GeistSans } from "geist/font/sans";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { Toaster } from "~/components/ui/sonner";

import { api } from "~/utils/api";

import "~/styles/globals.css";

const app: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <div className={GeistSans.className}>
        <Component {...pageProps} />
      </div>
      <Toaster richColors/>
    </SessionProvider>
  );
};

export default api.withTRPC(app);
