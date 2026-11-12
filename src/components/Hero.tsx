import Image from "next/image";
import { shop } from "@/config/shop";

export function Hero() {
  return (
    <>
      <div className="demo-strip" role="status">{shop.orderingOpen ? "Приём заказов открыт. Наличие и время подтверждает оператор." : "Стоп-лист: приём заказов временно закрыт. Настройки находятся в src/config/shop.ts."}</div>
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#top" aria-label={`${shop.brandName} — наверх`}><span>{shop.brandName}</span></a>
          <nav className="nav" aria-label="Основная навигация">
            <a href="#ribs">Рёбра</a><a href="#process">Как готовим</a><a href="#delivery">Доставка</a><a href="#contacts">Контакты</a>
          </nav>
        </div>
      </header>
      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-media">
          <Image src="/images/kalbi-hero-demo.webp" alt="Демонстрационная визуализация копчёных говяжьих рёбер кальби" fill priority sizes="100vw" />
        </div>
        <div className="container">
          <div className="hero-content">
            <p className="eyebrow">Махачкала · предзаказ партиями</p>
            <h1 id="hero-title">Говяжьи рёбра кальби</h1>
            <p className="hero-copy">Сухой маринад из соли, чёрного перца и паприки. Медленное копчение в пеллетном смокере занимает 6–8 часов.</p>
            <a className="cta" href="#ribs">Собрать заказ <span aria-hidden="true">↓</span></a>
            <small className="hero-note">Изображение создано для демонстрации дизайна и не является фотографией блюда продавца.</small>
          </div>
        </div>
      </section>
    </>
  );
}
