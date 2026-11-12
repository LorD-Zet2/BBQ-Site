import { z } from "zod";
import { shop } from "@/config/shop";

const idSchema = z.string().min(1).max(48).regex(/^[a-z0-9_-]+$/i);

export const orderSchema = z.object({
  portionId: idSchema,
  quantity: z.number().int().min(1).max(10),
  sauceId: idSchema,
  zoneId: idSchema,
  timeSlotId: idSchema,
  channel: z.enum(["whatsapp", "telegram"]),
  website: z.literal(""),
}).strict();

export type OrderInput = z.infer<typeof orderSchema>;

export function isChannelConfigured(channel: OrderInput["channel"]) {
  return channel === "whatsapp"
    ? /^\d{8,15}$/.test(shop.whatsappDigits) && shop.whatsappDigits !== "70000000000"
    : /^[A-Za-z0-9_]{5,32}$/.test(shop.telegramUsername) && shop.telegramUsername !== "replace_me";
}

export function calculateOrder(input: OrderInput) {
  const parsed = orderSchema.parse(input);
  if (!shop.orderingOpen) throw new Error("Приём заказов временно закрыт");
  const portion = shop.portions.find((item) => item.active && item.id === parsed.portionId);
  const sauce = shop.sauces.find((item) => item.active && item.id === parsed.sauceId);
  const zone = shop.deliveryZones.find((item) => item.active && item.id === parsed.zoneId);
  const timeSlot = shop.timeSlots.find((item) => item.active && item.id === parsed.timeSlotId);
  if (!portion || !sauce || !zone || !timeSlot) throw new Error("Выбранный вариант больше недоступен");
  if (parsed.quantity > portion.maxQuantity) throw new Error("Недопустимое количество порций");
  if (!isChannelConfigured(parsed.channel)) throw new Error("Этот мессенджер пока не подключён");
  const meatRubles = portion.priceRubles * parsed.quantity;
  const sauceRubles = sauce.pricePerPortionRubles * parsed.quantity;
  const deliveryRubles = zone.feeRubles;
  return {
    parsed, portion, sauce, zone, timeSlot, meatRubles, sauceRubles,
    deliveryRubles, totalRubles: meatRubles + sauceRubles + deliveryRubles,
  };
}

export function buildOrderMessage(input: OrderInput, reference: string) {
  const order = calculateOrder(input);
  return {
    ...order,
    messageText: [
      `Здравствуйте! Хочу согласовать заказ ${shop.brandName}.`,
      `Номер заявки: ${reference}`,
      `Говяжьи рёбра кальби: ${order.portion.weightGrams} г × ${order.parsed.quantity}`,
      `Общий вес готового продукта с костями: ${order.portion.weightGrams * order.parsed.quantity} г`,
      "100% Халяль. 7–8 часов томления в живом дыму.",
      `Соус: ${order.sauce.title} (${order.sauce.portionLabel}) × ${order.parsed.quantity}`,
      `Доставка: ${order.zone.title}`,
      `Желаемое время: ${order.timeSlot.title}`,
      `Мясо: ${order.meatRubles} ₽`,
      `Соус: ${order.sauceRubles} ₽`,
      `Доставка: ${order.deliveryRubles} ₽`,
      `Итого: ${order.totalRubles} ₽`,
      "Подтвердите, пожалуйста, наличие, окончательную стоимость и время.",
    ].join("\n"),
  };
}

export function buildMessengerUrl(channel: OrderInput["channel"], messageText: string) {
  if (!isChannelConfigured(channel)) throw new Error("Этот мессенджер пока не подключён");
  const url = new URL(channel === "whatsapp"
    ? `https://wa.me/${shop.whatsappDigits}`
    : `https://t.me/${shop.telegramUsername}`);
  url.searchParams.set("text", messageText);
  return url.toString();
}
