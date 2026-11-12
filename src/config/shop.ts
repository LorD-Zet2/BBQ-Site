import { z } from "zod";

const idSchema = z.string().min(1).max(48).regex(/^[a-z0-9_-]+$/i);

const shopSchema = z.object({
  brandName: z.string().min(1).max(80),
  city: z.literal("Махачкала"),
  timezone: z.literal("Europe/Moscow"),
  orderingOpen: z.boolean(),
  legalContentReady: z.boolean(),
  whatsappDigits: z.string().regex(/^\d{8,15}$/),
  telegramUsername: z.string().regex(/^[A-Za-z0-9_]{5,32}$/),
  portions: z.array(z.object({
    id: idSchema,
    weightGrams: z.number().int().positive(),
    priceRubles: z.number().int().positive(),
    maxQuantity: z.number().int().min(1).max(10),
    active: z.boolean(),
  }).strict()).min(1),
  sauces: z.array(z.object({
    id: idSchema,
    title: z.string().min(1).max(80),
    portionLabel: z.string().min(1).max(80),
    pricePerPortionRubles: z.number().int().nonnegative(),
    active: z.boolean(),
  }).strict()).min(1),
  deliveryZones: z.array(z.object({
    id: idSchema,
    title: z.string().min(1).max(100),
    feeRubles: z.number().int().nonnegative(),
    active: z.boolean(),
  }).strict()).min(1),
  timeSlots: z.array(z.object({
    id: idSchema,
    title: z.string().min(1).max(120),
    active: z.boolean(),
  }).strict()).min(1),
  weightDisclosure: z.string().min(1).max(240),
}).strict().superRefine((config, ctx) => {
  const allIds = [...config.portions, ...config.sauces, ...config.deliveryZones, ...config.timeSlots].map((item) => item.id);
  if (new Set(allIds).size !== allIds.length) ctx.addIssue({ code: "custom", message: "Все ID должны быть уникальными" });
  if (config.orderingOpen) {
    if (!config.legalContentReady) ctx.addIssue({ code: "custom", path: ["legalContentReady"], message: "Сначала заполните юридические сведения" });
    if (config.whatsappDigits === "70000000000") ctx.addIssue({ code: "custom", path: ["whatsappDigits"], message: "Замените тестовый WhatsApp" });
    if (config.telegramUsername === "replace_me") ctx.addIssue({ code: "custom", path: ["telegramUsername"], message: "Замените тестовый Telegram" });
    if (!config.portions.some((portion) => portion.active)) ctx.addIssue({ code: "custom", path: ["portions"], message: "Включите хотя бы одну порцию" });
    if (config.deliveryZones.some((zone) => zone.id === "setup-zone")) ctx.addIssue({ code: "custom", path: ["deliveryZones"], message: "Замените тестовую зону" });
    if (!config.deliveryZones.some((zone) => zone.active)) ctx.addIssue({ code: "custom", path: ["deliveryZones"], message: "Включите хотя бы одну зону" });
    if (!config.timeSlots.some((slot) => slot.active)) ctx.addIssue({ code: "custom", path: ["timeSlots"], message: "Включите хотя бы один вариант времени" });
  }
});

/*
 * ЕДИНСТВЕННЫЙ БЛОК НАСТРОЕК ВЛАДЕЛЬЦА.
 * 1. Замените цену, контакты, зоны и время.
 * 2. Заполните политику данных и поставьте legalContentReady: true.
 * 3. Последним действием переключите orderingOpen: true.
 * Деньги указываются целыми рублями. Номер WhatsApp — только цифры, Telegram — без @.
 */
export const shop = shopSchema.parse({
  brandName: "BBQ / Махачкала",
  city: "Махачкала",
  timezone: "Europe/Moscow",

  orderingOpen: false,
  legalContentReady: false,

  whatsappDigits: "79993108201",
  telegramUsername: "replace_me",

  portions: [
    { id: "kalbi-300", weightGrams: 300, priceRubles: 1370, maxQuantity: 10, active: true },
    { id: "kalbi-600", weightGrams: 600, priceRubles: 2580, maxQuantity: 8, active: true },
  ],

  sauces: [
    {
      id: "none",
      title: "Без дополнительного соуса",
      portionLabel: "Без доплаты",
      pricePerPortionRubles: 0,
      active: true,
    },
    // Добавляйте подтверждённые соусы по этому образцу:
    // { id: "my-sauce", title: "Название", portionLabel: "50 мл", pricePerPortionRubles: 100, active: true },
  ],

  deliveryZones: [
    {
      id: "setup-zone",
      title: "Замените на вашу зону доставки",
      feeRubles: 0,
      active: true,
    },
  ],

  timeSlots: [
    {
      id: "agree-time",
      title: "Согласовать время с оператором",
      active: true,
    },
  ],

  weightDisclosure: "Вес указан для готового продукта с костями. Доступны порции 300 г и 600 г.",
});

export type ShopConfig = z.infer<typeof shopSchema>;