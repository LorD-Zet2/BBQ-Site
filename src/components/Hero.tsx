"use client";

import { useEffect, useState } from "react";
import { shop } from "@/config/shop";

export function Hero() {
  const [opened, setOpened] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setOpened(true);
      setReady(true);
      return;
    }
    const timer = window.setTimeout(() => { setOpened(true); setReady(true); }, 1100);
    return () => window.clearTimeout(timer);
  }, [ready]);

  return (
    <div id="top">
      {!shop.orderingOpen && <div className="demo-strip">Знакомьтесь с меню · Приём онлайн-заказов скоро откроется</div>}
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#top" aria-label="BBQ in MHK — на главную">BBQ <span>in MHK</span></a>
          <nav className="nav" aria-label="Навигация">
            <a href="#cat-main">Меню</a><a href="#about-bbq">О настоящем BBQ</a><a href="#ribs">Собрать заказ</a>
          </nav>
          <a className="header-order" href="#ribs">{shop.orderingOpen ? "Заказать →" : "Выбрать рёбра →"}</a>
        </div>
      </header>
      <section className="bbq-hero" aria-labelledby="hero-title">
        <div className="container">
          <div className="bbq-hero-brand">
            <img src="/images/logo.PNG" alt="BBQ in MHK" width={112} height={112} fetchPriority="high" />
            <p>Махачкала <span aria-hidden="true">·</span> Настоящее техасское BBQ</p>
          </div>
          <div className="bbq-hero-grid">
            <div className="bbq-hero-copy">
              <p className="bbq-hero-kicker"><span aria-hidden="true" /> Хорошие вещи требуют времени</p>
              <h1 id="hero-title">Вкус —<br />который<br /><span>стоит ждать.</span></h1>
              <p className="bbq-hero-description">Говяжьи рёбра кальби. 7–8 часов томления в живом дыму — ради тёмного барка, дымного кольца и сочности в каждом кусочке.</p>
              <div className="bbq-hero-actions">
                <a className="cta" href="#cat-main">Посмотреть меню <span aria-hidden="true">↗</span></a>
                <a className="bbq-hero-textlink" href="#ribs">Собрать свой BBQ →</a>
              </div>
              <div className="bbq-hero-facts"><span>100% Халяль</span><span>7–8 часов дыма</span><span>Доставка по Махачкале</span></div>
            </div>
            <div className="bbq-smoker-story" data-open={opened} data-ready={ready}>
              <div className="bbq-smoker-caption"><span>LOW & SLOW</span><span>Без спешки. Со вкусом.</span></div>
              <div className="bbq-smoker-scene" aria-hidden="true">
                <div className="bbq-smoke"><i /><i /><i /></div>
                <div className="bbq-smoker-chimney" />
                <div className="bbq-smoker-chamber">
                  <img src="/images/kalbi-hero-demo.webp" alt="" width={640} height={480} />
                  <span className="bbq-smoker-food-label">7–8 часов спустя</span>
                </div>
                <div className="bbq-smoker-lid"><span className="bbq-smoker-gauge" /><span className="bbq-smoker-emblem">BBQ <small>in MHK</small></span><span className="bbq-smoker-handle" /></div>
                <div className="bbq-smoker-base"><span>Огонь. Дым. Терпение.</span></div>
                <div className="bbq-smoker-leg bbq-smoker-leg-left" /><div className="bbq-smoker-leg bbq-smoker-leg-right" />
              </div>
              <div className="bbq-smoker-controls">
                <p aria-live="polite">{opened ? "Вот ради чего мы ждали." : "Всё самое вкусное — под крышкой."}</p>
                <button type="button" aria-expanded={opened} aria-controls="bbq-smoker-note"
                  onClick={() => { setReady(true); setOpened((current) => !current); }}>
                  {opened ? "Закрыть смокер ↻" : "Открыть смокер ↗"}
                </button>
              </div>
              <p id="bbq-smoker-note" className="bbq-smoker-note">{opened ? "Тёмная корочка. Дымное кольцо. Настоящее BBQ." : "Настоящее BBQ готовится часами. Здесь можно заглянуть внутрь."}</p>
            </div>
          </div>
          <p className="bbq-hero-banquet">Большой повод? <a href="#contacts">Банкеты и свадьбы · партии 50–60 кг →</a></p>
        </div>
      </section>
    </div>
  );
}
