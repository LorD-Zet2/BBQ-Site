"use client";

import { useRef, useState } from "react";
import { shop } from "@/config/shop";
import { buildMessengerUrl, buildOrderMessage, isChannelConfigured, orderSchema } from "@/lib/domain/order";
import styles from "./OrderBuilder.module.css";

type Channel = "whatsapp" | "telegram";
type Choice = { id: string; title: string; detail?: string; disabled?: boolean };
type PreparedOrder = { messageText: string; messengerUrl: string; reference: string };
const rubles = (value: number) => `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
const weight = (value: number) => value < 1000 ? `${value} г` : `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value / 1000)} кг`;

function Choices({ name, value, options, onChange }: {
  name: string; value: string; options: Choice[]; onChange: (id: string) => void;
}) {
  return (
    <div className={styles.choices}>
      {options.map((item) => (
        <label className={styles.choice} key={item.id}>
          <input className={styles.visuallyHidden} type="radio" name={name}
            value={item.id} checked={value === item.id} disabled={item.disabled}
            onChange={() => onChange(item.id)} />
          <span className={styles.choiceBody}>
            <span className={styles.choiceTitle}>{item.title}<span className={styles.check} aria-hidden="true">✓</span></span>
            {item.detail && <span className={styles.choiceDetail}>{item.detail}</span>}
          </span>
        </label>
      ))}
    </div>
  );
}

export function OrderBuilder() {
  const portions = shop.portions.filter((item) => item.active);
  const sauces = shop.sauces.filter((item) => item.active);
  const zones = shop.deliveryZones.filter((item) => item.active);
  const slots = shop.timeSlots.filter((item) => item.active);
  const firstPortion = portions.at(0) ?? shop.portions.at(0);
  const [portionId, setPortionId] = useState(firstPortion?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [sauceId, setSauceId] = useState(sauces.at(0)?.id ?? "");
  const [zoneId, setZoneId] = useState(zones.at(0)?.id ?? "");
  const [timeSlotId, setTimeSlotId] = useState(slots.at(0)?.id ?? "");
  const [channel, setChannel] = useState<Channel>(isChannelConfigured("whatsapp") ? "whatsapp" : "telegram");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [prepared, setPrepared] = useState<PreparedOrder | null>(null);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const copyAttempt = useRef(0);

  const portion = portions.find((item) => item.id === portionId);
  const sauce = sauces.find((item) => item.id === sauceId);
  const zone = zones.find((item) => item.id === zoneId);
  const slot = slots.find((item) => item.id === timeSlotId);
  const maxQuantity = Math.min(portion?.maxQuantity ?? 1, 10);
  const totalWeight = (portion?.weightGrams ?? 0) * quantity;
  const meatRubles = (portion?.priceRubles ?? 0) * quantity;
  const sauceRubles = (sauce?.pricePerPortionRubles ?? 0) * quantity;
  const deliveryRubles = zone?.feeRubles ?? 0;
  const totalRubles = meatRubles + sauceRubles + deliveryRubles;
  const fireLevel = totalWeight <= 600 ? 1 : totalWeight <= 1500 ? 2 : totalWeight <= 3000 ? 3 : 4;
  const companyLabel = ["Небольшой BBQ-вечер", "Ужин в хорошей компании", "Большой стол", "Настоящий BBQ-пир"][fireLevel - 1];
  const canSubmit = shop.orderingOpen && !!portion && !!sauce && !!zone && !!slot && isChannelConfigured(channel);

  function change(update: () => void) {
    copyAttempt.current += 1;
    setPrepared(null);
    setError("");
    setCopied(false);
    update();
  }

  function prepareOrder() {
    setError("");
    setPrepared(null);
    setCopied(false);
    copyAttempt.current += 1;
    if (!shop.orderingOpen) {
      setError("Приём онлайн-заказов временно закрыт. Расчёт доступен для знакомства с меню.");
      return;
    }
    const parsed = orderSchema.safeParse({ portionId, quantity, sauceId, zoneId, timeSlotId, channel, website });
    if (!parsed.success) {
      setError("Проверьте порцию, количество и варианты доставки.");
      return;
    }
    try {
      const reference = `WEB-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      const { messageText } = buildOrderMessage(parsed.data, reference);
      setPrepared({ reference, messageText, messengerUrl: buildMessengerUrl(channel, messageText) });
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось подготовить заявку.");
    }
  }

  async function copyMessage() {
    if (!prepared) return;
    const attempt = ++copyAttempt.current;
    try {
      await navigator.clipboard.writeText(prepared.messageText);
      if (attempt === copyAttempt.current) setCopied(true);
    } catch {
      if (attempt === copyAttempt.current) setError("Выделите текст заявки ниже и скопируйте вручную.");
    }
  }

  return (
    <section id="ribs" className={styles.section} aria-labelledby="builder-title">
      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.kicker}>100% Халяль · 7–8 часов в живом дыму</p>
          <h2 className={styles.title} id="builder-title">Ваш вечер. Ваш BBQ.</h2>
          <p className={styles.lead}>Выберите рёбра и дополнения — мы сразу посчитаем стоимость заявки.</p>
        </header>
        {!shop.orderingOpen && <p className={styles.notice} role="status">Приём заказов временно закрыт. Пока можно собрать и рассчитать свой BBQ-набор.</p>}
        <form className={styles.layout} noValidate onSubmit={(event) => { event.preventDefault(); prepareOrder(); }}>
          <div className={styles.formPanel}>
            <fieldset className={styles.group}>
              <legend className={styles.legend}>01 / Выберите порцию</legend>
              <Choices name="bbq-portion" value={portionId} options={portions.map((item) => ({
                id: item.id, title: weight(item.weightGrams), detail: `${rubles(item.priceRubles)} / порция`,
              }))} onChange={(id) => change(() => {
                setPortionId(id);
                setQuantity((current) => Math.min(current, portions.find((item) => item.id === id)?.maxQuantity ?? 1));
              })} />
              {!portions.length && <p className={styles.hint}>Доступных порций пока нет.</p>}
              <p className={styles.hint}>{shop.weightDisclosure}</p>
            </fieldset>
            <fieldset className={styles.group}>
              <legend className={styles.legend}>02 / Сколько порций?</legend>
              <div className={styles.quantityRow}>
                <div className={styles.presets}>
                  {[1, 2, 4, 6].filter((count) => count <= maxQuantity).map((count) => (
                    <button type="button" key={count} className={styles.preset} aria-pressed={quantity === count}
                      onClick={() => change(() => setQuantity(count))}>{count} шт.</button>
                  ))}
                </div>
                <div className={styles.stepper} role="group" aria-label="Количество порций">
                  <button type="button" aria-label="Уменьшить количество" disabled={!portion || quantity <= 1}
                    onClick={() => change(() => setQuantity((current) => Math.max(1, current - 1)))}>−</button>
                  <output aria-live="polite" aria-label="Выбрано порций">{quantity}</output>
                  <button type="button" aria-label="Увеличить количество" disabled={!portion || quantity >= maxQuantity}
                    onClick={() => change(() => setQuantity((current) => Math.min(maxQuantity, current + 1)))}>+</button>
                </div>
              </div>
              <div className={styles.heatBox}>
                <div className={styles.heatTop}><strong>{companyLabel}</strong><span>{weight(totalWeight)}</span></div>
                <div className={styles.fireScale} aria-hidden="true">
                  {[1, 2, 3, 4].map((level) => <span key={level} className={level <= fireLevel ? styles.fireActive : styles.fire}>🔥</span>)}
                </div>
                <p className={styles.hint}>Больше рёбер — больше поводов собраться. Шкала показывает объём набора, а не остроту.</p>
              </div>
            </fieldset>
            <fieldset className={styles.group}>
              <legend className={styles.legend}>03 / Добавьте соус</legend>
              <Choices name="bbq-sauce" value={sauceId} options={sauces.map((item) => ({
                id: item.id, title: item.title,
                detail: item.pricePerPortionRubles === 0 ? item.portionLabel : `${item.portionLabel} · +${rubles(item.pricePerPortionRubles)} / порция`,
              }))} onChange={(id) => change(() => setSauceId(id))} />
              {sauces.length === 0 && <p className={styles.hint}>Варианты соусов пока недоступны.</p>}
              {sauces.length === 1 && sauces.at(0)?.id === "none" && <p className={styles.hint}>Дополнительные соусы пока не представлены в меню.</p>}
              {sauce && sauce.pricePerPortionRubles > 0 && <p className={styles.hint}>По одному соусу на каждую порцию рёбер. Сейчас: {quantity} шт.</p>}
            </fieldset>
            <fieldset className={styles.group}>
              <legend className={styles.legend}>04 / Доставка и время</legend>
              <fieldset className={styles.subgroup}>
                <legend className={styles.sublabel}>Зона доставки</legend>
                <Choices name="bbq-zone" value={zoneId} options={zones.map((item) => ({
                  id: item.id, title: item.id === "setup-zone" ? "Зона доставки уточняется" : item.title,
                  detail: item.id === "setup-zone" ? "Тариф ещё не настроен" : item.feeRubles === 0 ? "Без доплаты" : rubles(item.feeRubles),
                }))} onChange={(id) => change(() => setZoneId(id))} />
                {!zones.length && <p className={styles.hint}>Зоны доставки пока недоступны.</p>}
              </fieldset>
              <fieldset className={styles.subgroup}>
                <legend className={styles.sublabel}>Желаемое время</legend>
                <Choices name="bbq-time" value={timeSlotId} options={slots.map((item) => ({ id: item.id, title: item.title }))}
                  onChange={(id) => change(() => setTimeSlotId(id))} />
                {!slots.length && <p className={styles.hint}>Время доставки пока недоступно.</p>}
              </fieldset>
            </fieldset>
            <fieldset className={styles.group}>
              <legend className={styles.legend}>05 / Удобный мессенджер</legend>
              <Choices name="bbq-channel" value={channel} options={(["whatsapp", "telegram"] as const).map((id) => ({
                id, title: id === "whatsapp" ? "WhatsApp" : "Telegram",
                detail: isChannelConfigured(id) ? "Заявка в чате" : "Пока не подключён", disabled: !isChannelConfigured(id),
              }))} onChange={(id) => change(() => setChannel(id as Channel))} />
            </fieldset>
            <div hidden aria-hidden="true">
              <label htmlFor="bbq-website">Website</label>
              <input id="bbq-website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
            </div>
          </div>
          <aside className={styles.summary} aria-labelledby="order-summary-title">
            <p className={styles.kicker}>Собрано с аппетитом</p>
            <h3 id="order-summary-title">Ваш BBQ-набор</h3>
            <p className={styles.summaryWeight}>{weight(totalWeight)} <span>готовых рёбер с костями</span></p>
            <dl className={styles.breakdown}>
              <div><dt>Рёбра · {portion ? weight(portion.weightGrams) : "—"} × {quantity}</dt><dd>{rubles(meatRubles)}</dd></div>
              <div><dt>{sauce?.title ?? "Соус не выбран"}</dt><dd>{rubles(sauceRubles)}</dd></div>
              <div><dt>Доставка</dt><dd>{!zone || zone.id === "setup-zone" ? "Уточняется" : rubles(deliveryRubles)}</dd></div>
            </dl>
            <div className={styles.total} aria-live="polite" aria-atomic="true">
              <span>{!zone || zone.id === "setup-zone" ? "Без доставки" : "Итого"}</span><strong>{rubles(totalRubles)}</strong>
            </div>
            <button className={styles.primary} type="submit" disabled={!canSubmit}>
              {shop.orderingOpen ? "Подготовить заявку →" : "Приём заказов закрыт"}
            </button>
            <p className={styles.hint}>Оператор подтвердит наличие, стоимость и время. Заявка отправляется вами в мессенджере.</p>
            <p className={styles.banquet}>Планируете свадьбу или банкет? Партии 50–60 кг согласуем отдельно. <a href="#contacts">Контакты →</a></p>
            {error && <p className={styles.error} role="alert">{error}</p>}
            {prepared && (
              <div ref={resultRef} tabIndex={-1} className={styles.result}>
                <h4>Заявка {prepared.reference} готова</h4>
                <p className={styles.hint}>Откройте чат, проверьте сообщение и нажмите «Отправить». Если текст не подставился, скопируйте его ниже.</p>
                <a className={styles.primary} href={prepared.messengerUrl} target="_blank" rel="noopener noreferrer">
                  Открыть {channel === "whatsapp" ? "WhatsApp" : "Telegram"} →
                </a>
                <button type="button" className={styles.secondary} onClick={copyMessage}>{copied ? "Скопировано ✓" : "Скопировать текст"}</button>
                <label className={styles.sublabel} htmlFor="bbq-message">Текст заявки</label>
                <textarea id="bbq-message" className={styles.message} readOnly rows={10} value={prepared.messageText} />
                <span className={styles.visuallyHidden} role="status">{copied ? "Текст заявки скопирован" : ""}</span>
              </div>
            )}
          </aside>
        </form>
      </div>
    </section>
  );
}
