"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CreatedLink = {
  id: string;
  code: string;
  originalUrl: string;
  shortUrl: string;
};

export function ShortenForm({
  onCreated,
}: {
  onCreated?: (link: CreatedLink) => void;
}) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedLink | null>(null);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setCopied(false);
    setPending(true);
    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = (await response.json()) as CreatedLink & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Could not shorten that URL");
      }
      setCreated(data);
      setUrl("");
      onCreated?.(data);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  async function copyShortUrl() {
    if (!created) return;
    await navigator.clipboard.writeText(created.shortUrl);
    setCopied(true);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://very-long-url.example"
          className="min-w-0 flex-1 border-[3px] border-[#f4efe4] bg-[#0b0b0b] px-4 py-3 text-sm text-[#f4efe4] outline-none placeholder:text-[#6f6a5e] focus:bg-[#141414]"
          required
        />
        <button
          type="submit"
          disabled={pending}
          className="brutal-btn px-6 py-3 text-sm"
        >
          {pending ? "Working…" : "Shorten"}
        </button>
      </form>
      {error ? (
        <p className="border-[3px] border-[#ff4d2e] bg-[#ff4d2e] px-3 py-2 text-sm font-bold text-[#111]">
          {error}
        </p>
      ) : null}
      {created ? (
        <div className="brutal-hot flex flex-col gap-3 bg-[#141414] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-[#d6ff3c]">
              Short link
            </p>
            <a
              href={created.shortUrl}
              className="break-all text-sm font-bold hover:text-[#d6ff3c]"
              target="_blank"
              rel="noreferrer"
            >
              {created.shortUrl}
            </a>
          </div>
          <button
            type="button"
            onClick={copyShortUrl}
            className="brutal-btn px-4 py-2 text-xs"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
