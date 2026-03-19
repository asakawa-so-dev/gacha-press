export type Product = {
  id: number;
  name: string;
  price: number;
  release_month: string;
  genre: string;
  maker: string;
  lineup: number;
  description: string;
  is_new: boolean;
  image_url: string;
  created_at: string;
};

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  onboarding_done: boolean;
};

export type UserInterest = {
  user_id: string;
  product_id: number;
  created_at: string;
};

export type UserPurchase = {
  user_id: string;
  product_id: number;
  created_at: string;
};

export type ProductStats = {
  product_id: number;
  interest_count: number;
  purchased_count: number;
};

export type Article = {
  id: string;
  title: string;
  tag: string;
  lede: string;
  cover_product_id: number | null;
  blocks: ArticleBlock[];
  created_at: string;
};

export type ArticleBlock =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "product"; productId: number };

export type Database = {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, "created_at">;
        Update: Partial<Omit<Product, "id">>;
      };
      profiles: {
        Row: Profile;
        Insert: Profile;
        Update: Partial<Omit<Profile, "id">>;
      };
      user_interests: {
        Row: UserInterest;
        Insert: Omit<UserInterest, "created_at">;
        Update: never;
      };
      user_purchases: {
        Row: UserPurchase;
        Insert: Omit<UserPurchase, "created_at">;
        Update: never;
      };
      product_stats: {
        Row: ProductStats;
        Insert: ProductStats;
        Update: Partial<ProductStats>;
      };
      articles: {
        Row: Article;
        Insert: Omit<Article, "created_at">;
        Update: Partial<Omit<Article, "id">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
