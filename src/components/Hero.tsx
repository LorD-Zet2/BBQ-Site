"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { shop } from "@/config/shop";
import styles from "./Hero.module.css";

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => 1 - Math.pow(1 - clamp(value), 3);

export function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
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
      const compact = window.innerHeight < 540;
      root.dataset.motion = reduced || compact ? "off" : "on";
      if (reduced || compact) {
        root.style.setProperty("--opening", "1");
        root.style.setProperty("--lid-angle", "-100deg");
        root.style.setProperty("--reveal", "1");
        root.style.setProperty("--lid-label", "0");
        if (contentRef.current) contentRef.current.inert = false;
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
      root.style.setProperty("--lid-angle", `${(-100 * opening).toFixed(2)}deg`);
      root.style.setProperty("--reveal", clamp((opening - 0.2) / 0.55).toFixed(4));
      root.style.setProperty("--lid-label", clamp(1 - opening * 4).toFixed(4));
      if (contentRef.current) contentRef.current.inert = opening < 0.45;
      if (ready && entry < 1) schedule();
    }

    function schedule() {
      if (active && !frame) frame = window.requestAnimationFrame(draw);
    }

    const images = Array.from(root.querySelectorAll<HTMLImageElement>("[data-smoker-image]"));
    const loaded = images.map((image) => image.complete ? Promise.resolve() : new Promise<void>((resolve) => {
      const finish = () => { remove(); resolve(); };
      const remove = () => {
        image.removeEventListener("load", finish);
        image.removeEventListener("error", finish);
      };
      image.addEventListener("load", finish);
      image.addEventListener("error", finish);
      imageCleanups.push(remove);
    }));
    void Promise.all(loaded).then(() => {
      if (!active) return;
      ready = true;
      schedule();
    });

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
      if (contentRef.current) contentRef.current.inert = false;
    };
  }, [replay]);

  return (
    <div id="top" ref={rootRef} className={styles.root}
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
          <img className={styles.interior} src="/images/smoker-interior-v3.webp" alt=""
            width={1672} height={941} fetchPriority="high" data-smoker-image="interior" />
          <div className={styles.shade} aria-hidden="true" />
          <div className={styles.emberGlow} aria-hidden="true" />
          <div className={styles.smoke} aria-hidden="true"><i /><i /></div>
          <div ref={contentRef} className={styles.content}>
            <p className={styles.eyebrow}>Махачкала · 100% Халяль · Настоящее BBQ</p>
            <h1 id="hero-title" className={styles.slogan}>
              <span>Вкус —</span><span>который</span><span className={styles.sloganLast}>стоит ждать.</span>
            </h1>
            <p className={styles.description}>Говяжьи рёбра кальби.<br />7–8 часов в живом дыму — ради этого момента.</p>
            <div className={styles.actions}>
              <a href="#cat-main" className={styles.primary}>Посмотреть меню ↗</a>
              <a href="#ribs" className={styles.secondary}>Собрать свой BBQ →</a>
            </div>
          </div>
          <div className={styles.lid} aria-hidden="true">
            <img src="/images/smoker-lid-v3.webp" alt="" width={1672} height={941}
              fetchPriority="high" data-smoker-image="lid" />
            <div className={styles.lidBrand}><span>BBQ <small>in MHK</small></span><p>Хорошие вещи требуют времени.</p></div>
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
