import { shop } from "@/config/shop";
import { Hero } from "@/components/Hero";
import { OrderBuilder } from "@/components/OrderBuilder";

export default function Home() {
  return (
    <>
      <Hero />
      <main id="main">
        <OrderBuilder />
        <section className="section process" id="process" aria-labelledby="process-title"><div className="container"><p className="section-kicker">Как готовим</p><h2 className="section-title" id="process-title">Медленно. Партиями. Без спешки.</h2><div className="steps"><div className="step"><h3>Говяжьи рёбра</h3><p>Сырьё требует документальной прослеживаемости до коммерческого запуска.</p></div><div className="step"><h3>Сухой маринад</h3><p>Соль, чёрный перец и паприка.</p></div><div className="step"><h3>Смокер</h3><p>Ориентир цикла одной партии — 6–8 часов.</p></div><div className="step"><h3>Подготовка к выдаче</h3><p>Фактическое наличие и время подтверждает оператор.</p></div></div></div></section>
        <section className="section" id="delivery" aria-labelledby="delivery-title"><div className="container delivery-grid"><div><p className="section-kicker">Получение</p><h2 className="section-title" id="delivery-title">Зоны доставки</h2><p className="section-lead">Стоимость выбранной зоны сразу включается в итог.</p><ul className="fact-list">{shop.deliveryZones.filter((zone) => zone.active).map((zone) => <li key={zone.id}><strong>{zone.title}</strong><span>{new Intl.NumberFormat("ru-RU").format(zone.feeRubles)} ₽</span></li>)}</ul></div><aside className="notice"><strong>{shop.orderingOpen ? "Заявка в мессенджере" : "Сейчас стоп-лист"}</strong><p>{shop.orderingOpen ? "После перехода проверьте текст и отправьте его. Оператор подтвердит наличие, итоговую сумму и время." : "Владелец ещё не включил приём заказов в едином файле настроек."}</p></aside></div></section>
        <section className="section process" aria-labelledby="faq-title"><div className="container"><p className="section-kicker">FAQ</p><h2 className="section-title" id="faq-title">Главное до заявки</h2><div className="faq-list"><details><summary>Что означает вес 300 г?</summary><p>{shop.weightDisclosure}</p></details><details><summary>Какие есть соусы?</summary><p>{shop.sauces.filter((sauce) => sauce.active).map((sauce) => sauce.title).join(", ")}.</p></details><details><summary>Заявка сразу становится заказом?</summary><p>Нет. Сайт готовит черновик сообщения. Клиент сам отправляет его, а оператор подтверждает наличие, конечную стоимость и время.</p></details><details><summary>Как согласовать банкет?</summary><p>Объём от 5 кг и крупные партии требуют отдельного расчёта мощности и ручного подтверждения.</p></details></div></div></section>
      </main>
      <footer className="site-footer" id="contacts"><div className="container footer-grid"><div><a className="brand" href="#top"><span>{shop.brandName}</span></a><p className="legal-note">Заявка формируется в браузере и отправляется клиентом самостоятельно. Заказ считается согласованным только после ответа оператора.</p></div><div className="footer-links"><a href="#ribs">Конструктор</a><a href="/privacy">Политика данных</a></div></div></footer>
      <noscript><div className="demo-strip">Для расчёта и формирования заявки требуется JavaScript.</div></noscript>
    </>
  );
}
