"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu, Sparkles, Library, Repeat2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import UserMenu from "./UserMenu";
import { useState } from "react";

const navLinks = [
  { href: "/dashboard", label: "Library", icon: Library },
  { href: "/remix", label: "Remix", icon: Repeat2 },
  { href: "/remixes", label: "My Remixes", icon: Sparkles },
];

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold">
          koomastudio
        </Link>

        {session?.user && (
          <>
            {/* Desktop nav */}
            <div className="hidden items-center gap-6 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
              <UserMenu />
            </div>

            {/* Mobile nav */}
            <div className="flex items-center gap-2 md:hidden">
              <UserMenu />
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <div className="mt-8 flex flex-col gap-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>
        )}

        {!session?.user && (
          <Button asChild size="sm">
            <Link href="/signin">Sign in</Link>
          </Button>
        )}
      </div>
    </nav>
  );
}
