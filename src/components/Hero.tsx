import { shop } from "@/config/shop";

export function Hero() {
  return (
    <div id="top">
      {!shop.orderingOpen && (
        <div className="demo-strip">
          Режим предпросмотра меню · Приём онлайн-заказов скоро откроется
        </div>
      )}

      <header className="site-header">
        <div className="container header-inner">
          <nav className="nav" aria-label="Навигация">
            <a href="#cat-main">Меню</a>
            <a href="#ribs">Конструктор</a>
          </nav>

          <a className="brand" href="#top">
            BBQ <span>in MHK</span>
          </a>

          <a className="cta" href="#ribs" style={{ minHeight: "42px", padding: "0 18px", fontSize: ".9rem" }}>
            Заказать
          </a>
        </div>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero-center">
          <div className="hero-logo-wrap">
            <img src="/images/logo.PNG" alt="BBQ in MHK" width={220} height={220} />
          </div>

          <p className="eyebrow">100% Халяль · Махачкала · Пеллетный смокер</p>
          <h1 id="hero-title">
            Настоящее <span>BBQ</span> в Махачкале
          </h1>
          <p className="hero-copy">
            Говяжьи рёбра кальби медленного копчения 6–8 часов в сухом маринаде из соли, чёрного перца и паприки. Сочное мясо, авторские соусы и доставка по городу.
          </p>
          <div className="hero-actions">
            <a className="cta" href="#cat-main">
              Смотреть меню
            </a>
            <a className="cta cta-outline" href="#ribs">
              Собрать заказ
            </a>
          </div>
          <span className="hero-note">
            Готовим партиями · Банкетные заказы от 5 до 60 кг по предзаказу
          </span>
        </div>
      </section>
    </div>
  );
}
