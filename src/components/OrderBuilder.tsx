"use client";

import { useMemo, useRef, useState } from "react";
import { shop } from "@/config/shop";
import { buildMessengerUrl, buildOrderMessage, orderSchema } from "@/lib/domain/order";
import styles from "./OrderBuilder.module.css";

type PreparedOrder = { messageText: string; messengerUrl: string; reference: string };

const rubles = (value: number) => new Intl.NumberFormat("ru-RU").format(value) + " ₽";
const configuredRubles = (value: number) => (value === 0 && !shop.orderingOpen ? "настройте цену" : rubles(value));

export function OrderBuilder() {
  const activePortion = shop.portions.find((item) => item.active) ?? shop.portions.at(0);
  const activeSauces = shop.sauces.filter((item) => item.active);
  const activeZones = shop.deliveryZones.filter((item) => item.active);
  const activeSlots = shop.timeSlots.filter((item) => item.active);

  const maxQty = activePortion?.maxQuantity ?? 10;
  const portionPrice = activePortion?.priceRubles ?? 0;
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
      setError("Проверьте количество, соус, зону и время.");
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
        setError("Браузер заблокировал открытие чата. Используйте кнопку ниже.");
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
      <div className={styles.head}>
        <p className="section-kicker">Конструктор</p>
        <h2 className="section-title" id="builder-title">Соберите заявку на рёбра</h2>
        <p className="section-lead">{shop.weightDisclosure} Итог считается мгновенно, сообщение отправляете вы сами.</p>
      </div>

      <div className={styles.grid}>
        <form className={styles.form} onSubmit={(event) => { event.preventDefault(); prepareAndOpen(); }} noValidate>
          <fieldset className={styles.group}>
            <legend className={styles.legend}>Порция</legend>
            <div className={styles.segments}>
              <div className={styles.radio}>
                <input id="portion-300" type="radio" checked readOnly />
                <label htmlFor="portion-300">{portionWeight} г · {configuredRubles(portionPrice)}</label>
              </div>
            </div>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>Количество порций</legend>
            <p className={styles.hint}>От 1 до {maxQty}</p>
            <div className={styles.stepper}>
              <button
                type="button"
                aria-label="Уменьшить количество"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              >
                −
              </button>
              <input
                aria-label="Количество порций"
                inputMode="numeric"
                min={1}
                max={maxQty}
                value={quantity}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (Number.isInteger(value)) {
                    setQuantity(Math.min(maxQty, Math.max(1, value)));
                  }
                }}
              />
              <button
                type="button"
                aria-label="Увеличить количество"
                onClick={() => setQuantity((value) => Math.min(maxQty, value + 1))}
              >
                +
              </button>
            </div>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>Соус</legend>
            {activeSauces.map((item) => (
              <div className={styles.sauce} key={item.id}>
                <input
                  id={`sauce-${item.id}`}
                  type="radio"
                  name="sauce"
                  checked={sauceId === item.id}
                  onChange={() => setSauceId(item.id)}
                />
                <label htmlFor={`sauce-${item.id}`}>
                  <span className={styles.sauceTitle}>
                    <span>{item.title}</span>
                    <span>{item.pricePerPortionRubles === 0 ? "Без доплаты" : `+ ${rubles(item.pricePerPortionRubles)}`}</span>
                  </span>
                  <span className={styles.sauceMeta}>{item.portionLabel}</span>
                </label>
              </div>
            ))}
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>Зона доставки</legend>
            <select
              className={styles.select}
              aria-label="Зона доставки"
              value={zoneId}
              onChange={(event) => setZoneId(event.target.value)}
            >
              {activeZones.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} · {rubles(item.feeRubles)}
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>Желаемое время</legend>
            <select
              className={styles.select}
              aria-label="Желаемое время"
              value={timeSlotId}
              onChange={(event) => setTimeSlotId(event.target.value)}
            >
              {activeSlots.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>Мессенджер</legend>
            <div className={styles.segments}>
              <div className={styles.radio}>
                <input
                  id="channel-whatsapp"
                  type="radio"
                  name="channel"
                  checked={channel === "whatsapp"}
                  onChange={() => setChannel("whatsapp")}
                />
                <label htmlFor="channel-whatsapp">WhatsApp</label>
              </div>
              <div className={styles.radio}>
                <input
                  id="channel-telegram"
                  type="radio"
                  name="channel"
                  checked={channel === "telegram"}
                  onChange={() => setChannel("telegram")}
                />
                <label htmlFor="channel-telegram">Telegram</label>
              </div>
            </div>
          </fieldset>

          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor="website">Не заполняйте это поле</label>
            <input
              id="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </div>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <button type="submit" className={styles.submit}>
            Оформить в {channel === "whatsapp" ? "WhatsApp" : "Telegram"} · {configuredRubles(totals.total)}
          </button>

          {prepared && (
            <div className={styles.result} aria-live="polite">
              <h3>Заявка подготовлена</h3>
              <p className={styles.resultText}>
                {chatOpened
                  ? "Проверьте сообщение в мессенджере и отправьте его."
