import { signIn, useSession } from "next-auth/react";
import Router from "next/router";
import { Button } from "~/components/ui/button";

export default function Home() {
  const { data: session } = useSession();

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Project Management App
          </h1>
          <div className="grid gap-4 grid-rows-1">
            <Button
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
              onClick={() => signIn()}
            >
              {
                session ? (
                  <h3 className="text-2xl font-bold">Log out →</h3>
                ) : (
                  <h3 className="text-2xl font-bold">Log in →</h3>
                )
              }
            </Button>
            { session && (
              <Button
                className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
                onClick={() => Router.push("/projects")}
              >
                <h3 className="text-2xl font-bold">Projects →</h3>
              </Button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}