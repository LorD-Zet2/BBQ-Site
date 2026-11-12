export function AboutBbqAndInsta() {
  return (
    <>
      {/* Блок-ликбез: Что такое настоящее BBQ */}
      <section className="section process" id="about-bbq" aria-labelledby="bbq-edu-title">
        <div className="container">
          <p className="section-kicker">Культура настоящего мяса</p>
          <h2 className="section-title" id="bbq-edu-title">
            Что такое настоящее BBQ и почему это не шашлык
          </h2>
          <p className="section-lead">
            Никакого открытого огня, уксуса и спешки. Настоящее техасское барбекю — это искусство низких температур, терпения и живого дыма.
          </p>

          {/* 3 главные фишки с картинками */}
          <div className="edu-grid">
            <article className="edu-card">
              <div className="edu-img-wrap">
                <img loading="lazy" decoding="async" src="/images/bark.ecb4a3e6cf0d.webp" alt="Тёмная корочка барк на говяжьих рёбрах" />
              </div>
              <div className="edu-body">
                <span className="menu-badge">Барк (Bark)</span>
                <h3>Та самая тёмная корочка</h3>
                <p>
                  Многие думают, что мясо подгорело. На деле это «барк» — плотная, ароматная карамелизированная корочка из специй, дыма и мясного сока. Она запечатывает всю влагу внутри ребра.
                </p>
              </div>
            </article>

            <article className="edu-card">
              <div className="edu-img-wrap">
                <img loading="lazy" decoding="async" src="/images/smoke-ring.ed7d96a3c492.webp" alt="Розовое дымное кольцо на разрезе мяса" />
              </div>
              <div className="edu-body">
                <span className="menu-badge">Smoke Ring</span>
                <h3>Дымное кольцо на разрезе</h3>
                <p>
                  Розовая полоска толщиной в несколько миллиметров под самой корочкой — знак качества настоящего копчения. Она появляется только при многочасовой работе натурального дыма и не подделывается в духовке.
                </p>
              </div>
            </article>

            <article className="edu-card">
              <div className="edu-img-wrap">
                <img loading="lazy" decoding="async" src="/images/low-and-slow.f01cef8ac40d.webp" alt="Томление 7-8 часов при низкой температуре" />
              </div>
              <div className="edu-body">
                <span className="menu-badge">Low &amp; Slow</span>
                <h3>7–8 часов терпения</h3>
                <p>
                  Мы не жарим мясо за 15 минут. За 7–8 часов при температуре около 110–120 °C жёсткий коллаген в говяжьих рёбрах превращается в нежнейший желатин. Кость буквально выскальзывает сама.
                </p>
              </div>
            </article>
          </div>

          {/* Честное сравнение: BBQ vs Шашлык vs Стейк */}
          <div className="compare-box">
            <h3>В чём разница для тех, кто любит мясо</h3>
            <div className="compare-grid">
              <div className="compare-item">
                <strong>Шашлык</strong>
                <p>
                  Готовится 15–20 минут на сильном жаре углей. Вкус строится на маринаде и быстром обжаривании. Вкусно, привычно, но это быстрая жарка.
                </p>
              </div>
              <div className="compare-item">
                <strong>Стейк</strong>
                <p>
                  Берётся мягкий премиальный отруб и жарится 5–10 минут до нужной прожарки с кровью или медиум. Минимум дыма, акцент на чистоту самого куска.
                </p>
              </div>
              <div className="compare-item highlight">
                <strong>Настоящее BBQ (мы)</strong>
                <p>
                  Берутся насыщенные говяжьи рёбра и томятся 7–8 часов в дыму. Мясо получается полностью пропечённым, без крови, но невероятно сочным и с глубоким вкусом костра.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Блок Instagram @bbq.mhk (работает в Махачкале без VPN) */}
      <section className="section" id="instagram" aria-labelledby="insta-title">
        <div className="container">
          <div className="insta-card">
            <div className="insta-media">
              <img loading="lazy" decoding="async" src="/images/kalbi-hero-demo.webp" alt="Свежая партия рёбер BBQ in MHK" />
              <span className="insta-live-badge">Свежее из цеха</span>
            </div>

            <div className="insta-content">
              <p className="section-kicker">Мы в Instagram</p>
              <h2 className="insta-title" id="insta-title">
                @bbq.mhk
              </h2>
              <p className="insta-text">
                Показываем без фильтров, как достаём горячие рёбра из смокера, режем сочный брискет и собираем большие заказы на свадьбы и семейные ужины в Махачкале. Подписывайся, чтобы ловить анонсы свежих партий!
              </p>
              <div className="insta-meta">
                <span>100% Халяль</span>
                <span>•</span>
                <span>Махачкала</span>
                <span>•</span>
                <span>Свежие партии по графику</span>
              </div>
              <div className="hero-actions" style={{ justifyContent: "flex-start" }}>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta"
                >
                  Открыть @bbq.mhk
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
