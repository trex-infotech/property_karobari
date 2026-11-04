// Fields masked from public visitors per listing type. Values are
// stripped server-side before serialization, so they never reach
// the browser — the UI only gets the list of restricted keys.
export const RESTRICTED_FIELDS_BY_TYPE: Record<string, string[]> = {
  sale: ["buildingAge", "floor", "address", "facing"],
  rent: ["buildingAge", "floor", "address", "facing"],
  pg: [
    "buildingAge",
    "floor",
    "address",
    "facing",
    "sharingOption",
    "totalCapacity",
    "pgServices",
  ],
  new_launch: ["amenities", "address", "builderName"],
  preleased: [
    "leaseAmount",
    "rentalYield",
    "deposit",
    "totalLeaseTenure",
    "balanceLeaseTenure",
    "tenantType",
    "address",
  ],
  auction: [
    "inspectionDate",
    "bankName",
    "buildingAge",
    "floor",
    "address",
    "facing",
  ],
};

// Plausible-looking stand-ins rendered blurred so visitors can tell
// information exists without the real value ever reaching the client.
export const RESTRICTED_FIELD_PLACEHOLDERS: Record<string, string> = {
  buildingAge: "8 years",
  floor: "Floor 4 of 12",
  address: "Flat 302, MG Road",
  facing: "North-East",
  amenities: "Lift, Gym, Club House",
  builderName: "Sunrise Developers",
  sharingOption: "2 per Room",
  totalCapacity: "4-10 Guests",
  pgServices: "Wifi, AC Room",
  leaseAmount: "₹85,000 / month",
  rentalYield: "7.5%",
  deposit: "₹5,00,000",
  totalLeaseTenure: "9 years",
  balanceLeaseTenure: "6 years",
  tenantType: "MNC",
  inspectionDate: "12 Dec 2026",
  bankName: "National Bank",
};

export const RESTRICTED_FIELD_LABELS: Record<string, string> = {
  buildingAge: "Building Age",
  floor: "Floor On",
  address: "Address",
  facing: "Facing",
  amenities: "Amenities",
  builderName: "Builder / Developer",
  sharingOption: "Sharing Option",
  totalCapacity: "Total Capacity",
  pgServices: "PG Services",
  leaseAmount: "Lease Amount",
  rentalYield: "Rental Yield YLY",
  deposit: "Deposit",
  totalLeaseTenure: "Total Lease Tenure",
  balanceLeaseTenure: "Balance Lease Tenure",
  tenantType: "Tenant Type",
  inspectionDate: "Inspection Date",
  bankName: "Name of Bank",
};
