import { z } from "zod";
import { shop } from "@/config/shop";

const idSchema = z.string().min(1).max(48).regex(/^[a-z0-9_-]+$/i);

export const orderSchema = z.object({
  quantity: z.number().int().min(1).max(10),
  sauceId: idSchema,
  zoneId: idSchema,
  timeSlotId: idSchema,
  channel: z.enum(["whatsapp", "telegram"]),
  website: z.literal(""),
}).strict();

export type OrderInput = z.infer<typeof orderSchema>;

export function calculateOrder(input: OrderInput) {
  const parsed = orderSchema.parse(input);
  if (!shop.orderingOpen) throw new Error("Приём заказов временно закрыт");
  if (parsed.quantity > shop.portion.maxQuantity) throw new Error("Недопустимое количество порций");
  const sauce = shop.sauces.find((item) => item.active && item.id === parsed.sauceId);
  const zone = shop.deliveryZones.find((item) => item.active && item.id === parsed.zoneId);
  const timeSlot = shop.timeSlots.find((item) => item.active && item.id === parsed.timeSlotId);
  if (!sauce || !zone || !timeSlot) throw new Error("Выбранный вариант больше недоступен");

  const meatRubles = shop.portion.priceRubles * parsed.quantity;
  const sauceRubles = sauce.pricePerPortionRubles * parsed.quantity;
  const totalRubles = meatRubles + sauceRubles + zone.feeRubles;
  return { parsed, sauce, zone, timeSlot, meatRubles, sauceRubles, deliveryRubles: zone.feeRubles, totalRubles };
}

export function buildOrderMessage(input: OrderInput, reference: string) {
  const order = calculateOrder(input);
  return {
    ...order,
    messageText: [
      "Здравствуйте! Хочу согласовать заказ BBQ.",
      `Номер заявки: ${reference}`,
      `Говяжьи рёбра кальби: ${shop.portion.weightGrams} г × ${order.parsed.quantity}`,
      `Общий вес: ${shop.portion.weightGrams * order.parsed.quantity} г`,
      `Указанный вес: ${shop.weightDisclosure}`,
      "Сухой маринад: соль, чёрный перец, паприка",
      `Соус: ${order.sauce.title} (${order.sauce.portionLabel})`,
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
  if (channel === "whatsapp") {
    const url = new URL(`https://wa.me/${shop.whatsappDigits}`);
    url.searchParams.set("text", messageText);
    return url.toString();
  }
  const url = new URL(`https://t.me/${shop.telegramUsername}`);
  url.searchParams.set("text", messageText);
  return url.toString();
}
