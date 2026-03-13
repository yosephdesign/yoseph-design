export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  featured?: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Iconic Lounge Chair",
    description: "A timeless architectural masterpiece combining premium leather and molded plywood.",
    price: 4500,
    category: "Seating",
    image: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/f579f73a-3c76-43af-9367-4cbdb65814c1/designer-chair-787ad4f8-1773311416522.webp",
    featured: true
  },
  {
    id: "2",
    name: "Bauhaus Desk Lamp",
    description: "Minimalist geometric desk lamp with chrome finish, inspired by the Bauhaus school.",
    price: 320,
    category: "Lighting",
    image: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/f579f73a-3c76-43af-9367-4cbdb65814c1/bauhaus-lamp-1a3865cb-1773311415753.webp"
  },
  {
    id: "3",
    name: "Brutalist Concrete Table",
    description: "Solid concrete coffee table with clean, bold edges for a modern architectural statement.",
    price: 1200,
    category: "Tables",
    image: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/f579f73a-3c76-43af-9367-4cbdb65814c1/concrete-table-product-9b155b2f-1773311416427.webp",
    featured: true
  },
  {
    id: "4",
    name: "Modular Oak Bookshelf",
    description: "Customizable shelving unit made from premium oak, designed for minimalist interiors.",
    price: 2100,
    category: "Storage",
    image: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/f579f73a-3c76-43af-9367-4cbdb65814c1/modular-bookshelf-a2836606-1773311415557.webp"
  },
  {
    id: "5",
    name: "Deep Green Velvet Sofa",
    description: "Luxurious architectural sofa with clean lines and deep green velvet upholstery.",
    price: 3800,
    category: "Seating",
    image: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/f579f73a-3c76-43af-9367-4cbdb65814c1/modern-sofa-product-486d0e4b-1773311416830.webp"
  },
  {
    id: "6",
    name: "Wireframe Stools (Set of 2)",
    description: "Lightweight yet strong architectural stools with a matte black wireframe design.",
    price: 580,
    category: "Seating",
    image: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/f579f73a-3c76-43af-9367-4cbdb65814c1/architectural-stools-21cd874c-1773311415213.webp"
  },
  {
    id: "7",
    name: "Geometric Vase Collection",
    description: "A set of three ceramic vases featuring unique architectural shapes and neutral tones.",
    price: 240,
    category: "Decor",
    image: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/f579f73a-3c76-43af-9367-4cbdb65814c1/ceramic-vases-9752db5d-1773311416973.webp"
  }
];