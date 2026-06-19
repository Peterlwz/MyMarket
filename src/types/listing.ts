export type CategoryId =
  | "all"
  | "rent"
  | "digital"
  | "furniture"
  | "appliance"
  | "fashion"
  | "books"
  | "daily"
  | "tickets"
  | "other";

export type Category = {
  accent: string;
  background: string;
  emoji: string;
  id: CategoryId;
  label: string;
};

export type Seller = {
  avatar: string;
  name: string;
  rating: number;
};

export type ListingStatus = "active" | "reserved" | "sold" | "removed";

export type BaseListing = {
  categoryId: CategoryId;
  description: string;
  id: string;
  image: string;
  images?: Array<string>;
  liked: boolean;
  location: string;
  postedAt: string;
  seller: Seller;
  status: ListingStatus;
  title: string;
  type: "product" | "rent";
};

export type ProductListing = BaseListing & {
  condition: "几乎全新" | "轻微使用" | "正常使用";
  originalPrice?: number;
  pickupMethod: "自提" | "可配送";
  price: number;
  type: "product";
};

export type RentListing = BaseListing & {
  availableFrom: string;
  district: string;
  leaseTerm: string;
  monthlyRent: number;
  roomType: string;
  type: "rent";
};

export type Listing = ProductListing | RentListing;
