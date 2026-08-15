import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ShortenForm } from "@/components/shorten-form";
import { LinksList } from "@/components/links-list";
import { listLinks } from "@/lib/links";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const items = await listLinks(userId);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
      <p className="text-xs font-bold uppercase tracking-widest text-[#d6ff3c]">
        Dashboard
      </p>
      <h1 className="display mt-2 text-4xl md:text-5xl">MAKE IT SHORT</h1>
      <p className="mt-2 max-w-xl text-sm text-[#b7b09f]">
        Paste a URL. Share the short one. Open analytics to see who clicked.
      </p>
      <div className="brutal mt-8 bg-[#141414] p-5">
        <ShortenForm />
      </div>
      <section className="mt-12">
        <h2 className="display text-2xl">YOUR LINKS</h2>
        {items.length === 0 ? (
          <p className="mt-4 border-[3px] border-[#f4efe4] p-5 text-sm text-[#b7b09f]">
            No links yet. Shorten one above. Links created before you signed in
            will not show here.
          </p>
        ) : (
          <LinksList items={items} />
        )}
      </section>
    </main>
  );
}
