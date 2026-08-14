"use client";

import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

export function HomeCta() {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button type="button" className="brutal-btn px-6 py-3 text-sm">
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button
            type="button"
            className="border-[3px] border-[#f4efe4] px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-[#ff4d2e]"
          >
            Create account
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <Link href="/dashboard" className="brutal-btn inline-block px-6 py-3 text-sm">
          Open dashboard
        </Link>
      </Show>
    </div>
  );
}
