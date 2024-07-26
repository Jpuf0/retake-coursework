import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
  NavigationMenuContent,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import { SignedIn } from "../auth/controlComponents";
import { api } from "~/utils/api";
import { cn } from "~/lib/utils";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useSession } from "next-auth/react";

const NavBar = () => {
  const { data: projects } = api.projects.getAll.useQuery();
  const { data: session } = useSession();

  return (
    <NavigationMenu className="z-0 flex min-w-full items-center justify-between *:w-full">
      <NavigationMenuList className="flex w-full flex-1 items-center justify-between">
        <NavigationMenuItem className="px-8 py-2">
          <Link href={"/"} legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Home
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <SignedIn>
          <NavigationMenuItem className="px-8 py-2">
            <NavigationMenuTrigger>Projects</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                <ListItem
                  key={"projects"}
                  title={"Projects"}
                  href={`/user/${session?.user.name}/projects`}
                >
                  View all projects
                </ListItem>
                {projects?.map((project) => (
                  <ListItem
                    key={project.id}
                    title={project.name}
                    href={`/b/${project.id}`}
                  >
                    {project.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </SignedIn>
        <SignedIn>
          <NavigationMenuItem className="px-8 py-2">
            <Avatar>
              <AvatarImage
                src={session?.user.image ?? ""}
                alt={session?.user.name ?? ""}
              />
              <AvatarFallback>{session?.user.name?.[0]}</AvatarFallback>
            </Avatar>
          </NavigationMenuItem>
        </SignedIn>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default NavBar;
