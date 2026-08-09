export type Product = {
  id: string;
  name: string;
  flavor: string;
  price: number;
  image: string;
  description: string;
  benefits: string[];
  ingredients: string[];
  badge: string;
  stockStatus: string;
};

export const orderStatuses = [
  "New Order",
  "Order Confirmed",
  "Order Ongoing",
  "Delivered",
  "Cancelled",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

const defaultProductId = "urja-nava-ras";

export const siteConfig = {
  brandName: "Mithaas Urja",
  parentCompany: "Mithaas Enterprises",
  slogan: "हर घुट्कामा मिठास, हर दिनमा ऊर्जा।",
  sloganEnglish: "Mithaas in Every Sip, Urja in Every Day.",
  theme: {
    primary: "#F28C28",
    secondary: "#2D6A4F",
    accent: "#FFB84C",
    background: "#FFF9F4",
    text: "#2D2D2D",
  },
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:3000",
  logoSrc: "/logo.png",
  logoAlt: "Mithaas Enterprises official logo",
  currency: "NPR",
  currencyLabel: "Rs.",
  supportEmail:
    process.env.EMAIL_FROM || process.env.BUSINESS_EMAIL || "shahisanjeet2442@gmail.com",
  businessEmail:
    process.env.BUSINESS_EMAIL || process.env.EMAIL_FROM || "shahisanjeet2442@gmail.com",
  supportPhone: "9849512442",
  whatsappNumber: "9849512442",
  instagramUrl: "https://instagram.com",
  facebookUrl: "https://facebook.com",
  emailUrl: "mailto:shahisanjeet2442@gmail.com",
  phoneUrl: "tel:9849512442",
  brandStatement:
    "A premium fruit-based wellness drink crafted for modern everyday energy and refreshing taste.",
  heroHeadline: "Premium fruit refreshment for modern everyday rituals.",
  heroSubheadline:
    "Crafted with seasonal fruit inspiration, Mithaas Urja brings bright flavor, natural energy, and a premium Cash On Delivery shopping experience together in one elegant brand.",
  productDescription:
    "A refreshing fruit-based wellness drink designed for active lifestyles, family moments, and repeat everyday enjoyment.",
  pricePerPiece: 350,
  bottleSize: "250ml",
  discountRules: [
    {
      minQuantity: 2,
      percentage: 20,
      label: "Buy 2 Get 20% Off",
    },
  ],
  delivery: {
    normalFee: 150,
    freeDeliveryThreshold: 4,
    freeDeliveryMessage: "🎉 Congratulations! You unlocked FREE delivery.",
    standardDeliveryMessage: (remaining: number) =>
      `Only ${remaining} more bottles needed for FREE delivery.`,
  },
  maxQuantity: 12,
  defaultProductId,
  products: [
    {
      id: "urja-nava-ras",
      name: "Mithaas Urja",
      flavor: "Nava Ras",
      price: 350,
      image: "/products/product-1.png",
      description:
        "A bright, fruity expression with a fresh balance that feels uplifting throughout the day.",
      benefits: [
        "Fresh and vibrant fruit taste",
        "Premium wellness-led positioning",
        "Great for daily refreshment",
      ],
      ingredients: ["Seasonal fruits", "Natural flavors", "Clean water", "Careful blending"],
      badge: "Best Seller",
      stockStatus: "In Stock",
    },
    {
      id: "urja-sea-buckthorn",
      name: "Mithaas Urja",
      flavor: "Sea Buckthorn",
      price: 350,
      image: "/products/product-2.png",
      description:
        "An orange-forward, golden fruit profile with a lively finish and a premium shelf presence.",
      benefits: [
        "Bold citrus-inspired freshness",
        "Feels clean and energizing",
        "Perfect for an elevated daily routine",
      ],
      ingredients: ["Sea buckthorn inspiration", "Seasonal fruit notes", "Natural refreshment"],
      badge: "Fresh Pick",
      stockStatus: "In Stock",
    },
    {
      id: "urja-energy-booster",
      name: "Mithaas Urja",
      flavor: "Energy Booster",
      price: 350,
      image: "/products/product-3.png",
      description:
        "A richly layered fruit blend designed to feel energizing, bright, and easy to enjoy.",
      benefits: [
        "Everyday energy support",
        "Multi-fruit premium blend",
        "Ideal for active lifestyles",
      ],
      ingredients: ["Mixed fruits", "Natural inspiration", "Refreshing fruit notes"],
      badge: "Energy Blend",
      stockStatus: "In Stock",
    },
    {
      id: "urja-ritu-amrit",
      name: "Mithaas Urja",
      flavor: "Ritu Amrit",
      price: 350,
      image: "/products/product-4.png",
      description:
        "A smooth, floral-fruit expression with a warm and luxurious finish for repeat buyers.",
      benefits: [
        "Smooth premium finish",
        "Seasonal fruit warmth",
        "Designed for gifting and daily use",
      ],
      ingredients: ["Fruit essence", "Natural notes", "Premium blend"],
      badge: "Editor's Choice",
      stockStatus: "In Stock",
    },
  ] satisfies Product[],
  trustPoints: [
    "Cash On Delivery available",
    "100% Organic positioning",
    "Fresh ingredients",
    "Fast delivery across Nepal",
    "Made in Nepal",
    "Secure checkout",
  ],
  features: [
    {
      icon: "organic",
      title: "100% Organic",
      description: "Fruit-led storytelling with a clean, natural, premium identity.",
    },
    {
      icon: "energy",
      title: "Natural Energy",
      description: "A bright everyday drink that feels light, refreshing, and uplifting.",
    },
    {
      icon: "fruit",
      title: "Seasonal Fruits",
      description: "Inspired by seasonal fruit goodness for a fresher taste experience.",
    },
    {
      icon: "shield",
      title: "No Preservatives",
      description: "A cleaner positioning that helps shoppers feel confident and reassured.",
    },
    {
      icon: "cod",
      title: "Cash On Delivery",
      description: "A simple, low-friction checkout journey for trust-first shoppers.",
    },
    {
      icon: "truck",
      title: "Fast Delivery",
      description: "Clear delivery promise messaging that supports faster conversion.",
    },
    {
      icon: "fresh",
      title: "Fresh Taste",
      description: "Bright, juicy, and refreshing from the first glance to the first sip.",
    },
    {
      icon: "made-in-nepal",
      title: "Made in Nepal",
      description: "Local pride with a polished premium presentation that feels export-ready.",
    },
  ],
  stats: [
    { label: "★★★★★ Rating", value: 4.9 },
    { label: "Orders Delivered", value: 1280 },
    { label: "Repeat Customers", value: 64 },
    { label: "Happy Customers", value: 2400 },
  ],
  benefits: [
    {
      title: "Fruit-forward refreshment",
      description:
        "A refreshing fruit-based wellness drink designed to feel light, tasty, and easy to enjoy every day.",
    },
    {
      title: "Everyday energy support",
      description:
        "A flavorful drink that fits mornings, breaks, family time, and active routines.",
    },
    {
      title: "Seasonal fruit goodness",
      description:
        "Crafted around seasonal fruit inspiration for a fresh and naturally appealing experience.",
    },
    {
      title: "COD-friendly ordering",
      description:
        "A simple checkout flow that works smoothly for Cash On Delivery shoppers.",
    },
  ],
  whyChoose: [
    {
      title: "Natural ingredients",
      description: "Fruit-led storytelling that feels clean, modern, and credible.",
    },
    {
      title: "Healthy lifestyle",
      description: "Positioned as a better everyday choice for conscious customers.",
    },
    {
      title: "Refreshing taste",
      description: "A bright, vibrant brand feel that matches the flavor promise.",
    },
    {
      title: "Quality manufacturing",
      description: "Premium presentation that signals care, consistency, and trust.",
    },
    {
      title: "Affordable",
      description: "Accessible pricing with a compelling buy-more save-more offer.",
    },
    {
      title: "Trusted brand",
      description: "A polished experience that feels established and ready to scale.",
    },
  ],
  testimonials: [
    {
      name: "Riya Sharma",
      role: "Kathmandu",
      quote:
        "Mithaas Urja has become my go-to drink when I need a refreshing boost. It tastes fresh, feels light, and gives me a nice burst of energy without feeling heavy.",
    },
    {
      name: "Aayush Thapa",
      role: "Lalitpur",
      quote:
        "I really enjoyed the fresh fruit taste of Mithaas Urja. It’s refreshing, delicious, and feels like a much better choice than regular sugary drinks.",
    },
    {
      name: "Suman Karki",
      role: "Bhaktapur",
      quote:
        "My family loves Mithaas Urja! The taste is naturally refreshing, and I especially like that it feels like a healthy everyday drink rather than just another soft drink.",
    },
  ],
  faqs: [
    {
      question: "What is Mithaas Urja?",
      answer:
        "Mithaas Urja is a refreshing, natural fruit-based wellness juice designed to provide a delicious source of everyday energy and refreshment.",
    },
    {
      question: "What makes Mithaas Urja different from regular juices?",
      answer:
        "Mithaas Urja focuses on the goodness of fruits, refreshing flavors, and a wellness-oriented approach, making it a great alternative to ordinary sugary beverages.",
    },
    {
      question: "Is Mithaas Urja suitable for kids and adults?",
      answer:
        "Yes, Mithaas Urja can be enjoyed by both kids and adults. However, ingredients and nutritional suitability may vary by flavor, so check the product label for specific details.",
    },
    {
      question: "Does Mithaas Urja contain artificial ingredients?",
      answer:
        "Mithaas Urja is designed around natural fruit ingredients. The exact ingredients, sweeteners, preservatives, and additives depend on the specific recipe and should be clearly stated on the product label.",
    },
    {
      question: "When is the best time to drink Mithaas Urja?",
      answer:
        "Mithaas Urja can be enjoyed as a refreshing drink during the day, with meals, after activities, or whenever you want a fruity and refreshing beverage.",
    },
  ],
  reels: [] as string[],
  galleryImages: [
    { src: "/products/product-4.png", alt: "Mithaas Urja premium can view one" },
    { src: "/products/product-3.png", alt: "Mithaas Urja premium can view two" },
    { src: "/products/product-2.png", alt: "Mithaas Urja premium can view three" },
    { src: "/products/product-1.png", alt: "Mithaas Urja premium can view four" },
  ],
  footer: {
    about:
      "Mithaas Enterprises creates refreshing wellness-led beverage experiences with a premium, modern D2C mindset.",
    email: process.env.EMAIL_FROM || process.env.BUSINESS_EMAIL || "shahisanjeet2442@gmail.com",
  },
} as const;

export function getDefaultProduct() {
  return siteConfig.products.find((product) => product.id === siteConfig.defaultProductId)
    ?? siteConfig.products[0];
}

export function getProductById(productId?: string | null) {
  if (!productId) {
    return getDefaultProduct();
  }

  return siteConfig.products.find((product) => product.id === productId) ?? getDefaultProduct();
}
