// Prizes.js
const prizes = [
  {
    id: "echo-dot",
    name: "Echo Dot (5th Gen)",
    description: "Smart speaker with Alexa",
    points: 5000,
    imageUrl: "", // Add Amazon product image URL
    amazonLink: "", // Add Amazon product link
    category: "Electronics",
    inStock: true,
    featured: true,
  },
  {
    id: "kindle",
    name: "Kindle Paperwhite",
    description: "6.8\" display, waterproof e-reader",
    points: 12000,
    imageUrl: "", // Add Amazon product image URL
    amazonLink: "", // Add Amazon product link
    category: "Electronics",
    inStock: true,
    featured: false,
  },
  {
    id: "gift-card-25",
    name: "Amazon Gift Card",
    description: "$25 Amazon Gift Card - Digital",
    points: 2500,
    imageUrl: "", // Add Amazon product image URL
    amazonLink: "", // Add Amazon product link
    category: "Gift Cards",
    inStock: true,
    featured: true,
  },
  {
    id: "wireless-earbuds",
    name: "Wireless Earbuds",
    description: "Bluetooth 5.0 Wireless Earbuds with Charging Case",
    points: 3500,
    imageUrl: "", // Add Amazon product image URL
    amazonLink: "", // Add Amazon product link
    category: "Electronics",
    inStock: true,
    featured: false,
  },
  {
    id: "smart-watch",
    name: "Fitness Smart Watch",
    description: "Activity Tracker with Heart Rate Monitor",
    points: 4500,
    imageUrl: "", // Add Amazon product image URL
    amazonLink: "", // Add Amazon product link
    category: "Electronics",
    inStock: true,
    featured: false,
  }
];

// Categories for filtering
const categories = [
  "Electronics",
  "Gift Cards",
  "Home & Kitchen",
  "Books",
  "Gaming",
  "Fashion",
  "Beauty & Personal Care"
];

// Helper functions
const getPrizeById = (id) => prizes.find(prize => prize.id === id);
const getPrizesByCategory = (category) => prizes.filter(prize => prize.category === category);
const getFeaturedPrizes = () => prizes.filter(prize => prize.featured);
const getInStockPrizes = () => prizes.filter(prize => prize.inStock);

export {
  prizes,
  categories,
  getPrizeById,
  getPrizesByCategory,
  getFeaturedPrizes,
  getInStockPrizes
};