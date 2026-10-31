import heroEditorialImg from '../assets/images/hero_editorial_fashion_1793353078880.jpg';
import collectionEssentialsImg from '../assets/images/collection_essentials_1793353080279.jpg';
import collectionTailoringImg from '../assets/images/collection_tailoring_1793353082196.jpg';
import collectionWeekendImg from '../assets/images/collection_weekend_1793353083427.jpg';
import brandStoryImg from '../assets/images/brand_story_editorial_1793353085350.jpg';
import campaignPerspectiveImg from '../assets/images/campaign_perspective_1793353087043.jpg';

import cottonTshirtImg from '../assets/images/cotton_tshirt_1793353087530.jpg';
import linenShirtImg from '../assets/images/linen_shirt_1793353089127.jpg';
import structuredOvershirtImg from '../assets/images/structured_overshirt_1793353091452.jpg';
import knitSweaterImg from '../assets/images/knit_sweater_1793353092465.jpg';
import tailoredTrousersImg from '../assets/images/tailored_trousers_1793353095379.jpg';
import bomberJacketImg from '../assets/images/bomber_jacket_1793353094062.jpg';
import relaxedDenimImg from '../assets/images/relaxed_denim_1793353095768.jpg';
import summerJacketImg from '../assets/images/summer_jacket_1793353097850.jpg';
import classicPoloImg from '../assets/images/classic_polo_1793353099415.jpg';
import premiumHoodieImg from '../assets/images/premium_hoodie_1793353100026.jpg';
import everydayChinosImg from '../assets/images/everyday_chinos_1793353102064.jpg';
import knitCardiganImg from '../assets/images/knit_cardigan_1793353104416.jpg';

export const EDITORIAL_MEDIA = {
  hero: {
    src: heroEditorialImg,
    alt: 'Model wearing an unstructured taupe wool-linen coat over a warm ivory knit in a sunlit travertine courtyard'
  },
  story: {
    src: brandStoryImg,
    alt: 'Close-up editorial study of draped oatmeal merino knitwear and tailored herringbone wool coat in natural window light'
  },
  campaign: {
    src: campaignPerspectiveImg,
    alt: 'Low-angle architectural campaign photograph of a model striding in a minimalist black trench coat and warm ivory tailored trousers'
  }
};

export const FEATURED_COLLECTIONS = [
  {
    id: 'Everyday Essentials',
    title: 'Everyday Essentials',
    kicker: 'Collection 01',
    subtitle: 'Timeless wardrobe foundations crafted from heavyweight organic cottons and fine-gauge merino.',
    cta: 'Shop Everyday Essentials',
    image: collectionEssentialsImg,
    alt: 'Two models dressed in warm ivory knitwear, beige overshirt, and charcoal tailored trousers in a plaster studio'
  },
  {
    id: 'Modern Tailoring',
    title: 'Modern Tailoring',
    kicker: 'Collection 02',
    subtitle: 'Refined shirts, pleated trousers, and architectural outerwear designed for fluid movement.',
    cta: 'Explore Modern Tailoring',
    image: collectionTailoringImg,
    alt: 'Model wearing a dark charcoal wool overshirt and pleated taupe wide-leg trousers beside a travertine column'
  },
  {
    id: 'Weekend Collection',
    title: 'Weekend Collection',
    kicker: 'Collection 03',
    subtitle: 'Breathable European flax linen, washed ecru denim, and unhurried silhouettes for off-duty days.',
    cta: 'Shop Weekend Collection',
    image: collectionWeekendImg,
    alt: 'Adult in a sand linen shirt and relaxed ecru trousers seated on a stone coastal terrace at dusk'
  }
];

export const PRODUCTS = [
  {
    id: 'essential-cotton-t-shirt',
    name: 'Essential Cotton T-Shirt',
    price: 75,
    category: 'Tops & Shirts',
    collection: 'Everyday Essentials',
    image: cottonTshirtImg,
    imageAlt: 'Essential Cotton T-Shirt in Warm Ivory heavyweight organic cotton',
    colors: ['Warm Ivory', 'Soft Beige', 'Charcoal', 'Black'],
    defaultColor: 'Warm Ivory',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    availability: 'in-stock',
    isNewArrival: true,
    arrivalRank: 1,
    shortDescription: 'Heavyweight 240gsm organic cotton jersey with a structured crew neckline.',
    description:
      'Cut with a considered, slightly relaxed drape that holds its silhouette from morning through evening. Knitted from long-staple organic cotton for a dry, substantial handfeel that softens subtly with wear without losing collar tension.',
    details: [
      '100% GOTS-certified organic combed cotton (240gsm)',
      'Double-needle binded rib collar engineered to resist stretching',
      'Clean straight hem with subtle dropped shoulder line',
      'Cut and sewn in northern Portugal'
    ],
    care: [
      'Machine wash cold (30°C) inside out with mild detergent',
      'Do not tumble dry; reshape whilst damp and line dry in shade',
      'Warm iron on reverse if desired'
    ]
  },
  {
    id: 'relaxed-linen-shirt',
    name: 'Relaxed Linen Shirt',
    price: 155,
    category: 'Tops & Shirts',
    collection: 'Weekend Collection',
    image: linenShirtImg,
    imageAlt: 'Relaxed Linen Shirt in Soft Beige European flax linen',
    colors: ['Soft Beige', 'Warm Ivory', 'Muted Taupe'],
    defaultColor: 'Soft Beige',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    availability: 'in-stock',
    isNewArrival: true,
    arrivalRank: 2,
    shortDescription: 'Washed European flax linen cut for effortless airflow and soft drape.',
    description:
      'Woven from traceable Belgian and French flax fibers and enzyme-washed for immediate softness against the skin. Designed with a clean French placket, genuine mother-of-pearl buttons, and an unrestrictive back box pleat.',
    details: [
      '100% European Masters of Linen certified flax (165gsm)',
      'Tonal mother-of-pearl buttons with reinforced shank stitching',
      'Point collar with removable collar stays for structured or relaxed wear',
      'Curved shirttail hem suitable worn tucked or loose'
    ],
    care: [
      'Gentle machine wash at 30°C or hand wash cold',
      'Hang dry naturally to preserve relaxed linen grain',
      'Steam lightly or press damp on medium heat'
    ]
  },
  {
    id: 'structured-overshirt',
    name: 'Structured Overshirt',
    price: 235,
    category: 'Outerwear',
    collection: 'Modern Tailoring',
    image: structuredOvershirtImg,
    imageAlt: 'Structured Overshirt in Charcoal brushed cotton-wool twill',
    colors: ['Charcoal', 'Muted Taupe', 'Black'],
    defaultColor: 'Charcoal',
    sizes: ['S', 'M', 'L', 'XL'],
    availability: 'in-stock',
    isNewArrival: true,
    arrivalRank: 3,
    shortDescription: 'Architectural cotton-wool twill layer bridging shirt and tailored jacket.',
    description:
      'Designed as a transitional outer layer with crisp, jacket-like poise. Tailored from Italian brushed cotton-wool twill featuring symmetrical chest utility pockets, concealed side seam pockets, and dark corozo nut buttons.',
    details: [
      '68% organic cotton, 32% virgin merino wool brushed twill',
      'Natural matte corozo buttons throughout',
      'Two mitered chest flap pockets plus discreet side welt pockets',
      'Unlined interior with clean bound French seams'
    ],
    care: [
      'Dry clean recommended to maintain structured finish',
      'Air garment on a wide wooden hanger between wears',
      'Spot clean minor marks with a damp cloth'
    ]
  },
  {
    id: 'everyday-knit-sweater',
    name: 'Everyday Knit Sweater',
    price: 185,
    category: 'Knitwear',
    collection: 'Everyday Essentials',
    image: knitSweaterImg,
    imageAlt: 'Everyday Knit Sweater in Muted Taupe fine-gauge merino wool',
    colors: ['Muted Taupe', 'Warm Ivory', 'Charcoal', 'Black'],
    defaultColor: 'Muted Taupe',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    availability: 'in-stock',
    isNewArrival: false,
    arrivalRank: 7,
    shortDescription: 'Fully fashioned 12-gauge Australian merino crew-neck for year-round layering.',
    description:
      'Spun from extra-fine 19.5-micron merino wool that regulates temperature naturally across changing climates. Fully fashioned at the armhole and shoulder for zero seam bulk underneath coats or tailoring.',
    details: [
      '100% Responsible Wool Standard (RWS) extra-fine merino',
      'Fully fashioned saddle shoulder construction',
      'Tubular rib-knit collar, cuffs, and waistband',
      'Breathable mid-weight 12-gauge jersey stitch'
    ],
    care: [
      'Hand wash cold using wool-specific detergent',
      'Gently press excess water in a towel; dry flat away from direct heat',
      'Store folded rather than hung to preserve shoulder line'
    ]
  },
  {
    id: 'tailored-straight-leg-trousers',
    name: 'Tailored Straight-Leg Trousers',
    price: 220,
    category: 'Trousers & Denim',
    collection: 'Modern Tailoring',
    image: tailoredTrousersImg,
    imageAlt: 'Tailored Straight-Leg Trousers in Charcoal pleated virgin wool blend',
    colors: ['Charcoal', 'Black', 'Muted Taupe'],
    defaultColor: 'Charcoal',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    availability: 'in-stock',
    isNewArrival: true,
    arrivalRank: 4,
    shortDescription: 'Single-pleat high-twist wool trousers with an elongated, clean fall.',
    description:
      'Cut with a mid-to-high rise and single front pleats that open effortlessly in motion while maintaining a sharp vertical crease. Woven in Biella from crease-resistant high-twist virgin wool.',
    details: [
      '100% high-twist Italian virgin wool (260gsm)',
      'Extended hook-and-bar waistband tab with interior French bearer',
      'Quarter-top front pockets and buttoned rear welt pockets',
      'Half-lined to the knee in breathable cupro'
    ],
    care: [
      'Professional dry clean only',
      'Hang vertically by the cuffs on a trouser clamp hanger',
      'Steam lightly between wears to refresh natural crease'
    ]
  },
  {
    id: 'minimalist-bomber-jacket',
    name: 'Minimalist Bomber Jacket',
    price: 295,
    category: 'Outerwear',
    collection: 'Modern Tailoring',
    image: bomberJacketImg,
    imageAlt: 'Minimalist Bomber Jacket in Black matte wool-blend cloth',
    colors: ['Black', 'Charcoal'],
    defaultColor: 'Black',
    sizes: ['S', 'M', 'L', 'XL'],
    availability: 'made-to-order',
    isNewArrival: true,
    arrivalRank: 5,
    shortDescription: 'Refined cropped blouson stripped of excess hardware in matte wool gabardine.',
    description:
      'A pared-back reinterpretation of the classic flight silhouette. Crafted from water-repellent wool gabardine with a concealed two-way metal zipper, tonal rib trims, and a clean architectural volume through the sleeve.',
    details: [
      '80% virgin wool, 20% recycled polyamide gabardine with PFC-free DWR',
      'Concealed two-way brushed gunmetal zipper placket',
      'Full breathable viscose twill lining with internal passport pocket',
      'Made in small batches; ships within 4–5 business days'
    ],
    care: [
      'Specialist dry clean only',
      'Brush gently with a soft garment brush after outdoor wear',
      'Do not machine wash or tumble dry'
    ]
  },
  {
    id: 'relaxed-denim-jeans',
    name: 'Relaxed Denim Jeans',
    price: 190,
    category: 'Trousers & Denim',
    collection: 'Weekend Collection',
    image: relaxedDenimImg,
    imageAlt: 'Relaxed Denim Jeans in Warm Ivory 13.5oz organic selvedge cotton',
    colors: ['Warm Ivory', 'Charcoal', 'Black'],
    defaultColor: 'Warm Ivory',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    availability: 'in-stock',
    isNewArrival: false,
    arrivalRank: 8,
    shortDescription: 'Undyed ecru 13.5oz organic cotton denim with a relaxed straight leg.',
    description:
      'Five-pocket jeans cut with generous room through the thigh tapering subtly toward the ankle. Woven from unbleached organic cotton yarns that retain subtle natural flecks and develop character over years of wear.',
    details: [
      '100% organic cotton 13.5oz shuttle-loom denim',
      'Matte antique nickel shank button and zip fly',
      'Clean tonal stitching with bar-tack reinforcement instead of loud branding',
      '31.5-inch standard inseam suitable for clean break or single cuff'
    ],
    care: [
      'Wash infrequently cold inside out with similar light tones',
      'Line dry naturally; avoid bleach or optical brighteners',
      'Warm iron if required'
    ]
  },
  {
    id: 'lightweight-summer-jacket',
    name: 'Lightweight Summer Jacket',
    price: 245,
    category: 'Outerwear',
    collection: 'Weekend Collection',
    image: summerJacketImg,
    imageAlt: 'Lightweight Summer Jacket in Soft Beige crisp cotton poplin',
    colors: ['Soft Beige', 'Warm Ivory'],
    defaultColor: 'Soft Beige',
    sizes: ['XS', 'S', 'M', 'L'],
    availability: 'in-stock',
    isNewArrival: true,
    arrivalRank: 6,
    shortDescription: 'Unlined cropped notched-lapel jacket in crisp high-density cotton poplin.',
    description:
      'Engineered for warm-weather polish when a traditional blazer feels overly formal. Constructed completely unlined with clean taped seams, architectural patch pockets, and a breezy boxy-cropped proportion.',
    details: [
      '100% compact long-staple cotton poplin (195gsm)',
      'Notched lapel with three-button horn closure',
      'Generous architectural front patch pockets',
      'Featherlight unlined interior with tonal cotton tape binding'
    ],
    care: [
      'Machine wash cold gentle cycle or dry clean',
      'Hang immediately on a contoured hanger to dry',
      'Steam or press on medium cotton setting'
    ]
  },
  {
    id: 'classic-polo-shirt',
    name: 'Classic Polo Shirt',
    price: 130,
    category: 'Tops & Shirts',
    collection: 'Modern Tailoring',
    image: classicPoloImg,
    imageAlt: 'Classic Polo Shirt in Black fine-knit mercerized cotton',
    colors: ['Black', 'Warm Ivory', 'Muted Taupe'],
    defaultColor: 'Black',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    availability: 'in-stock',
    isNewArrival: false,
    arrivalRank: 9,
    shortDescription: 'Buttonless open-placket knit polo in smooth high-twist cotton.',
    description:
      'Replacing sporty piqué with fine 14-gauge high-twist gassed cotton knitwear, our Classic Polo frames the collarbone with a clean buttonless V-placket that layers effortlessly under tailoring or stands alone.',
    details: [
      '100% high-twist gassed Egyptian cotton knit',
      'Clean open Johnny-collar placket with zero buttons',
      'Finely ribbed sleeve cuffs and waistband for a neat blouson sit',
      'Naturally breathable dry-touch finish'
    ],
    care: [
      'Hand wash cold or delicate machine wash in a mesh garment bag',
      'Dry flat on a clean surface to retain knit geometry',
      'Cool iron with press cloth'
    ]
  },
  {
    id: 'premium-hoodie',
    name: 'Premium Hoodie',
    price: 165,
    category: 'Knitwear',
    collection: 'Weekend Collection',
    image: premiumHoodieImg,
    imageAlt: 'Premium Hoodie in Soft Beige heavyweight loopback organic cotton',
    colors: ['Soft Beige', 'Charcoal', 'Black'],
    defaultColor: 'Soft Beige',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    availability: 'in-stock',
    isNewArrival: false,
    arrivalRank: 10,
    shortDescription: 'Drawstring-free architectural hoodie in 460gsm organic loopback fleece.',
    description:
      'Elevated loungewear stripped of athletic clutter. Cut from diagonal loopback organic cotton jersey with a double-layered self-standing hood, discreet side-seam pockets instead of a bulky kangaroo pouch, and crisp rib trims.',
    details: [
      '100% organic diagonal loopback cotton (460gsm)',
      'Double-lined structured hood without drawstrings or metal eyelets',
      'Concealed side-seam welt pockets for a clean front profile',
      'Pre-shrunk and garment-washed in Braga, Portugal'
    ],
    care: [
      'Machine wash cold (30°C) inside out with similar colors',
      'Line dry flat; do not tumble dry on high heat',
      'Steam lightly from inside'
    ]
  },
  {
    id: 'everyday-chinos',
    name: 'Everyday Chinos',
    price: 175,
    category: 'Trousers & Denim',
    collection: 'Everyday Essentials',
    image: everydayChinosImg,
    imageAlt: 'Everyday Chinos in Muted Taupe organic cotton cavalry twill',
    colors: ['Muted Taupe', 'Soft Beige', 'Charcoal', 'Black'],
    defaultColor: 'Muted Taupe',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    availability: 'in-stock',
    isNewArrival: false,
    arrivalRank: 11,
    shortDescription: 'Tapered organic cotton twill trousers tailored with dress-pant precision.',
    description:
      'Bridging weekday versatility and weekend ease, our Everyday Chinos pair durable peached organic cotton twill with tailored internal waistband construction, horn buttons, and a clean tapered leg.',
    details: [
      '98% organic cotton, 2% elastane compact cavalry twill (285gsm)',
      'Tailored curtain waistband with split-back alteration seam',
      'Slanted side pockets, coin welt pocket, and two rear welt pockets',
      'Garment-dyed for rich tonal depth'
    ],
    care: [
      'Machine wash cold gentle cycle inside out',
      'Line dry in shade to preserve tonal dye finish',
      'Medium iron on reverse'
    ]
  },
  {
    id: 'textured-knit-cardigan',
    name: 'Textured Knit Cardigan',
    price: 260,
    category: 'Knitwear',
    collection: 'Everyday Essentials',
    image: knitCardiganImg,
    imageAlt: 'Textured Knit Cardigan in Charcoal heavy fisherman brioche merino wool',
    colors: ['Charcoal', 'Muted Taupe', 'Warm Ivory'],
    defaultColor: 'Charcoal',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    availability: 'made-to-order',
    isNewArrival: false,
    arrivalRank: 12,
    shortDescription: 'Lofty 5-gauge brioche-rib merino cardigan with dark horn buttons.',
    description:
      'Knitted in a tactile three-dimensional brioche rib that traps warmth while maintaining fluid drape. Finished with a clean V-neck placket, natural dark horn buttons, and subtly integrated front pockets.',
    details: [
      '100% Responsible Wool Standard chunky 5-gauge merino wool',
      'Three-dimensional fisherman brioche stitch throughout',
      'Genuine dark horn buttons with reinforced grosgrain backing',
      'Knitted to order in small runs; ships within 4–5 business days'
    ],
    care: [
      'Hand wash cold only with gentle wool wash',
      'Roll in a dry towel to remove moisture and dry flat',
      'Never hang; store folded flat'
    ]
  }
];

export const SAMPLE_REVIEWS = [
  {
    id: 'review-1',
    quote:
      'The weight of the Essential Cotton T-Shirt and the drape of the Tailored Straight-Leg Trousers immediately set them apart. Everything pairs effortlessly without overthinking.',
    author: 'Clara Lindqvist',
    context: 'Architectural Designer, Stockholm — Sample Perspective',
    piece: 'Tailored Straight-Leg Trousers'
  },
  {
    id: 'review-2',
    quote:
      'I packed only four VELORA pieces for a week in Lisbon—the Relaxed Linen Shirt and Structured Overshirt handled cool mornings and warm dinners with quiet confidence.',
    author: 'Marcus Vance',
    context: 'Creative Director, London — Sample Perspective',
    piece: 'Structured Overshirt'
  },
  {
    id: 'review-3',
    quote:
      'Removing drawstrings and bulky pockets from the Premium Hoodie transforms how refined casualwear can look. The fabric texture feels substantial and enduring.',
    author: 'Elena Rostova',
    context: 'Gallery Curator, Milan — Sample Perspective',
    piece: 'Premium Hoodie'
  }
];

export const POLICY_MODALS = {
  shipping: {
    title: 'Shipping Information',
    kicker: 'Demonstration Store Policy',
    paragraphs: [
      'Complimentary standard climate-conscious shipping is demonstrated on orders above $250. Orders under $250 calculate a flat $15 demonstration delivery rate.',
      'In-stock garments are modeled on a 1–2 business day dispatch schedule from our fictional European studio, while Made-to-Order knitwear and outerwear are modeled on a 4–5 business day dispatch window.',
      'Please note: VELORA is a portfolio demonstration website created to showcase e-commerce design and frontend engineering. No physical shipments are dispatched.'
    ]
  },
  returns: {
    title: 'Returns & Exchanges',
    kicker: 'Demonstration Store Policy',
    paragraphs: [
      'A real VELORA storefront offers 30-day complimentary returns and size exchanges on unworn garments with original woven tags attached.',
      'Returned items are inspected and steamed in small-batch fulfillment studios to minimize textile waste and maintain garment integrity.',
      'Because this site is an agency portfolio demonstration, no financial transactions, refunds, or return labels are generated.'
    ]
  },
  support: {
    title: 'Client Care & Atelier Support',
    kicker: 'Demonstration Concierge',
    paragraphs: [
      'Our fictional client care team illustrates how contemporary fashion brands offer personal sizing guidance, fabric care advice, and wardrobe styling.',
      'Demonstration Hours: Monday – Friday, 09:00 – 18:00 CET.',
      'Demonstration Contact: atelier@velora-demo.example (fictional address — messages are not transmitted).'
    ]
  },
  sizeGuide: {
    title: 'Size & Proportion Guide',
    kicker: 'VELORA Fit Architecture',
    paragraphs: [
      'VELORA garments are drafted with a modern, slightly relaxed silhouette designed to skim rather than cling. Take your usual size for our intended editorial drape, or size down in outerwear for a closer shoulder line.',
      'XS: Chest 34–36" (86–91 cm) · Waist 27–29" (68–74 cm)',
      'S: Chest 36–38" (91–96 cm) · Waist 29–31" (74–79 cm)',
      'M: Chest 38–40" (96–101 cm) · Waist 31–33" (79–84 cm)',
      'L: Chest 40–42" (101–107 cm) · Waist 33–35" (84–89 cm)',
      'XL: Chest 42–45" (107–114 cm) · Waist 35–38" (89–96 cm)'
    ]
  }
};
