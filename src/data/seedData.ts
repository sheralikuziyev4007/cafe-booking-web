import type { Category, MenuItem, Review } from "@/types";

/** Display order of menu categories. Labels live in the i18n dictionaries (t.categories). */
export const CATEGORIES: Category[] = ["coffee", "desserts", "breakfast", "main"];

// Photos are stored locally in public/images/. If a file fails to load, the category icon is shown instead.
export const INITIAL_MENU: MenuItem[] = [
  {
    id: "1",
    category: "coffee",
    price: 28000,
    imageUrl: "/images/flat-white.webp",
    isAvailable: true,
    name: { en: "Flat white", ru: "Флэт уайт", uz: "Flet uayt" },
    description: {
      en: "Double espresso with velvety milk",
      ru: "Двойной эспрессо с бархатистым молоком",
      uz: "Baxmal sutli qoʻsh espresso",
    },
  },
  {
    id: "2",
    category: "coffee",
    price: 32000,
    imageUrl: "/images/raf.webp",
    isAvailable: true,
    name: { en: "Honey raf", ru: "Раф на меду", uz: "Asalli raf" },
    description: {
      en: "Creamy raf with wildflower honey",
      ru: "Сливочный раф с цветочным мёдом",
      uz: "Gul asali qoʻshilgan qaymoqli raf",
    },
  },
  {
    id: "3",
    category: "coffee",
    price: 24000,
    imageUrl: "/images/cappuccino.webp",
    isAvailable: true,
    name: { en: "Cappuccino", ru: "Капучино", uz: "Kapuchino" },
    description: {
      en: "The classic with dense milk foam",
      ru: "Классика с плотной молочной пенкой",
      uz: "Qalin sut koʻpikli klassika",
    },
  },
  {
    id: "4",
    category: "desserts",
    price: 38000,
    imageUrl: "/images/cheesecake.webp",
    isAvailable: true,
    name: { en: "Basque cheesecake", ru: "Чизкейк Basque", uz: "Bask chizkeyki" },
    description: {
      en: "Caramelised outside, creamy inside",
      ru: "Обожжённый снаружи, кремовый внутри",
      uz: "Tashqarisi karamellangan, ichi kremsimon",
    },
  },
  {
    id: "5",
    category: "desserts",
    price: 26000,
    imageUrl: "/images/croissant.webp",
    isAvailable: true,
    name: { en: "Almond croissant", ru: "Круассан миндальный", uz: "Bodomli kruassan" },
    description: {
      en: "Flaky pastry with almond filling",
      ru: "Слоёное тесто, миндальная начинка",
      uz: "Bodom toʻldirmali qatlamli xamir",
    },
  },
  {
    id: "6",
    category: "breakfast",
    price: 34000,
    imageUrl: "/images/oatmeal.webp",
    isAvailable: true,
    name: { en: "Oatmeal with berries", ru: "Овсянка с ягодами", uz: "Rezavorli suli boʻtqasi" },
    description: {
      en: "Made with coconut milk, seasonal berries",
      ru: "На кокосовом молоке, сезонные ягоды",
      uz: "Kokos sutida, mavsumiy rezavorlar bilan",
    },
  },
  {
    id: "7",
    category: "breakfast",
    price: 42000,
    imageUrl: "/images/avocado-toast.webp",
    isAvailable: true,
    name: { en: "Avocado toast", ru: "Авокадо тост", uz: "Avokado tost" },
    description: {
      en: "Rye bread, avocado, poached egg",
      ru: "Ржаной хлеб, авокадо, яйцо пашот",
      uz: "Javdar noni, avokado, pashot tuxum",
    },
  },
  {
    id: "8",
    category: "main",
    price: 56000,
    imageUrl: "/images/pasta.webp",
    isAvailable: true,
    name: { en: "Fettuccine pasta", ru: "Паста Феттучини", uz: "Fettuchini pastasi" },
    description: {
      en: "Cream sauce, mushrooms, parmesan",
      ru: "Сливочный соус, грибы, пармезан",
      uz: "Qaymoqli sous, qoʻziqorin, parmezan",
    },
  },
];

export const REVIEWS: Review[] = [
  {
    id: "1",
    rating: 5,
    authorName: { en: "Madina A.", ru: "Мадина А.", uz: "Madina A." },
    text: {
      en: "The best flat white in town. Really cosy atmosphere — I often come here to work.",
      ru: "Лучший флэт уайт в городе. Атмосфера очень уютная, часто прихожу поработать.",
      uz: "Shahardagi eng zoʻr flet uayt. Muhit juda shinam, tez-tez shu yerga ishlagani kelaman.",
    },
  },
  {
    id: "2",
    rating: 5,
    authorName: { en: "Jasur K.", ru: "Жасур К.", uz: "Jasur K." },
    text: {
      en: "The cheesecake is a work of art. Fast and friendly service.",
      ru: "Чизкейк — отдельный вид искусства. Обслуживание быстрое и приветливое.",
      uz: "Chizkeyk — alohida sanʼat asari. Xizmat tez va samimiy.",
    },
  },
  {
    id: "3",
    rating: 4,
    authorName: { en: "Dilnoza R.", ru: "Дилноза Р.", uz: "Dilnoza R." },
    text: {
      en: "A lovely place for breakfast before work. A bit noisy at weekends.",
      ru: "Прекрасное место для завтрака перед работой. Немного шумно в выходные.",
      uz: "Ishdan oldin nonushta qilish uchun ajoyib joy. Dam olish kunlari biroz shovqinli.",
    },
  },
];
