import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { displayCountry } from "@/lib/format";
import { getLinkStats } from "@/lib/links";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function LinkAnalyticsPage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const stats = await getLinkStats(id, userId);
  if (!stats) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
      <Link
        href="/dashboard"
        className="text-xs font-bold uppercase tracking-wider text-[#b7b09f] hover:text-[#d6ff3c]"
      >
        ← Back
      </Link>
      <h1 className="display mt-4 text-4xl md:text-5xl">ANALYTICS</h1>
      <p className="mt-3 break-all text-sm font-bold text-[#d6ff3c]">
        {stats.shortUrl}
      </p>
      <p className="mt-1 truncate text-sm text-[#b7b09f]">{stats.originalUrl}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="brutal bg-[#d6ff3c] p-6 text-[#111]">
          <p className="text-xs font-bold uppercase tracking-widest">
            Total clicks
          </p>
          <p className="display mt-2 text-6xl">{stats.clickCount}</p>
        </div>
        <div className="brutal-hot bg-[#141414] p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#ff4d2e]">
            Country on localhost
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#b7b09f]">
            Shows as Unknown until you deploy to Vercel. Device and browser
            already work.
          </p>
        </div>
      </div>

      <AnalyticsCharts
        byDay={stats.byDay}
        byCountry={stats.byCountry}
        byDevice={stats.byDevice}
        byBrowser={stats.byBrowser}
      />

      <section className="brutal mt-8 overflow-hidden bg-[#141414]">
        <div className="border-b-[3px] border-[#f4efe4] px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#d6ff3c]">
          Recent clicks
        </div>
        {stats.recentClicks.length === 0 ? (
          <p className="px-4 py-6 text-sm text-[#b7b09f]">No clicks yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-[#0b0b0b] text-[#b7b09f]">
                <tr>
                  <th className="px-4 py-3 font-bold">Time</th>
                  <th className="px-4 py-3 font-bold">Country</th>
                  <th className="px-4 py-3 font-bold">Device</th>
                  <th className="px-4 py-3 font-bold">Browser</th>
                  <th className="px-4 py-3 font-bold">OS</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentClicks.map((click) => (
                  <tr
                    key={click.id}
                    className="border-t-[3px] border-[#2a2a2a]"
                  >
                    <td className="px-4 py-3">
                      {new Date(click.clickedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {displayCountry(click.country)}
                    </td>
                    <td className="px-4 py-3">{click.device ?? "—"}</td>
                    <td className="px-4 py-3">{click.browser ?? "—"}</td>
                    <td className="px-4 py-3">{click.os ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
