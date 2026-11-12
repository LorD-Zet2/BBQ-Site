import { shop } from "@/config/shop";
import { Hero } from "@/components/Hero";
import { MenuCatalog } from "@/components/MenuCatalog";
import { OrderBuilder } from "@/components/OrderBuilder";
import { AboutBbqAndInsta } from "@/components/AboutBbqAndInsta";

export default function Home() {
  return (
    <>
      <Hero />
      <main id="main">
        <MenuCatalog />
        <OrderBuilder />
        <AboutBbqAndInsta />

        <section className="section process" id="process" aria-labelledby="process-title">
          <div className="container">
            <p className="section-kicker">Наши стандарты</p>
            <h2 className="section-title" id="process-title">Честный подход к каждой партии</h2>
            <div className="steps">
              <div className="step">
                <h3>Отборная халяльная говядина</h3>
                <p>100% Халяль с проверкой свежести и калибра мяса в каждой партии.</p>
              </div>
              <div className="step">
                <h3>Живой дым и жар</h3>
                <p>Томление без спешки на натуральной древесине для глубокого аромата.</p>
              </div>
              <div className="step">
                <h3>7–8 часов в коптильне</h3>
                <p>Контроль температуры на каждом этапе до идеальной мягкости.</p>
              </div>
              <div className="step">
                <h3>Горячая выдача</h3>
                <p>Упаковываем с сохранением жара и сочности перед отправкой курьером.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="delivery" aria-labelledby="delivery-title">
          <div className="container delivery-grid">
            <div>
              <p className="section-kicker">Получение</p>
              <h2 className="section-title" id="delivery-title">Зоны доставки</h2>
              <p className="section-lead">Стоимость выбранной зоны сразу включается в итог расчёта.</p>
              <ul className="fact-list">
                {shop.deliveryZones
                  .filter((zone) => zone.active)
                  .map((zone) => (
                    <li key={zone.id}>
                      <strong>{zone.title}</strong>
                      <span>{new Intl.NumberFormat("ru-RU").format(zone.feeRubles)} ₽</span>
                    </li>
                  ))}
              </ul>
            </div>
            <aside className="notice">
              <strong>{shop.orderingOpen ? "Заявка в мессенджере" : "Сейчас стоп-лист"}</strong>
              <p>
                {shop.orderingOpen
                  ? "После перехода в WhatsApp или Telegram проверьте текст и отправьте его. Оператор подтвердит наличие и время доставки."
                  : "Приём онлайн-заказов временно приостановлен. Напишите нам для уточнения ближайшей партии."}
              </p>
            </aside>
          </div>
        </section>

        <section className="section process" aria-labelledby="faq-title">
          <div className="container">
            <p className="section-kicker">FAQ</p>
            <h2 className="section-title" id="faq-title">Главное до заявки</h2>
            <div className="faq-list">
              <details>
                <summary>Что означает вес 300 г?</summary>
                <p>{shop.weightDisclosure}</p>
              </details>
              <details>
                <summary>Вся продукция Халяль?</summary>
                <p>Да, 100% Халяль. Мы используем только проверенное халяльное мясо и ингредиенты.</p>
              </details>
              <details>
                <summary>Заявка сразу становится заказом?</summary>
                <p>Сайт формирует готовый текст заявки для мессенджера. После отправки оператор подтвердит наличие, сумму и время доставки.</p>
              </details>
              <details>
                <summary>Как согласовать банкет или свадьбу (50–60 кг)?</summary>
                <p>Крупные партии на мероприятия готовятся под заказ заблаговременно. Напишите нам в мессенджер, чтобы забронировать дату и объём.</p>
              </details>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer" id="contacts">
        <div className="container footer-grid">
          <div>
            <a className="brand" href="#top">
              <img src="/images/logo.PNG" alt="BBQ in MHK" width={48} height={48} />
              <div>
                BBQ <span>in MHK</span>
              </div>
            </a>
            <p className="legal-note">
              BBQ in MHK · Махачкала. Заявка формируется в браузере и отправляется клиентом самостоятельно.
            </p>
          </div>
          <div className="footer-links">
            <a href="#cat-main">Меню</a>
            <a href="#ribs">Конструктор</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram @bbq.mhk</a>
            <a href="/privacy">Политика данных</a>
          </div>
        </div>
      </footer>
    </>
  );
}
