"use client";

import { useEffect, useRef, useState } from "react";
import { shop } from "@/config/shop";
import { buildMessengerUrl, isChannelConfigured } from "@/lib/domain/order";
import styles from "./MenuCatalog.module.css";

type MenuItem = { id: string; badge: string; title: string; description: string; weight: string; price: number; image: string };
type MenuCategory = { id: string; label: string; subtitle: string; items: MenuItem[] };
const firstPortion = shop.portions.find((item) => item.active) ?? shop.portions.at(0);
const rubles = (value: number) => `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;

const MENU_CATEGORIES: MenuCategory[] = [
  {
    id: "cat-main",
    label: "Основное меню",
    subtitle: "100% Халяль · Томление в смокере 7–8 часов",
    items: [
      {
        id: "ribs",
        image: "/images/menu-kalbi-v9.webp",
        badge: "Хит BBQ in MHK",
        title: "Говяжьи рёбра Кальби",
        description: "Говяжьи рёбра кальби: 7–8 часов томления в живом дыму, тёмный барк, дымное кольцо и сочное мясо. 100% Халяль.",
        weight: `${firstPortion?.weightGrams ?? 300} г`,
        price: firstPortion?.priceRubles ?? 1370,
      },
      {
        id: "brisket-slice",
        image: "/images/menu-brisket-v9.webp",
        badge: "Классика Техаса",
        title: "Говяжий брискет из смокера",
        description: "Сочная грудинка медленного копчения. Тает во рту, подаётся слайсами.",
        weight: "300 г",
        price: 1350,
      },
      {
        id: "pulled-beef",
        image: "/images/menu-pulled-beef-v9.webp",
        badge: "Для компании",
        title: "Рваная говядина BBQ",
        description: "Томлёная лопатка, разобранная на нежные волокна в собственном мясном соку с лёгким ароматом дымка.",
        weight: "350 г",
        price: 1150,
      },
    ],
  },
  {
    id: "cat-sauces",
    label: "Соусы",
    subtitle: "Варим сами специально под копчёное мясо",
    items: [
      {
        id: "sauce-classic",
        image: "/images/menu-sauce-bbq-v9.webp",
        badge: "Фирменный",
        title: "Классический дымный BBQ",
        description: "Густой томатно-пряный соус с лёгкой сладостью и ароматом копчёной паприки.",
        weight: "60 г",
        price: 120,
      },
      {
        id: "sauce-pepper",
        image: "/images/menu-sauce-pepper-v9.webp",
        badge: "С остринкой",
        title: "Перечно-чесночный с дымком",
        description: "Насыщенный соус с дроблёным чёрным перцем, печёным чесноком и специями.",
        weight: "60 г",
        price: 120,
      },
      {
        id: "sauce-berry",
        image: "/images/menu-sauce-pomegranate-v9.webp",
        badge: "К рёбрам",
        title: "Пряный гранатово-ягодный",
        description: "Терпкий кавказский акцент с гранатовым соком и специями — идеально балансирует жирность рёбер.",
        weight: "60 г",
        price: 150,
      },
    ],
  },
  {
    id: "cat-sides",
    label: "Гарниры",
    subtitle: "Правильное дополнение к горячему мясу",
    items: [
      {
        id: "side-potato",
        image: "/images/menu-potatoes-v9.webp",
        badge: "Горячее",
        title: "Печёный картофель со специями",
        description: "Дольки молодого картофеля с хрустящей корочкой, паприкой, чесночным маслом и зеленью.",
        weight: "200 г",
        price: 250,
      },
      {
        id: "side-coleslaw",
        image: "/images/menu-coleslaw-v9.webp",
        badge: "Свежесть",
        title: "Хрустящий салат Коул-слоу",
        description: "Свежая капуста и морковь с лёгкой сливочно-горчичной заправкой — освежает после дымного мяса.",
        weight: "180 г",
        price: 220,
      },
      {
        id: "side-corn",
        image: "/images/menu-corn-v9.webp",
        badge: "На гриле",
        title: "Кукуруза гриль с пряным маслом",
        description: "Сладкий початок кукурузы, обжаренный на решётке с копчёной паприкой и морской солью.",
        weight: "1 шт",
        price: 240,
      },
    ],
  },
  {
    id: "cat-drinks",
    label: "Напитки",
    subtitle: "Охлаждённые напитки к вашему заказу",
    items: [
      {
        id: "drink-mors",
        image: "/images/menu-mors-v9.webp",
        badge: "Домашний",
        title: "Ягодный морс из горных ягод",
        description: "Натуральный освежающий морс собственного приготовления без лишнего сахара.",
        weight: "0.5 л",
        price: 200,
      },
      {
        id: "drink-lemonade",
        image: "/images/menu-tarragon-v9.webp",
        badge: "Освежает",
        title: "Домашний тархун-лимонад",
        description: "Ароматный лимонад на свежем эстрагоне с дольками лайма и мятой.",
        weight: "0.5 л",
        price: 230,
      },
      {
        id: "drink-ayran",
        image: "/images/menu-ayran-v9.webp",
        badge: "Локальный хит",
        title: "Охлаждённый горский айран",
        description: "Классический густой айран с зеленью — лучший напиток к мясу на Кавказе.",
        weight: "0.5 л",
        price: 160,
      },
    ],
  },
];


function inquiryUrl(item: MenuItem) {
  if (!isChannelConfigured("whatsapp")) return "#contacts";
  return buildMessengerUrl("whatsapp", [
    `Здравствуйте! Подскажите, пожалуйста, есть ли в наличии «${item.title}» (${item.weight})?`,
    `В меню указана цена ${rubles(item.price)}. Хочу уточнить стоимость и ближайшее время доставки.`,
  ].join("\n"));
}

export function MenuCatalog() {
  const [activeId, setActiveId] = useState("cat-main");
  const tabsRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = MENU_CATEGORIES.map((category) => document.getElementById(category.id))
      .filter((element): element is HTMLElement => !!element);
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = (barRef.current?.getBoundingClientRect().height ?? 70) + 32;
      let next = sections.at(0)?.id ?? "cat-main";
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) next = section.id;
      }
      setActiveId(next);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  useEffect(() => {
    const container = tabsRef.current;
    const tab = container?.querySelector<HTMLElement>(`a[href="#${activeId}"]`);
    if (!container || !tab) return;
    const left = tab.offsetLeft - container.offsetWidth / 2 + tab.offsetWidth / 2;
    container.scrollTo({ left: Math.max(0, left), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [activeId]);

  return (
    <div id="menu-catalog" className={styles.catalog}>
      <div ref={barRef} className={styles.tabsBar}>
        <nav ref={tabsRef} className={styles.tabs} aria-label="Разделы меню">
          {MENU_CATEGORIES.map((category) => (
            <a key={category.id} href={`#${category.id}`} className={styles.tab}
              aria-current={activeId === category.id ? "location" : undefined}
              onClick={() => setActiveId(category.id)}>{category.label}</a>
          ))}
        </nav>
      </div>
      <p className={styles.imageNote}>Изображения — иллюстрации подачи. Наличие уточняем при подтверждении заявки.</p>
      {MENU_CATEGORIES.map((category) => (
        <section key={category.id} id={category.id} className={styles.category} aria-labelledby={`${category.id}-title`}>
          <div className={styles.container}>
            <header className={styles.heading}>
              <h2 id={`${category.id}-title`}>{category.label}</h2>
              <p>{category.subtitle}</p>
            </header>
            <div className={styles.list}>
              {category.items.map((item) => {
                const ribs = item.id === "ribs";
                const href = ribs ? "#ribs" : inquiryUrl(item);
                const external = href.startsWith("https://");
                return (
                  <article key={item.id} className={styles.card} data-menu-item={item.id} aria-labelledby={`menu-${item.id}-title`}>
                    <div className={styles.media}>
                      <img src={item.image} alt={item.title} width={1080} height={810} loading="lazy" decoding="async" />
                    </div>
                    <div className={styles.body}>
                      <span className={styles.badge}>{item.badge}</span>
                      <h3 id={`menu-${item.id}-title`}>{item.title}</h3>
                      <p className={styles.description}>{item.description}</p>
                      <div className={styles.footer}>
                        <div className={styles.priceGroup}>
                          <strong className={styles.price}>{rubles(item.price)}</strong>
                          <span className={styles.weight}>{item.weight}</span>
                        </div>
                        <a className={styles.action} href={href} target={external ? "_blank" : undefined}
                          rel={external ? "noopener noreferrer" : undefined}
                          aria-label={ribs ? `Выбрать порцию: ${item.title}` : `Уточнить наличие: ${item.title}`}>
                          {ribs ? "Выбрать порцию" : "Уточнить наличие"}<span aria-hidden="true">↗</span>
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
