import { HeroScene } from "@/components/hero-scene";
import { HomeCta } from "@/components/home-cta";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 md:py-16">
      <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="inline-block border-[3px] border-[#d6ff3c] bg-[#d6ff3c] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#111]">
            Short links / raw stats
          </p>
          <h1 className="display mt-5 text-5xl leading-[0.9] tracking-tight md:text-7xl">
            PASTE.
            <br />
            SHRINK.
            <br />
            <span className="text-[#d6ff3c]">TRACK.</span>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-[#b7b09f]">
            Brutal short links. Every click logs time, country, device, and
            browser. Redirects stay public. Analytics stay yours.
          </p>
          <HomeCta />
        </div>
        <HeroScene />
      </div>

      <section className="mt-16 grid gap-4 md:grid-cols-3">
        {[
          {
            step: "01",
            title: "Paste",
            body: "Drop a long URL. We mint a unique code.",
          },
          {
            step: "02",
            title: "Share",
            body: "Anyone with the short link gets redirected instantly.",
          },
          {
            step: "03",
            title: "Watch",
            body: "See who clicked — device, browser, time, country.",
          },
        ].map((item) => (
          <article
            key={item.step}
            className="brutal bg-[#141414] p-5"
          >
            <p className="text-xs font-bold text-[#d6ff3c]">{item.step}</p>
            <h2 className="display mt-2 text-2xl">{item.title}</h2>
            <p className="mt-2 text-sm text-[#b7b09f]">{item.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
