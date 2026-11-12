"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { shop } from "@/config/shop";
import styles from "./Hero.module.css";
import SmokerScene from "./SmokerScene";

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => 1 - Math.pow(1 - clamp(value), 3);

export function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLHeadingElement>(null);
  const [replay, setReplay] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    const header = headerRef.current;
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!root || !header || !track || !viewport) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let active = true;
    let frame = 0;
    let startedAt: number | null = null;
    let ready = false;
    let headerHeight = 0;
    const imageCleanups: Array<() => void> = [];

    function measure() {
      if (!root || !header) return;
      headerHeight = header.getBoundingClientRect().height;
      root.style.setProperty("--smoker-header-height", `${headerHeight}px`);
      schedule();
    }

    function draw(now: number) {
      frame = 0;
      if (!active || !root || !track || !viewport) return;
      const reduced = media.matches;
      const compact = false;
      root.dataset.motion = reduced || compact ? "off" : "on";
      if (reduced || compact) {
        root.style.setProperty("--opening", "1");
        root.style.setProperty("--lid-angle", "100deg");
        root.style.setProperty("--reveal", "1");
        root.style.setProperty("--lid-label", "0");

        return;
      }
      if (ready && startedAt === null) startedAt = now;
      const entry = startedAt === null ? 0 : ease((now - startedAt - 220) / 1450);
      const travel = Math.max(1, track.offsetHeight - viewport.offsetHeight);
      const scrolled = clamp((headerHeight - track.getBoundingClientRect().top) / travel);
      // Keep the slogan open briefly, then close completely before the hero leaves.
      const closing = ease((scrolled - 0.08) / 0.78);
      const opening = entry * (1 - closing);
      root.style.setProperty("--opening", opening.toFixed(4));
      root.style.setProperty("--lid-angle", `${(100 * opening).toFixed(2)}deg`);
      root.style.setProperty("--reveal", clamp((opening - 0.2) / 0.55).toFixed(4));
      root.style.setProperty("--lid-label", clamp(1 - opening * 4).toFixed(4));

      if (ready && entry < 1) schedule();
    }

    function schedule() {
      if (active && !frame) frame = window.requestAnimationFrame(draw);
    }

    const onReady = () => { ready = true; schedule(); };
    window.addEventListener("smoker-ready", onReady);
    imageCleanups.push(() => window.removeEventListener("smoker-ready", onReady));
    if (root.dataset.sceneReady === "true") onReady();

    const observer = new ResizeObserver(measure);
    observer.observe(header);
    observer.observe(track);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("pageshow", schedule);
    media.addEventListener("change", schedule);
    measure();
    return () => {
      active = false;
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      imageCleanups.forEach((remove) => remove());
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      window.removeEventListener("pageshow", schedule);
      media.removeEventListener("change", schedule);

    };
  }, [replay]);

  return (
    <div id="top" ref={rootRef} className={styles.root} data-smoker-root="true"
      style={{ "--smoker-header-height": shop.orderingOpen ? "74px" : "110px" } as CSSProperties}>
      <div ref={headerRef} className={styles.headerWrap}>
        {!shop.orderingOpen && <div className={styles.preview}>Знакомьтесь с меню · Приём онлайн-заказов скоро откроется</div>}
        <header className={styles.header}>
          <a className={styles.brand} href="#top" aria-label="BBQ in MHK — на главную">
            <img src="/images/logo.PNG" alt="" width={48} height={48} /><span>BBQ <small>in MHK</small></span>
          </a>
          <nav className={styles.nav} aria-label="Навигация">
            <a href="#cat-main">Меню</a><a href="#about-bbq">О настоящем BBQ</a><a href="#ribs">Собрать заказ</a>
          </nav>
          <a href="#ribs" className={styles.headerCta}>{shop.orderingOpen ? "Заказать →" : "Выбрать рёбра →"}</a>
        </header>
      </div>
      <section ref={trackRef} className={styles.track} aria-labelledby="hero-title">
        <div ref={viewportRef} className={styles.viewport}>
          <div className={styles.scene}>
            <SmokerScene />
            <h1 ref={contentRef} id="hero-title" className={styles.accessibleTitle}>Вкус — который стоит ждать.</h1>
          </div>
          <div className={styles.info}>
            <p className={styles.eyebrow}>Махачкала · 100% Халяль · Настоящее BBQ</p>
            <p className={styles.description}>Говяжьи рёбра кальби.<br />7–8 часов в живом дыму — ради этого момента.</p>
            <div className={styles.actions}>
              <a href="#cat-main" className={styles.primary}>Посмотреть меню ↗</a>
              <a href="#ribs" className={styles.secondary}>Собрать свой BBQ →</a>
            </div>
          </div>
          <div className={styles.caption}>
            <span>Листайте вниз — смокер закроется <span aria-hidden="true">↓</span></span>
            <button type="button" onClick={() => setReplay((current) => current + 1)}>Открыть ещё раз ↗</button>
          </div>
        </div>
      </section>
      <div className={styles.afterword}><span>Дымное кольцо. Тёмный барк. Настоящее BBQ.</span><a href="#contacts">Банкеты и свадьбы · партии 50–60 кг →</a></div>
    </div>
  );
}
