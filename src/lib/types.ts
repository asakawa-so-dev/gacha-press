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
  gender: string | null;
  age_group: string | null;
};

export type ProductDemographics = {
  total_spins: number;
  total_interests: number;
  gender_breakdown: { gender: string; count: number }[];
  age_breakdown: { age_group: string; count: number }[];
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

export type RelatedProduct = {
  product_id: number;
  name: string;
  image_url: string;
  price: number;
  overlap_count: number;
};

export type ProductTrendDay = {
  day: string;
  purchase_count: number;
  interest_count: number;
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
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          onboarding_done?: boolean;
          gender?: string | null;
          age_group?: string | null;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          onboarding_done?: boolean;
          gender?: string | null;
          age_group?: string | null;
        };
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
    Functions: {
      get_product_demographics: {
        Args: { p_product_id: number };
        Returns: ProductDemographics;
      };
    };
    Enums: Record<string, never>;
  };
};
