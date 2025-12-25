import { motion } from "framer-motion";
import { ShoppingBag, Star, ExternalLink, Package } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";

const NUTRIO_PRODUCTS = [
  {
    id: "protein-pancake-mix",
    name: "Nutrio Protein Pancake Mix",
    description: "High protein pancake mix - just add water",
    category: "Breakfast",
    calories: 280,
    protein: 25,
    price: 12.99,
    rating: 4.8,
    reviews: 234,
    image: "🥞",
    purchaseUrl: "#",
  },
  {
    id: "breakfast-smoothie",
    name: "Nutrio Breakfast Smoothie",
    description: "Ready-blend protein smoothie powder",
    category: "Breakfast",
    calories: 220,
    protein: 22,
    price: 24.99,
    rating: 4.7,
    reviews: 189,
    image: "🥤",
    purchaseUrl: "#",
  },
  {
    id: "overnight-oats",
    name: "Nutrio Overnight Oats Cup",
    description: "Protein-enriched overnight oats - ready to eat",
    category: "Breakfast",
    calories: 310,
    protein: 20,
    price: 3.49,
    rating: 4.6,
    reviews: 156,
    image: "🥣",
    purchaseUrl: "#",
  },
  {
    id: "protein-bar",
    name: "Nutrio Protein Bar",
    description: "Chocolate & peanut butter protein bar",
    category: "Snacks",
    calories: 180,
    protein: 15,
    price: 2.49,
    rating: 4.9,
    reviews: 512,
    image: "🍫",
    purchaseUrl: "#",
  },
  {
    id: "nut-mix",
    name: "Nutrio Nut Mix",
    description: "High protein nut and seed blend",
    category: "Snacks",
    calories: 160,
    protein: 8,
    price: 4.99,
    rating: 4.5,
    reviews: 98,
    image: "🥜",
    purchaseUrl: "#",
  },
  {
    id: "shake-sachet",
    name: "Nutrio Shake Sachet",
    description: "On-the-go protein shake - just add water",
    category: "Snacks",
    calories: 150,
    protein: 20,
    price: 1.99,
    rating: 4.7,
    reviews: 267,
    image: "🥤",
    purchaseUrl: "#",
  },
];

const Shop = () => {
  const breakfastProducts = NUTRIO_PRODUCTS.filter(p => p.category === "Breakfast");
  const snackProducts = NUTRIO_PRODUCTS.filter(p => p.category === "Snacks");

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-nutrio-amber/20 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-nutrio-amber" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Shop Nutrio</h1>
              <p className="text-muted-foreground text-sm">Premium nutrition products</p>
            </div>
          </div>
        </motion.div>

        {/* Breakfast Products */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <span>🌅</span> Breakfast Range
          </h2>
          <div className="space-y-3">
            {breakfastProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </motion.section>

        {/* Snack Products */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <span>🍎</span> Snacks Range
          </h2>
          <div className="space-y-3">
            {snackProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </motion.section>
      </div>

      <BottomNav />
    </div>
  );
};

const ProductCard = ({ product }: { product: typeof NUTRIO_PRODUCTS[0] }) => {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-xl bg-nutrio-amber/10 flex items-center justify-center text-3xl flex-shrink-0">
          {product.image}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground text-sm">{product.name}</h3>
            <span className="font-bold text-primary">£{product.price.toFixed(2)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{product.description}</p>
          
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-nutrio-amber text-nutrio-amber" />
              <span className="text-xs font-medium">{product.rating}</span>
              <span className="text-xs text-muted-foreground">({product.reviews})</span>
            </div>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{product.calories} kcal</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-nutrio-blue font-medium">{product.protein}g protein</span>
          </div>

          <div className="flex gap-2 mt-3">
            <Button size="sm" className="flex-1 h-8 text-xs">
              Buy Now
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
