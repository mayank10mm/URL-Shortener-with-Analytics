"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { displayCountry } from "@/lib/format";

const lime = "#d6ff3c";
const ink = "#f4efe4";
const muted = "#b7b09f";

type ChartProps = {
  byDay: { day: string; count: number }[];
  byCountry: { country: string; count: number }[];
  byDevice: { device: string; count: number }[];
  byBrowser: { browser: string; count: number }[];
};

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="brutal bg-[#141414] p-4">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#d6ff3c]">
        {title}
      </h2>
      <div className="h-56">{children}</div>
    </section>
  );
}

export function AnalyticsCharts({
  byDay,
  byCountry,
  byDevice,
  byBrowser,
}: ChartProps) {
  const days = byDay.map((row) => ({
    name: row.day.slice(5),
    clicks: row.count,
  }));
  const countries = byCountry.map((row) => ({
    name: displayCountry(row.country),
    clicks: row.count,
  }));
  const devices = byDevice.map((row) => ({
    name: row.device,
    clicks: row.count,
  }));
  const browsers = byBrowser.map((row) => ({
    name: row.browser,
    clicks: row.count,
  }));

  const empty = (
    <p className="flex h-full items-center text-sm text-[#b7b09f]">
      No click data yet. Open the short link once.
    </p>
  );

  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-2">
      <ChartCard title="Clicks over time">
        {days.length === 0 ? (
          empty
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={days}>
              <CartesianGrid stroke="#2a2a2a" vertical={false} />
              <XAxis dataKey="name" stroke={muted} tick={{ fill: muted, fontSize: 12 }} />
              <YAxis allowDecimals={false} stroke={muted} tick={{ fill: muted, fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "#0b0b0b",
                  border: "3px solid #f4efe4",
                  color: ink,
                }}
              />
              <Bar dataKey="clicks" fill={lime} radius={0} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
      <ChartCard title="Countries">
        {countries.length === 0 ? (
          empty
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={countries} layout="vertical">
              <CartesianGrid stroke="#2a2a2a" horizontal={false} />
              <XAxis type="number" allowDecimals={false} stroke={muted} tick={{ fill: muted, fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={90} stroke={muted} tick={{ fill: muted, fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "#0b0b0b",
                  border: "3px solid #f4efe4",
                  color: ink,
                }}
              />
              <Bar dataKey="clicks" fill="#ff4d2e" radius={0} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
      <ChartCard title="Devices">
        {devices.length === 0 ? (
          empty
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={devices}>
              <CartesianGrid stroke="#2a2a2a" vertical={false} />
              <XAxis dataKey="name" stroke={muted} tick={{ fill: muted, fontSize: 12 }} />
              <YAxis allowDecimals={false} stroke={muted} tick={{ fill: muted, fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "#0b0b0b",
                  border: "3px solid #f4efe4",
                  color: ink,
                }}
              />
              <Bar dataKey="clicks" fill={lime} radius={0} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
      <ChartCard title="Browsers">
        {browsers.length === 0 ? (
          empty
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={browsers}>
              <CartesianGrid stroke="#2a2a2a" vertical={false} />
              <XAxis dataKey="name" stroke={muted} tick={{ fill: muted, fontSize: 12 }} />
              <YAxis allowDecimals={false} stroke={muted} tick={{ fill: muted, fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "#0b0b0b",
                  border: "3px solid #f4efe4",
                  color: ink,
                }}
              />
              <Bar dataKey="clicks" fill="#f4efe4" radius={0} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
