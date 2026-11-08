-- Starter menu for Coffee&Co (generated from src/data/seedData.ts).
-- Safe to run more than once: rows are inserted only while the table is empty.

insert into public.menu_items (name, description, category, price, image_url, is_available)
select * from (values
  ('{"en":"Flat white","ru":"Флэт уайт","uz":"Flet uayt"}'::jsonb, '{"en":"Double espresso with velvety milk","ru":"Двойной эспрессо с бархатистым молоком","uz":"Baxmal sutli qoʻsh espresso"}'::jsonb, 'coffee', 28000, '/images/flat-white.webp', true),
  ('{"en":"Honey raf","ru":"Раф на меду","uz":"Asalli raf"}'::jsonb, '{"en":"Creamy raf with wildflower honey","ru":"Сливочный раф с цветочным мёдом","uz":"Gul asali qoʻshilgan qaymoqli raf"}'::jsonb, 'coffee', 32000, '/images/raf.webp', true),
  ('{"en":"Cappuccino","ru":"Капучино","uz":"Kapuchino"}'::jsonb, '{"en":"The classic with dense milk foam","ru":"Классика с плотной молочной пенкой","uz":"Qalin sut koʻpikli klassika"}'::jsonb, 'coffee', 24000, '/images/cappuccino.webp', true),
  ('{"en":"Basque cheesecake","ru":"Чизкейк Basque","uz":"Bask chizkeyki"}'::jsonb, '{"en":"Caramelised outside, creamy inside","ru":"Обожжённый снаружи, кремовый внутри","uz":"Tashqarisi karamellangan, ichi kremsimon"}'::jsonb, 'desserts', 38000, '/images/cheesecake.webp', true),
  ('{"en":"Almond croissant","ru":"Круассан миндальный","uz":"Bodomli kruassan"}'::jsonb, '{"en":"Flaky pastry with almond filling","ru":"Слоёное тесто, миндальная начинка","uz":"Bodom toʻldirmali qatlamli xamir"}'::jsonb, 'desserts', 26000, '/images/croissant.webp', true),
  ('{"en":"Tiramisu","ru":"Тирамису","uz":"Tiramisu"}'::jsonb, '{"en":"Mascarpone cream, espresso-soaked savoiardi, cocoa","ru":"Крем маскарпоне, савоярди в эспрессо, какао","uz":"Maskarpone kremi, espressoga boʻktirilgan savoyardi, kakao"}'::jsonb, 'desserts', 36000, '/images/tiramisu.webp', true),
  ('{"en":"Oatmeal with berries","ru":"Овсянка с ягодами","uz":"Rezavorli suli boʻtqasi"}'::jsonb, '{"en":"Made with coconut milk, seasonal berries","ru":"На кокосовом молоке, сезонные ягоды","uz":"Kokos sutida, mavsumiy rezavorlar bilan"}'::jsonb, 'breakfast', 34000, '/images/oatmeal.webp', true),
  ('{"en":"Avocado toast","ru":"Авокадо тост","uz":"Avokado tost"}'::jsonb, '{"en":"Rye bread, avocado, poached egg","ru":"Ржаной хлеб, авокадо, яйцо пашот","uz":"Javdar noni, avokado, pashot tuxum"}'::jsonb, 'breakfast', 42000, '/images/avocado-toast.webp', true),
  ('{"en":"Fettuccine pasta","ru":"Паста Феттучини","uz":"Fettuchini pastasi"}'::jsonb, '{"en":"Cream sauce, mushrooms, parmesan","ru":"Сливочный соус, грибы, пармезан","uz":"Qaymoqli sous, qoʻziqorin, parmezan"}'::jsonb, 'main', 56000, '/images/pasta.webp', true)
) as starter(name, description, category, price, image_url, is_available)
where not exists (select 1 from public.menu_items);
