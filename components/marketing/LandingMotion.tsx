"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Motion is confined to this marketing surface; content stays server-rendered. */
export function LandingMotion({ children, className }: { children: ReactNode; className: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;

    const photo = element.querySelector<HTMLElement>("[data-parallax]");
    const story = element.querySelector<HTMLElement>("[data-story]");
    const receipt = element.querySelector<HTMLElement>("[data-receipt]");
    const balance = element.querySelector<HTMLElement>("[data-balance]");
    const capture = element.querySelector<HTMLElement>("[data-captures]");
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const clamp = (value: number) => Math.max(0, Math.min(1, value));

    function update() {
      frame = 0;
      if (photo) {
        const top = element!.getBoundingClientRect().top;
        photo.style.transform = `translate3d(0, ${Math.min(44, Math.max(0, -top * 0.065))}px, 0) scale(1.08)`;
      }
      if (story && receipt && balance) {
        const rect = story.getBoundingClientRect();
        const progress = clamp(-rect.top / Math.max(1, rect.height - window.innerHeight));
        const blend = clamp((progress - 0.2) / 0.55);
        receipt.style.opacity = String(1 - blend);
        receipt.style.transform = `translate3d(0, ${-32 * blend}px, 0) rotate(${-3 * blend}deg)`;
        balance.style.opacity = String(blend);
        balance.style.transform = `translate3d(0, ${32 * (1 - blend)}px, 0)`;
      }
    }

    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    function configure() {
      if (story) story.dataset.motion = String(!preference.matches);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.cancelAnimationFrame(frame);
      frame = 0;
      if (preference.matches) {
        [photo, receipt, balance].forEach((node) => {
          node?.style.removeProperty("transform");
          node?.style.removeProperty("opacity");
        });
      } else {
        update();
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
      }
    }

    // One coordinated entrance, not a reveal on every section or scroll pass.
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting) && capture) {
        capture.dataset.visible = "true";
        observer.disconnect();
      }
    }, { threshold: 0.15 });
    if (capture) {
      capture.dataset.enhanced = "true";
      observer.observe(capture);
    }
    configure();
    preference.addEventListener("change", configure);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      preference.removeEventListener("change", configure);
    };
  }, []);

  return <div ref={root} className={className}>{children}</div>;
}
