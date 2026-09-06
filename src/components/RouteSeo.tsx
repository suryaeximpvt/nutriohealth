import { useLocation } from "react-router-dom";
import { Seo } from "./Seo";
import { NUTRIO_PRODUCTS } from "@/data/nutrioProducts";

const SITE_URL = "https://nutriohealth.lovable.app";

const shopJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Nutrio nutrition products",
  itemListElement: NUTRIO_PRODUCTS.map((product, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Product",
      name: product.name,
      description: product.description,
      category: product.category,
      brand: { "@type": "Brand", name: "Nutrio" },
      offers: {
        "@type": "Offer",
        price: product.price.toFixed(2),
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/shop`,
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviews,
      },
    },
  })),
};

const META: Record<
  string,
  { title: string; description: string; jsonLd?: Record<string, unknown> }
> = {
  "/": {
    title: "Nutrio — AI Nutrition and Fitness Tracking",
    description:
      "Track calories, macros, water and workouts with Nutrio's AI coach, built for British eating habits.",
  },
  "/diet": {
    title: "Nutrio AI Meal Ideas — Daily Diet Suggestions",
    description:
      "Get AI-curated breakfast, lunch, snack and dinner ideas matched to your goal, budget and cuisine preferences.",
  },
  "/workout": {
    title: "Workouts — Strength, Core, Endurance and Yoga | Nutrio",
    description:
      "Follow guided strength, core, endurance and yoga sessions with AI picks that suit your goal and energy levels.",
  },
  "/shop": {
    title: "Shop Nutrio Nutrition Products — Protein and Breakfast Range",
    description:
      "Browse Nutrio protein bars, shakes, oats and breakfast mixes with calories, protein and UK pricing.",
    jsonLd: shopJsonLd,
  },
  "/ask-ai": {
    title: "Ask the Nutrio AI Coach — Personalised Nutrition Advice",
    description:
      "Ask Nutrio's AI coach about meals, macros, cravings and training, answered using your own daily data.",
  },
  "/log": {
    title: "Food Log — Track Meals and Calories | Nutrio",
    description:
      "Log meals manually or by photo, review your daily intake and adjust your macros in seconds.",
  },
  "/auth": {
    title: "Sign In to Nutrio — AI Nutrition and Fitness Tracking",
    description:
      "Log in or create your Nutrio account to start AI-guided nutrition, hydration and workout tracking.",
  },
  "/strict-mode": {
    title: "Strict Weight Loss Mode | Nutrio",
    description:
      "Opt into Nutrio's accountability mode with photo proof, strike rules and honest AI coaching.",
  },
};

export const RouteSeo = () => {
  const { pathname } = useLocation();
  const meta = META[pathname];
  if (!meta) return null;
  return (
    <Seo
      title={meta.title}
      description={meta.description}
      path={pathname}
      jsonLd={meta.jsonLd}
    />
  );
};
