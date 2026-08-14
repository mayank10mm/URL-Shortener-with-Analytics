"use client";

import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b-[3px] border-[#f4efe4] bg-[#0b0b0b]">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Link href="/" className="display text-xl tracking-tight">
          SHORT<span className="text-[#d6ff3c]">LY</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button type="button" className="brutal-btn px-4 py-2 text-xs">
                Sign in
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="border-[3px] border-[#f4efe4] px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-[#d6ff3c] hover:text-[#111]"
            >
              Dashboard
            </Link>
            <UserButton />
          </Show>
        </nav>
      </div>
    </header>
  );
}
