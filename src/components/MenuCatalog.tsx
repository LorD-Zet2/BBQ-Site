"use client";

import { useEffect, useState } from "react";

type MenuItem = {
  id: string;
  badge: string;
  title: string;
  description: string;
  weight: string;
  price: number;
};

type MenuCategory = {
  id: string;
  label: string;
  subtitle: string;
  items: MenuItem[];
};

const MENU_CATEGORIES: MenuCategory[] = [
  {
    id: "cat-main",
    label: "Основное меню",
    subtitle: "100% Халяль · Томление в смокере 6–8 часов",
    items: [
      {
        id: "ribs",
        badge: "Хит BBQ in MHK",
        title: "Говяжьи рёбра Кальби",
        description: "Мраморные говяжьи рёбра в авторском сухом маринаде (соль, чёрный перец, паприка). Нежное мясо с дымной корочкой.",
        weight: "300 г",
        price: 1200,
      },
      {
        id: "brisket-slice",
        badge: "Классика Техаса",
        title: "Говяжий брискет из смокера",
        description: "Сочная грудинка медленного копчения. Тает во рту, подаётся слайсами.",
        weight: "300 г",
        price: 1350,
      },
      {
        id: "pulled-beef",
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
        badge: "Фирменный",
        title: "Классический дымный BBQ",
        description: "Густой томатно-пряный соус с лёгкой сладостью и ароматом копчёной паприки.",
        weight: "60 г",
        price: 120,
      },
      {
        id: "sauce-pepper",
        badge: "С остринкой",
        title: "Перечно-чесночный с дымком",
        description: "Насыщенный соус с дроблёным чёрным перцем, печёным чесноком и специями.",
        weight: "60 г",
        price: 120,
      },
      {
        id: "sauce-berry",
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
        badge: "Горячее",
        title: "Печёный картофель со специями",
        description: "Дольки молодого картофеля с хрустящей корочкой, паприкой, чесночным маслом и зеленью.",
        weight: "200 г",
        price: 250,
      },
      {
        id: "side-coleslaw",
        badge: "Свежесть",
        title: "Хрустящий салат Коул-слоу",
        description: "Свежая капуста и морковь с лёгкой сливочно-горчичной заправкой — освежает после дымного мяса.",
        weight: "180 г",
        price: 220,
      },
      {
        id: "side-corn",
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
        badge: "Домашний",
        title: "Ягодный морс из горных ягод",
        description: "Натуральный освежающий морс собственного приготовления без лишнего сахара.",
        weight: "0.5 л",
        price: 200,
      },
      {
        id: "drink-lemonade",
        badge: "Освежает",
        title: "Домашний тархун-лимонад",
        description: "Ароматный лимонад на свежем эстрагоне с дольками лайма и мятой.",
        weight: "0.5 л",
        price: 230,
      },
      {
        id: "drink-ayran",
        badge: "Локальный хит",
        title: "Охлаждённый горский айран",
        description: "Классический густой айран с зеленью — лучший напиток к мясу на Кавказе.",
        weight: "0.5 л",
        price: 160,
      },
    ],
  },
];

export function MenuCatalog() {
  const [activeId, setActiveId] = useState<string>(MENU_CATEGORIES.at(0)?.id ?? "cat-main");

  useEffect(() => {
    const sections = MENU_CATEGORIES.map((cat) => document.getElementById(cat.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );

    if (sections.length === 0) return;

    const handleScroll = () => {
      const triggerLine = window.scrollY + 180;
      let currentId = sections.at(0)?.id ?? "cat-main";

      for (const section of sections) {
        if (section.offsetTop <= triggerLine) {
          currentId = section.id;
        }
      }
      setActiveId(currentId);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div id="menu-catalog">
      {/* Липкая панель вкладок, которая сама переключается при прокрутке */}
      <div className="cat-tabs-bar" role="navigation" aria-label="Разделы меню">
        <div className="container">
          <div className="cat-tabs">
            {MENU_CATEGORIES.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className={`cat-tab ${activeId === cat.id ? "active" : ""}`}
                onClick={() => setActiveId(cat.id)}
              >
                {cat.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Единая лента всех 4 разделов меню */}
      {MENU_CATEGORIES.map((cat) => (
        <section key={cat.id} id={cat.id} className="menu-block" aria-labelledby={`${cat.id}-title`}>
          <div className="container">
            <div className="menu-block-head">
              <div>
                <h2 className="menu-block-title" id={`${cat.id}-title`}>
                  {cat.label}
                </h2>
                <p className="section-lead" style={{ marginTop: "6px" }}>
                  {cat.subtitle}
                </p>
              </div>
            </div>

            <div className="menu-grid">
              {cat.items.map((item) => (
                <article key={item.id} className="menu-card">
                  <div>
                    <span className="menu-badge">{item.badge}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                  <div className="menu-card-footer">
                    <div>
                      <span className="menu-price">{new Intl.NumberFormat("ru-RU").format(item.price)} ₽</span>
                      <span className="menu-weight">{item.weight}</span>
                    </div>
                    <a href="#ribs" className="menu-btn">
                      В заказ
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
