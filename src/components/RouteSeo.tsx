import { useLocation } from "react-router-dom";
import { Seo } from "./Seo";
import { VELLYN_PRODUCTS } from "@/data/vellynProducts";

const SITE_URL = "https://heyvellyn.com";
const SITE_TITLE = "Vellyn | AI Nutrition Coach That Learns Your Habits";
const SITE_DESCRIPTION =
  "Vellyn learns how you really eat, then gives practical AI nutrition guidance, meal logging and small changes that fit your life.";

const shopJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Vellyn nutrition products",
  itemListElement: VELLYN_PRODUCTS.map((product, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Product",
      name: product.name,
      description: product.description,
      category: product.category,
      brand: { "@type": "Brand", name: "Vellyn" },
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
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  "/diet": {
    title: `Diet | ${SITE_TITLE}`,
    description: SITE_DESCRIPTION,
  },
  "/workout": {
    title: `Workouts | ${SITE_TITLE}`,
    description: SITE_DESCRIPTION,
  },
  "/shop": {
    title: `Shop | ${SITE_TITLE}`,
    description: SITE_DESCRIPTION,
    jsonLd: shopJsonLd,
  },
  "/ask-ai": {
    title: `Ask Vellyn | ${SITE_TITLE}`,
    description: SITE_DESCRIPTION,
  },
  "/log": {
    title: `Food Log | ${SITE_TITLE}`,
    description: SITE_DESCRIPTION,
  },
  "/auth": {
    title: `Sign In | ${SITE_TITLE}`,
    description: SITE_DESCRIPTION,
  },
  "/strict-mode": {
    title: `Strict Mode | ${SITE_TITLE}`,
    description: SITE_DESCRIPTION,
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
