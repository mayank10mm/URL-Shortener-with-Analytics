"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export type DashboardLink = {
  id: string;
  shortUrl: string;
  originalUrl: string;
  clickCount: number;
  starred: boolean;
  pinned: boolean;
};

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M12 3.2 14.6 8.7l6 .5-4.6 4 1.4 5.8L12 16.4 6.6 19l1.4-5.8-4.6-4 6-.5z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M15.2 4.2 19.8 8.8 13 15.6 8.4 11z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M8.4 11 4.5 19.5 13 15.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M5 7h14M10 7V5h4v2M8 7l.8 12h6.4L16 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconButton({
  label,
  active,
  danger,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const tone = danger
    ? "border-[#ff4d2e] text-[#ff4d2e] hover:bg-[#ff4d2e] hover:text-[#111]"
    : active
      ? "border-[#d6ff3c] bg-[#d6ff3c] text-[#111]"
      : "border-[#f4efe4] text-[#f4efe4] hover:border-[#d6ff3c] hover:text-[#d6ff3c]";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center border-[3px] transition disabled:opacity-50 ${tone}`}
    >
      {children}
    </button>
  );
}

export function LinksList({ items }: { items: DashboardLink[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DashboardLink | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function patchAction(id: string, action: "star" | "pin") {
    setError(null);
    setPendingId(id);
    try {
      const response = await fetch(`/api/links/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Could not update that link");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPendingId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setError(null);
    setPendingId(deleteTarget.id);
    try {
      const response = await fetch(`/api/links/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Could not delete that link");
      }
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <>
      {error ? (
        <p className="mt-4 border-[3px] border-[#ff4d2e] bg-[#ff4d2e] px-3 py-2 text-sm font-bold text-[#111]">
          {error}
        </p>
      ) : null}
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className={`brutal flex flex-col gap-3 bg-[#141414] p-4 sm:flex-row sm:items-center sm:justify-between ${
              item.pinned ? "shadow-[8px_8px_0_#d6ff3c]" : ""
            }`}
          >
            <div className="min-w-0">
              {item.pinned ? (
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#d6ff3c]">
                  Pinned
                </p>
              ) : null}
              <p className="truncate font-bold">{item.shortUrl}</p>
              <p className="truncate text-sm text-[#b7b09f]">
                {item.originalUrl}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="border-[3px] border-[#d6ff3c] px-2 py-1 text-xs font-bold text-[#d6ff3c]">
                {item.clickCount} CLICKS
              </span>
              <IconButton
                label={item.starred ? "Unstar" : "Star"}
                active={item.starred}
                disabled={pendingId === item.id}
                onClick={() => void patchAction(item.id, "star")}
              >
                <StarIcon filled={item.starred} />
              </IconButton>
              <IconButton
                label={item.pinned ? "Unpin" : "Pin"}
                active={item.pinned}
                disabled={pendingId === item.id}
                onClick={() => void patchAction(item.id, "pin")}
              >
                <PinIcon filled={item.pinned} />
              </IconButton>
              <IconButton
                label="Delete"
                danger
                disabled={pendingId === item.id}
                onClick={() => setDeleteTarget(item)}
              >
                <TrashIcon />
              </IconButton>
              <Link
                href={`/dashboard/${item.id}`}
                className="text-xs font-bold uppercase tracking-wider text-[#ff4d2e] hover:text-[#d6ff3c]"
              >
                Analytics →
              </Link>
            </div>
          </li>
        ))}
      </ul>

      {deleteTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-link-title"
        >
          <div className="brutal-hot w-full max-w-md bg-[#141414] p-5">
            <h3 id="delete-link-title" className="display text-2xl">
              DELETE LINK?
            </h3>
            <p className="mt-3 text-sm text-[#b7b09f]">
              Are you sure you want to delete it? This cannot be undone.
            </p>
            <p className="mt-2 truncate text-sm font-bold">{deleteTarget.shortUrl}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                className="brutal-btn px-5 py-2 text-sm"
                disabled={pendingId === deleteTarget.id}
                onClick={() => void confirmDelete()}
              >
                {pendingId === deleteTarget.id ? "Deleting…" : "Yes"}
              </button>
              <button
                type="button"
                className="border-[3px] border-[#f4efe4] px-5 py-2 text-sm font-bold uppercase tracking-wide hover:bg-[#f4efe4] hover:text-[#111]"
                disabled={pendingId === deleteTarget.id}
                onClick={() => setDeleteTarget(null)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
