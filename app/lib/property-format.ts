export const LISTING_LABELS: Record<string, string> = {
  sale: "Buy",
  rent: "Rent",
  pg: "PG",
  new_launch: "New Launch",
  preleased: "Preleased",
  auction: "Auction",
};

export function listingLabel(listingType: string) {
  return LISTING_LABELS[listingType] ?? listingType;
}

export function listingTypeToPath(listingType: string) {
  switch (listingType) {
    case "sale":
      return "buy";
    case "new_launch":
      return "new-launch";
    default:
      return listingType;
  }
}

export const PROPERTY_PAGES: Record<
  string,
  { listingType: string; label: string; heading: string; tagline: string }
> = {
  buy: {
    listingType: "sale",
    label: "Buy",
    heading: "Properties for Sale",
    tagline: "Explore verified properties ready for you to own.",
  },
  rent: {
    listingType: "rent",
    label: "Rent",
    heading: "Properties for Rent",
    tagline: "Find a rental that feels like home.",
  },
  pg: {
    listingType: "pg",
    label: "PG",
    heading: "PG Accommodations",
    tagline: "Comfortable shared living with all the essentials.",
  },
  "new-launch": {
    listingType: "new_launch",
    label: "New Launch",
    heading: "New Launch Projects",
    tagline: "Discover the latest projects open for early booking.",
  },
  preleased: {
    listingType: "preleased",
    label: "Preleased",
    heading: "Preleased Properties",
    tagline: "Pre-leased assets offering steady rental income from day one.",
  },
  auction: {
    listingType: "auction",
    label: "Auction",
    heading: "Auction Properties",
    tagline: "Bid on bank and institution auctioned properties.",
  },
};

export function formatPrice(price: number | null) {
  if (price === null) return null;
  if (price >= 1_00_00_000) {
    return `₹${Number((price / 1_00_00_000).toFixed(2))} Cr`;
  }
  if (price >= 1_00_000) {
    return `₹${Number((price / 1_00_000).toFixed(2))} L`;
  }
  return `₹${price.toLocaleString("en-IN")}`;
}
