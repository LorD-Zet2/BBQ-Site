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
  if (!shop.orderingOpen) throw new Error("РџСЂРёС‘Рј Р·Р°РєР°Р·РѕРІ РІСЂРµРјРµРЅРЅРѕ Р·Р°РєСЂС‹С‚");
  const portion = shop.portions.find((item) => item.active && item.id === parsed.portionId);
  const sauce = shop.sauces.find((item) => item.active && item.id === parsed.sauceId);
  const zone = shop.deliveryZones.find((item) => item.active && item.id === parsed.zoneId);
  const timeSlot = shop.timeSlots.find((item) => item.active && item.id === parsed.timeSlotId);
  if (!portion || !sauce || !zone || !timeSlot) throw new Error("Р’С‹Р±СЂР°РЅРЅС‹Р№ РІР°СЂРёР°РЅС‚ Р±РѕР»СЊС€Рµ РЅРµРґРѕСЃС‚СѓРїРµРЅ");
  if (parsed.quantity > portion.maxQuantity) throw new Error("РќРµРґРѕРїСѓСЃС‚РёРјРѕРµ РєРѕР»РёС‡РµСЃС‚РІРѕ РїРѕСЂС†РёР№");
  if (!isChannelConfigured(parsed.channel)) throw new Error("Р­С‚РѕС‚ РјРµСЃСЃРµРЅРґР¶РµСЂ РїРѕРєР° РЅРµ РїРѕРґРєР»СЋС‡С‘РЅ");
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
      `Р—РґСЂР°РІСЃС‚РІСѓР№С‚Рµ! РҐРѕС‡Сѓ СЃРѕРіР»Р°СЃРѕРІР°С‚СЊ Р·Р°РєР°Р· ${shop.brandName}.`,
      `РќРѕРјРµСЂ Р·Р°СЏРІРєРё: ${reference}`,
      `Р“РѕРІСЏР¶СЊРё СЂС‘Р±СЂР° РєР°Р»СЊР±Рё: ${order.portion.weightGrams} Рі Г— ${order.parsed.quantity}`,
      `РћР±С‰РёР№ РІРµСЃ РіРѕС‚РѕРІРѕРіРѕ РїСЂРѕРґСѓРєС‚Р° СЃ РєРѕСЃС‚СЏРјРё: ${order.portion.weightGrams * order.parsed.quantity} Рі`,
      "100% РҐР°Р»СЏР»СЊ. 7вЂ“8 С‡Р°СЃРѕРІ С‚РѕРјР»РµРЅРёСЏ РІ Р¶РёРІРѕРј РґС‹РјСѓ.",
      `РЎРѕСѓСЃ: ${order.sauce.title} (${order.sauce.portionLabel}) Г— ${order.parsed.quantity}`,
      `Р”РѕСЃС‚Р°РІРєР°: ${order.zone.title}`,
      `Р–РµР»Р°РµРјРѕРµ РІСЂРµРјСЏ: ${order.timeSlot.title}`,
      `РњСЏСЃРѕ: ${order.meatRubles} в‚Ѕ`,
      `РЎРѕСѓСЃ: ${order.sauceRubles} в‚Ѕ`,
      `Р”РѕСЃС‚Р°РІРєР°: ${order.deliveryRubles} в‚Ѕ`,
      `РС‚РѕРіРѕ: ${order.totalRubles} в‚Ѕ`,
      "РџРѕРґС‚РІРµСЂРґРёС‚Рµ, РїРѕР¶Р°Р»СѓР№СЃС‚Р°, РЅР°Р»РёС‡РёРµ, РѕРєРѕРЅС‡Р°С‚РµР»СЊРЅСѓСЋ СЃС‚РѕРёРјРѕСЃС‚СЊ Рё РІСЂРµРјСЏ.",
    ].join("\n"),
  };
}

export function buildMessengerUrl(channel: OrderInput["channel"], messageText: string) {
  if (!isChannelConfigured(channel)) throw new Error("Р­С‚РѕС‚ РјРµСЃСЃРµРЅРґР¶РµСЂ РїРѕРєР° РЅРµ РїРѕРґРєР»СЋС‡С‘РЅ");
  const url = new URL(channel === "whatsapp"
    ? `https://wa.me/${shop.whatsappDigits}`
    : `https://t.me/${shop.telegramUsername}`);
  url.searchParams.set("text", messageText);
  return url.toString();
}
