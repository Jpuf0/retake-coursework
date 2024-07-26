import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";

const SignedIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  return session ? <>{children}</> : null;
};

const SignedOut: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  return session ? null : <>{children}</>;
};

const RedirectToSignIn = () => {
  const { data: session } = useSession();
  useEffect(() => {
    if (session === null) {
      void signIn();
    }
  })
}

export { SignedIn, SignedOut, RedirectToSignIn };