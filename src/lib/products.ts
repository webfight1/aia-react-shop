export interface Product {
  id: string;
  name: string;
  amount: string;
  price: number;
  image: string;
  description: string;
}

const img = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=400&q=70`;

export const products: Product[] = [
  { id: "p1", name: "AEDHERNES 'Meduza'", amount: "30 grammi", price: 1.85, image: img("1518977676601-b53f82aba655"), description: "Magus ja mahlane suhkruhernes, sobib hästi värskelt söömiseks ja külmutamiseks. Varajane sort, kõrge saagikusega." },
  { id: "p2", name: "TOMAT 'Oxheart Orange'", amount: "0,1 grammi", price: 2.95, image: img("1592924357228-91a4daadcfea"), description: "Suur oranž härjasüdame-tüüpi tomat, lihav ja vähese seemnesisaldusega. Suurepärane maitse salatites." },
  { id: "p3", name: "TOMAT 'Red Deuce' F1", amount: "10 seemet", price: 2.45, image: img("1607305387299-a3d9611cd469"), description: "Vastupidav punane hübriidtomat, ühtlase suuruse ja kvaliteediga viljad. Sobib nii kasvuhoonesse kui ka avamaale." },
  { id: "p4", name: "NUIKAPSAS 'Eder' F1", amount: "25 seemet", price: 2.25, image: img("1589927986089-35812388d1f4"), description: "Õrn ja mahlane heleroheline nuikapsas, ei muutu kiududeks. Varajane saak." },
  { id: "p5", name: "PORRULAUK 'Bulgina'", amount: "100 seemet", price: 1.79, image: "https://picsum.photos/seed/porrulauk/400/400", description: "Keskvalmiv porrulauk pikkade valgete varte ja õrna maitsega. Vastupidav talvele." },
  { id: "p6", name: "KURK 'Ilonara' F1", amount: "20 seemet", price: 3.65, image: img("1604977042946-1eecc30f269e"), description: "Partenokarpne salatkurk, kibedusvaba ja krõmps. Suurepärane saak kogu hooaja vältel." },
  { id: "p7", name: "MELON 'Monica' F1", amount: "5 seemet", price: 3.95, image: img("1571575173700-afb9492e6a50"), description: "Aromaatne ja magus melon, sobib hästi kasvuhoonesse Eesti kliimas." },
  { id: "p8", name: "PORGAND 'Agatha' F1", amount: "1 gramm", price: 2.15, image: img("1582515073490-39981397c445"), description: "Nantese tüüpi porgand, sile ja magus. Hea säilivusega talvel." },
  { id: "p9", name: "PEET 'Boldor'", amount: "50 seemet", price: 1.95, image: img("1593105544559-ecb03bf76f82"), description: "Erekollane peet, magus ja õrn. Värvi säilitab ka keetmisel." },
  { id: "p10", name: "REDIS 'Celesta' F1", amount: "5 grammi", price: 1.65, image: img("1597362925123-77861d3fbac7"), description: "Ümar punane redis, ei muutu õõnsaks. Sobib külviks kogu suve." },
  { id: "p11", name: "SALAT 'Lollo Rossa'", amount: "1 gramm", price: 1.45, image: img("1622205313162-be1d5712a43f"), description: "Lokkis lehtsalat, sügavpunaste lehtedega. Hea kibekas-magus maitse." },
  { id: "p12", name: "PAPRIKA 'California Wonder'", amount: "15 seemet", price: 2.75, image: img("1583119912267-cc97c911e416"), description: "Klassikaline magus paprika, paksu seinaga viljad. Küpsedes muutub punaseks." },
  { id: "p13", name: "BASIILIK 'Genovese'", amount: "0,5 grammi", price: 1.55, image: img("1600692470802-d8c4090e0d31"), description: "Klassikaline Itaalia basiilik, ideaalne pesto ja salatite jaoks." },
  { id: "p14", name: "TILL 'Mammoth'", amount: "3 grammi", price: 1.25, image: img("1518977822534-7049a61ee0c2"), description: "Lopsakas till suurte vihtadega, aromaatne. Sobib nii värskeks tarbimiseks kui ka konservimiseks." },
  { id: "p15", name: "PETERSELL 'Gigante d'Italia'", amount: "2 grammi", price: 1.35, image: img("1600326145552-327c4df2c246"), description: "Lehtpetersell suurte tumeroheliste lehtedega, tugeva maitsega." },
  { id: "p16", name: "KÕRVITS 'Uchiki Kuri'", amount: "8 seemet", price: 2.85, image: img("1570586437263-ab629fccc818"), description: "Magus oranž Hokkaido kõrvits, kasvatatav ja hästi säiliv. Pähklise maitsega." },
  { id: "p17", name: "SUVIKÕRVITS 'Black Beauty'", amount: "12 seemet", price: 1.95, image: img("1596196842090-2cdab92a04df"), description: "Klassikaline tumeroheline suvikõrvits, viljakas ja kompaktne taim." },
  { id: "p18", name: "MAITSEHERNES 'Spencer Mix'", amount: "1 gramm", price: 2.55, image: img("1597305877032-0668b3c6413e"), description: "Lõhnav lillsegu suurte lainjate õitega. Ideaalne lõikelilledeks." },
  { id: "p19", name: "PÄEVALILL 'Sunspot'", amount: "10 seemet", price: 1.85, image: img("1597848212624-a19eb35e2651"), description: "Kompaktne päevalill, kasvab vaid 60 cm kõrguseks, kuid kannab suurt õit." },
  { id: "p20", name: "SAMETLILL 'Durango Mix'", amount: "0,5 grammi", price: 1.65, image: img("1600880292089-90a7e086ee0c"), description: "Suurte täidetud õitega sametlill, õitseb varakult kuni külmadeni." },
];

export const specialOffer = {
  name: "TOMAT 'Tigerella'",
  amount: "20 seemet",
  oldPrice: 3.25,
  newPrice: 1.95,
  image: img("1546470427-e26264be0b0d"),
};
