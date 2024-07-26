import { signIn, signOut, useSession } from "next-auth/react";
import Router from "next/router";
import { SignedIn, SignedOut } from "~/components/auth/controlComponents";
import { Button } from "~/components/ui/button";

export default function Home() {
  const { data: session } = useSession();

  return (
    <>
      <main className="flex h-full flex-grow flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Project Management App
          </h1>
          <div className="mt-4 grid gap-4">
            <SignedIn>
              <Button
                className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
                onClick={() => signOut()}
              >
                <h3 className="text-2xl font-bold">Log out →</h3>
              </Button>
              <Button
                className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
                onClick={() =>
                  Router.push(`/user/${session!.user.name}/projects`)
                }
              >
                <h3 className="text-2xl font-bold">Projects →</h3>
              </Button>
            </SignedIn>
            <SignedOut>
              <Button
                className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
                onClick={() => signIn()}
              >
                <h3 className="text-2xl font-bold">Log in →</h3>
              </Button>
            </SignedOut>
          </div>
        </div>
      </main>
    </>
  );
}
