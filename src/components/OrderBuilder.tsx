"use client";

import { useMemo, useRef, useState } from "react";
import { shop } from "@/config/shop";
import { buildMessengerUrl, buildOrderMessage, orderSchema } from "@/lib/domain/order";
import styles from "./OrderBuilder.module.css";

type PreparedOrder = { messageText: string; messengerUrl: string; reference: string };

const rubles = (value: number) => new Intl.NumberFormat("ru-RU").format(value) + " ₽";

function getHeatLevel(qty: number) {
  if (qty <= 1) return { fires: "🔥", label: "На одного · Лёгкий дымок", percent: 20 };
  if (qty <= 3) return { fires: "🔥🔥", label: "На двоих-троих · Хороший жар", percent: 45 };
  if (qty <= 6) return { fires: "🔥🔥🔥", label: "На компанию · Полный смокер", percent: 75 };
  return { fires: "🔥🔥🔥🔥", label: "Мощный пир · Максимальный жар", percent: 100 };
}

export function OrderBuilder() {
  const activePortion = shop.portions.find((item) => item.active) ?? shop.portions.at(0);
  const activeSauces = shop.sauces.filter((item) => item.active);
  const activeZones = shop.deliveryZones.filter((item) => item.active);
  const activeSlots = shop.timeSlots.filter((item) => item.active);

  const maxQty = activePortion?.maxQuantity ?? 10;
  const portionPrice = activePortion?.priceRubles ?? 1370;
  const portionWeight = activePortion?.weightGrams ?? 300;

  const [quantity, setQuantity] = useState(1);
  const [sauceId, setSauceId] = useState(activeSauces.at(0)?.id ?? "");
  const [zoneId, setZoneId] = useState(activeZones.at(0)?.id ?? "");
  const [timeSlotId, setTimeSlotId] = useState(activeSlots.at(0)?.id ?? "");
  const [channel, setChannel] = useState<"whatsapp" | "telegram">("whatsapp");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [prepared, setPrepared] = useState<PreparedOrder | null>(null);
  const [copied, setCopied] = useState(false);
  const [chatOpened, setChatOpened] = useState(false);
  const startedAt = useRef(Date.now());

  const sauce = activeSauces.find((item) => item.id === sauceId);
  const zone = activeZones.find((item) => item.id === zoneId);
  const heat = getHeatLevel(quantity);

  const totals = useMemo(() => {
    const meat = portionPrice * quantity;
    const sauceTotal = (sauce?.pricePerPortionRubles ?? 0) * quantity;
    const delivery = zone?.feeRubles ?? 0;
    return { meat, sauce: sauceTotal, delivery, total: meat + sauceTotal + delivery };
  }, [portionPrice, quantity, sauce?.pricePerPortionRubles, zone?.feeRubles]);

  function prepareAndOpen() {
    setError("");
    setPrepared(null);
    setChatOpened(false);

    if (Date.now() - startedAt.current < 700) {
      setError("Форма отправлена слишком быстро. Проверьте выбор и повторите.");
      return;
    }

    const parsed = orderSchema.safeParse({ quantity, sauceId, zoneId, timeSlotId, channel, website });
    if (!parsed.success) {
      setError("Проверьте количество, соус, зону и время доставки.");
      return;
    }

    if (!shop.orderingOpen) {
      setError("Сейчас действует стоп-лист. Приём заказов временно закрыт.");
      return;
    }

    try {
      const reference = `WEB-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      const { messageText } = buildOrderMessage(parsed.data, reference);
      const messengerUrl = buildMessengerUrl(channel, messageText);
      setPrepared({ messageText, messengerUrl, reference });
      const newWindow = window.open(messengerUrl, "_blank");
      if (newWindow) newWindow.opener = null;
      setChatOpened(Boolean(newWindow));
      if (!newWindow) {
        setError("Браузер заблокировал открытие чата. Нажмите кнопку «Открыть чат» ниже.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось подготовить заявку");
    }
  }

  async function copyMessage() {
    if (!prepared) return;
    try {
      await navigator.clipboard.writeText(prepared.messageText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Не удалось скопировать автоматически. Выделите текст вручную.");
    }
  }

  return (
    <section className={styles.section} id="ribs" aria-labelledby="builder-title">
      <div className="container">
        <div className={styles.head}>
          <p className="section-kicker">Конструктор заказа</p>
          <h2 className="section-title" id="builder-title">Соберите заявку на рёбра</h2>
          <p className="section-lead">{shop.weightDisclosure} Итог считается мгновенно.</p>
        </div>

        <div className={styles.grid}>
          <form
            className={styles.form}
            onSubmit={(event) => {
              event.preventDefault();
              prepareAndOpen();
            }}
            noValidate
          >
            {/* Блок порций + интерактив огня */}
            <div className={styles.group}>
              <div className={styles.groupHeader}>
                <span className={styles.legend}>Количество порций (по {portionWeight} г)</span>
                <span className={styles.priceBadge}>{rubles(portionPrice)} / шт</span>
              </div>

              <div className={styles.qtyRow}>
                <div className={styles.presets}>
                  {[1, 2, 3, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`${styles.presetBtn} ${quantity === num ? styles.presetActive : ""}`}
                      onClick={() => setQuantity(num)}
                    >
                      {num} {num === 1 ? "порция" : num < 5 ? "порции" : "порций"}
                    </button>
                  ))}
                </div>

                <div className={styles.stepper}>
                  <button
                    type="button"
                    aria-label="Уменьшить количество"
                    onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                  >
                    −
                  </button>
                  <span className={styles.qtyValue}>{quantity}</span>
                  <button
                    type="button"
                    aria-label="Увеличить количество"
                    onClick={() => setQuantity((v) => Math.min(maxQty, v + 1))}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Интерактивная шкала жара и дыма */}
              <div className={styles.heatBox}>
                <div className={styles.heatTop}>
                  <span className={styles.heatFires}>{heat.fires}</span>
                  <span className={styles.heatLabel}>{heat.label}</span>
                  <span className={styles.heatWeight}>{quantity * portionWeight} г мяса</span>
                </div>
                <div className={styles.heatTrack}>
                  <div className={styles.heatFill} style={{ width: `${heat.percent}%` }} />
                </div>
              </div>
            </div>

            {/* Выбор соуса */}
            <div className={styles.group}>
              <span className={styles.legend}>Фирменный соус</span>
              <div className={styles.sauceGrid}>
                {activeSauces.map((item) => {
                  const selected = sauceId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`${styles.sauceCard} ${selected ? styles.sauceSelected : ""}`}
                      onClick={() => setSauceId(item.id)}
                    >
                      <div className={styles.sauceTop}>
                        <strong>{item.title}</strong>
                        <span className={styles.saucePrice}>
                          {item.pricePerPortionRubles === 0 ? "Бесплатно" : `+ ${rubles(item.pricePerPortionRubles)}`}
                        </span>
                      </div>
                      <span className={styles.sauceMeta}>{item.portionLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Зона и время доставки в аккуратных полях */}
            <div className={styles.twoCols}>
              <div className={styles.group}>
                <label className={styles.legend} htmlFor="zone-select">Зона доставки</label>
                <div className={styles.selectWrap}>
                  <select
                    id="zone-select"
                    className={styles.select}
                    value={zoneId}
                    onChange={(event) => setZoneId(event.target.value)}
                  >
                    {activeZones.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title} · {item.feeRubles === 0 ? "Бесплатно" : rubles(item.feeRubles)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.group}>
                <label className={styles.legend} htmlFor="time-select">Желаемое время</label>
                <div className={styles.selectWrap}>
                  <select
                    id="time-select"
                    className={styles.select}
                    value={timeSlotId}
                    onChange={(event) => setTimeSlotId(event.target.value)}
                  >
                    {activeSlots.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Выбор мессенджера */}
            <div className={styles.group}>
              <span className={styles.legend}>Куда отправить заявку</span>
              <div className={styles.messengerRow}>
                <button
type="button"
className={${styles.messengerBtn} ${channel === "whatsapp" ? styles.messengerActive : ""}}
onClick={() => setChannel("whatsapp")}
>
WhatsApp

<button
type="button"
className={${styles.messengerBtn} ${channel === "telegram" ? styles.messengerActive : ""}}
onClick={() => setChannel("telegram")}
>
Telegram


{/* Скрытая защита от спам-ботов (не видна человеку) */}
Website
<input
id="website"
tabIndex={-1}
autoComplete="off"
value={website}
onChange={(event) => setWebsite(event.target.value)}
/>
{error && {error}}
{prepared && (

Заявка сформирована

{chatOpened
? "Проверьте сообщение в открывшемся мессенджере и нажмите «Отправить»."
: "Нажмите «Открыть чат» или скопируйте готовый текст заявки."}




Открыть чат


{copied ? "Скопировано ✓" : "Скопировать текст"}



)}
{/* Правая карточка с итогом (всегда аккуратно закреплена) */}


Ваша заявка
{heat.fires}
Рёбра кальби ({portionWeight} г × {quantity})
{rubles(totals.meat)}


Соус ({sauce?.title ?? "Без соуса"})
{totals.sauce === 0 ? "0 ₽" : rubles(totals.sauce)}


Доставка ({zone?.title ?? "Не выбрана"})
{totals.delivery === 0 ? "0 ₽" : rubles(totals.delivery)}

Итого к оплате
{rubles(totals.total)}
{shop.orderingOpen
? Оформить в ${channel === "whatsapp" ? "WhatsApp" : "Telegram"}
: "Стоп-лист"}
Оплата после подтверждения наличия оператором. Вы всегда можете скорректировать детали в чате.




);
}
