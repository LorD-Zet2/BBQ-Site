"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { shop } from "@/config/shop";
import styles from "./Hero.module.css";

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };

export function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [replay, setReplay] = useState(0);
  const [status, setStatus] = useState("Смокер закрыт");

  useEffect(() => {
    const root = rootRef.current;
    const header = headerRef.current;
    const track = trackRef.current;
    const viewport = viewportRef.current;
    const stage = stageRef.current;
    if (!root || !header || !track || !viewport || !stage) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let active = true;
    let frame = 0;
    let ready = false;
    let startedAt: number | null = null;
    let smokeStartedAt: number | null = null;
    let previousOpening = 0;
    let headerHeight = 0;
    let lastStatus = "";
    const imageCleanups: Array<() => void> = [];

    function announce(next: string) {
      if (lastStatus !== next) { lastStatus = next; setStatus(next); }
    }
    function schedule() { if (active && !frame) frame = requestAnimationFrame(draw); }
    function measure() {
      if (!active || !root || !header || !stage || !viewport) return;
      headerHeight = header.getBoundingClientRect().height;
      root.style.setProperty("--header-height", `${headerHeight}px`);
      root.style.setProperty("--viewport-height", `${viewport.offsetHeight}px`);
      const scale = Math.max(stage.clientWidth / 1672, stage.clientHeight / 941);
      root.style.setProperty("--photo-width", `${1672 * scale}px`);
      root.style.setProperty("--photo-height", `${941 * scale}px`);
      schedule();
    }
    function draw(now: number) {
      frame = 0;
      if (!active || !root || !track || !viewport) return;
      const reduced = media.matches;
      root.dataset.motion = reduced ? "off" : "on";
      if (ready && startedAt === null) startedAt = now;
      const entry = reduced ? 1 : startedAt === null ? 0 : smooth((now - startedAt - 600) / 2100);
      const distance = Math.max(1, track.offsetHeight - viewport.offsetHeight);
      const scrollProgress = clamp((headerHeight - track.getBoundingClientRect().top) / distance);
      const closing = reduced ? 0 : smooth((scrollProgress - .08) / .82);
      const opening = entry * (1 - closing);
      if (!reduced && opening > .14 && previousOpening <= .14) smokeStartedAt = now;
      previousOpening = opening;
      const smokeAge = smokeStartedAt === null ? 3000 : now - smokeStartedAt;
      const smokeProgress = clamp(smokeAge / 2350);
      const smokeOpacity = reduced ? 0 : Math.pow(Math.sin(Math.PI * smokeProgress), 1.15) * .82 * clamp(opening * 4);
      const cleared = smokeStartedAt === null ? 1 : smooth((smokeAge - 1150) / 650);
      const textOpacity = reduced ? 1 : smooth((opening - .91) / .09) * cleared;
      const closedOpacity = clamp(1 - opening * 2);
      const middleOpacity = opening < .5 ? 1 : (1 - opening) * 2;
      root.style.setProperty("--opening", opening.toFixed(4));
      root.style.setProperty("--closed-opacity", closedOpacity.toFixed(4));
      root.style.setProperty("--middle-opacity", middleOpacity.toFixed(4));
      root.style.setProperty("--closed-glass-opacity", closedOpacity.toFixed(4));
      root.style.setProperty("--middle-glass-opacity", ((1 - closedOpacity) * middleOpacity).toFixed(4));
      root.style.setProperty("--text-opacity", textOpacity.toFixed(4));
      root.style.setProperty("--smoke-opacity", smokeOpacity.toFixed(4));
      root.style.setProperty("--smoke-progress", smokeProgress.toFixed(4));
      root.dataset.releasing = smokeOpacity > .01 ? "true" : "false";
      announce(opening > .995 ? "Смокер открыт" : opening < .005 ? "Смокер закрыт" : "Крышка движется");
      if ((!reduced && ready && entry < 1) || (!reduced && smokeProgress < 1)) schedule();
    }
    const images = Array.from(root.querySelectorAll<HTMLImageElement>("[data-hero-image]"));
    void Promise.all(images.map((image) => image.complete ? Promise.resolve() : new Promise<void>((resolve) => {
      const remove = () => { image.removeEventListener("load", finish); image.removeEventListener("error", finish); };
      const finish = () => { remove(); resolve(); };
      image.addEventListener("load", finish); image.addEventListener("error", finish); imageCleanups.push(remove);
    }))).then(() => { if (active) { ready = true; measure(); } });
    const observer = new ResizeObserver(measure);
    observer.observe(header); observer.observe(stage); observer.observe(viewport);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("pageshow", schedule);
    media.addEventListener("change", measure);
    measure();
    return () => {
      active = false; cancelAnimationFrame(frame); observer.disconnect(); imageCleanups.forEach((remove) => remove());
      window.removeEventListener("scroll", schedule); window.removeEventListener("resize", measure);
      window.removeEventListener("pageshow", schedule); media.removeEventListener("change", measure);
    };
  }, [replay]);

  return (
    <div id="top" ref={rootRef} className={styles.root} style={{ "--header-height": shop.orderingOpen ? "74px" : "108px" } as CSSProperties}>
      <noscript><style>{`.${styles.root}{--closed-opacity:0;--middle-opacity:0;--closed-glass-opacity:0;--middle-glass-opacity:0;--text-opacity:1}`}</style></noscript>
      <div ref={headerRef} className={styles.headerWrap}>
        {!shop.orderingOpen && <div className={styles.preview}>Знакомьтесь с меню · Приём онлайн-заказов скоро откроется</div>}
        <header className={styles.header}>
          <a className={styles.brand} href="#top" aria-label="BBQ in MHK — на главную"><img src="/images/logo.PNG" alt="" width={44} height={44} /><span>BBQ <small>in MHK</small></span></a>
          <nav className={styles.nav} aria-label="Навигация"><a href="#cat-main">Меню</a><a href="#about-bbq">О настоящем BBQ</a><a href="#ribs">Собрать заказ</a></nav>
          <a href="#ribs" className={styles.headerCta}>{shop.orderingOpen ? "Заказать →" : "Выбрать рёбра →"}</a>
        </header>
      </div>
      <section ref={trackRef} className={styles.track} aria-labelledby="hero-title">
        <div ref={viewportRef} className={styles.viewport}>
          <div ref={stageRef} id="smoker-stage" className={styles.stage} data-smoker-stage>
            <div className={styles.photoPlane}>
              <img className={styles.openImage} src="/images/hero-reference-open.webp" alt="" width={1672} height={941} fetchPriority="high" data-hero-image />
              <img className={styles.middleImage} src="/images/hero-reference-middle.webp" alt="" width={1672} height={941} fetchPriority="high" data-hero-image />
              <img className={styles.closedImage} src="/images/hero-reference-closed.webp" alt="" width={1672} height={941} fetchPriority="high" data-hero-image />
              {/* Each glass aperture samples the same fixed chamber, never the moving lid. */}
              <div className={styles.closedGlass} aria-hidden="true" data-window-content="stationary" />
              <div className={styles.middleGlass} aria-hidden="true" data-window-content="stationary" />
              <h1 id="hero-title" className={styles.slogan}><span>Вкус — который</span><span>стоит ждать.</span></h1>
              <div className={styles.smokeMain} aria-hidden="true"><img src="/images/hero-reference-smoke.webp" alt="" width={1774} height={887} data-hero-image /></div>
              <div className={styles.smokeSide} aria-hidden="true"><img src="/images/hero-reference-smoke.webp" alt="" width={1774} height={887} /></div>
            </div>
          </div>
          <div className={styles.info}>
            <p className={styles.eyebrow}>Махачкала · 100% Халяль · Настоящее BBQ</p>
            <p className={styles.description}>Говяжьи рёбра кальби.<br />7–8 часов в живом дыму — ради этого момента.</p>
            <div className={styles.actions}><a href="#cat-main" className={styles.primary}>Посмотреть меню →</a><a href="#ribs" className={styles.secondary}>Собрать свой BBQ →</a></div>
          </div>
          <div className={styles.caption}><span>Листайте вниз — крышка закроется ↓</span><button type="button" aria-controls="smoker-stage" onClick={() => setReplay((current) => current + 1)}>Открыть ещё раз →</button></div>
          <span className={styles.srOnly} role="status">{status}</span>
        </div>
      </section>
      <div className={styles.afterword}><span>Дымное кольцо. Тёмный барк. Настоящее BBQ.</span><a href="#contacts">Банкеты и свадьбы · партии 50–60 кг →</a></div>
    </div>
  );
}
