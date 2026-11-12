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
            <a href="#about-bbq">Что такое BBQ</a>
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

          <p className="eyebrow">100% Халяль · Махачкала · Настоящее техасское BBQ</p>
          <h1 id="hero-title">
            Мясо, которое <span>тает</span> без ножа
          </h1>
          <p className="hero-copy">
            Отборные говяжьи рёбра кальби медленного копчения. 7–8 часов живого дыма и жара ради идеальной тёмной корочки и сочности внутри. Доставка по Махачкале.
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
            Готовим партиями · Банкетные заказы на свадьбы и мероприятия до 60 кг
          </span>
        </div>
      </section>
    </div>
  );
}
