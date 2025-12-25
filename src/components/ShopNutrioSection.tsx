import { motion } from "framer-motion";
import { ShoppingBag, ExternalLink, Star, Package } from "lucide-react";
import { AISuggestion } from "@/hooks/useDailyAISuggestions";

interface NutrioProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  rating: number;
  reviews: number;
  image: string;
  category: "breakfast" | "snack";
  purchaseUrl: string;
}

const NUTRIO_PRODUCTS: NutrioProduct[] = [
  {
    id: "protein-pancake-mix",
    name: "Nutrio Protein Pancake Mix",
    description: "High protein pancake mix - 25g protein per serving",
    price: "£12.99",
    rating: 4.8,
    reviews: 342,
    image: "🥞",
    category: "breakfast",
    purchaseUrl: "https://shop.nutrio.co.uk/protein-pancake-mix",
  },
  {
    id: "breakfast-smoothie",
    name: "Nutrio Breakfast Smoothie",
    description: "Ready-blend protein smoothie powder - 22g protein",
    price: "£18.99",
    rating: 4.7,
    reviews: 256,
    image: "🥤",
    category: "breakfast",
    purchaseUrl: "https://shop.nutrio.co.uk/breakfast-smoothie",
  },
  {
    id: "overnight-oats-cup",
    name: "Nutrio Overnight Oats Cup",
    description: "Protein-enriched overnight oats - 20g protein",
    price: "£3.49",
    rating: 4.6,
    reviews: 189,
    image: "🥣",
    category: "breakfast",
    purchaseUrl: "https://shop.nutrio.co.uk/overnight-oats",
  },
  {
    id: "protein-bar",
    name: "Nutrio Protein Bar",
    description: "Chocolate & peanut protein bar - 15g protein",
    price: "£2.49",
    rating: 4.9,
    reviews: 567,
    image: "🍫",
    category: "snack",
    purchaseUrl: "https://shop.nutrio.co.uk/protein-bar",
  },
  {
    id: "nut-mix",
    name: "Nutrio Nut Mix",
    description: "High protein nut & seed blend - 8g protein",
    price: "£4.99",
    rating: 4.5,
    reviews: 123,
    image: "🥜",
    category: "snack",
    purchaseUrl: "https://shop.nutrio.co.uk/nut-mix",
  },
  {
    id: "shake-sachet",
    name: "Nutrio Shake Sachet",
    description: "On-the-go protein shake - 20g protein",
    price: "£1.99",
    rating: 4.7,
    reviews: 234,
    image: "🧉",
    category: "snack",
    purchaseUrl: "https://shop.nutrio.co.uk/shake-sachet",
  },
];

interface ShopNutrioSectionProps {
  suggestions: {
    breakfast: AISuggestion | null;
    lunch: AISuggestion | null;
    snacks: AISuggestion | null;
    dinner: AISuggestion | null;
  };
}

export const ShopNutrioSection = ({ suggestions }: ShopNutrioSectionProps) => {
  // Get recommended products based on what's in the suggestions
  const getRecommendedProducts = (): NutrioProduct[] => {
    const recommendedProductNames = new Set<string>();
    
    // Check breakfast suggestion
    if (suggestions.breakfast?.nutrioProduct) {
      recommendedProductNames.add(suggestions.breakfast.nutrioProduct);
    }
    
    // Check snacks suggestion
    if (suggestions.snacks?.nutrioProduct) {
      recommendedProductNames.add(suggestions.snacks.nutrioProduct);
    }

    // Get products that match the recommendations
    const recommended = NUTRIO_PRODUCTS.filter(product => 
      recommendedProductNames.has(product.name)
    );

    // If we have less than 3 recommended, add top-rated products
    if (recommended.length < 3) {
      const remaining = NUTRIO_PRODUCTS
        .filter(p => !recommendedProductNames.has(p.name))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3 - recommended.length);
      return [...recommended, ...remaining];
    }

    return recommended;
  };

  const productsToShow = getRecommendedProducts();

  const handleShopClick = (product: NutrioProduct) => {
    // In production, this would open the actual shop URL
    // For now, show a toast or open in new tab
    window.open(product.purchaseUrl, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-card rounded-2xl shadow-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-primary/10 to-nutrio-amber/10 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Shop Nutrio</h3>
              <p className="text-xs text-muted-foreground">Products in your meal plan</p>
            </div>
          </div>
          <a 
            href="https://shop.nutrio.co.uk" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
          >
            View all
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-4">
        <div className="space-y-3">
          {productsToShow.map((product, index) => {
            const isRecommended = 
              suggestions.breakfast?.nutrioProduct === product.name ||
              suggestions.snacks?.nutrioProduct === product.name;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + index * 0.05 }}
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl shrink-0">
                  {product.image}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground text-sm truncate">
                      {product.name}
                    </h4>
                    {isRecommended && (
                      <span className="px-1.5 py-0.5 bg-primary/20 rounded text-[10px] font-medium text-primary shrink-0">
                        In Plan
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-nutrio-amber text-nutrio-amber" />
                      <span className="text-xs font-medium text-foreground">{product.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">({product.reviews})</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-semibold text-foreground text-sm">{product.price}</p>
                  <button
                    onClick={() => handleShopClick(product)}
                    className="mt-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-1"
                  >
                    <Package className="w-3 h-3" />
                    Buy
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Shop CTA */}
        <a
          href="https://shop.nutrio.co.uk"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <ShoppingBag className="w-4 h-4" />
          Visit Nutrio Shop
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </motion.div>
  );
};
