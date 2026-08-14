"use client";

import { useRef, type MouseEvent } from "react";

export function HeroScene() {
  const stageRef = useRef<HTMLDivElement>(null);

  function onMove(event: MouseEvent<HTMLDivElement>) {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `rotateX(${(-y * 16).toFixed(2)}deg) rotateY(${(x * 22).toFixed(2)}deg)`;
  }

  function onLeave() {
    if (stageRef.current) {
      stageRef.current.style.transform = "rotateX(8deg) rotateY(-18deg)";
    }
  }

  return (
    <div
      className="brutal relative h-[340px] w-full overflow-hidden bg-[#0b0b0b] md:h-[460px]"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ perspective: "900px" }}
    >
      <div
        ref={stageRef}
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: "rotateX(8deg) rotateY(-18deg)",
          transformStyle: "preserve-3d",
          transition: "transform 180ms ease-out",
        }}
      >
        <svg
          className="absolute"
          style={{ transform: "translate3d(-20px, -92px, 70px)" }}
          width="120"
          height="64"
          viewBox="0 0 120 64"
          fill="none"
          aria-hidden
        >
          <path
            d="M38 32a16 16 0 0 1 16-16h10a16 16 0 1 1 0 32H54A16 16 0 0 1 38 32Z"
            stroke="#d6ff3c"
            strokeWidth="10"
          />
          <path
            d="M82 32A16 16 0 0 1 66 48H56a16 16 0 1 1 0-32h10A16 16 0 0 1 82 32Z"
            stroke="#ff4d2e"
            strokeWidth="10"
          />
        </svg>

        <div
          className="absolute border-[3px] border-[#111] bg-[#f4efe4] px-4 py-3 text-[#111] shadow-[8px_8px_0_#d6ff3c]"
          style={{ transform: "translate3d(-70px, 8px, 40px) rotateX(6deg)" }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#ff4d2e]">
            Long URL
          </p>
          <p className="mt-1 max-w-[220px] font-mono text-[11px] leading-snug break-all">
            https://example.com/super/long/article-name
          </p>
        </div>

        <div
          className="absolute display text-3xl text-[#d6ff3c]"
          style={{ transform: "translate3d(78px, 4px, 55px)" }}
        >
          →
        </div>

        <div
          className="absolute border-[3px] border-[#111] bg-[#d6ff3c] px-4 py-3 text-[#111] shadow-[8px_8px_0_#ff4d2e]"
          style={{ transform: "translate3d(110px, 58px, 90px) rotateY(-12deg)" }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest">
            Shortly
          </p>
          <p className="display mt-1 text-2xl tracking-tight">/x7k2</p>
        </div>
      </div>

      <p className="pointer-events-none absolute bottom-3 left-3 border-[3px] border-[#111] bg-[#d6ff3c] px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#111]">
        Long URL → short code
      </p>
    </div>
  );
}
