export const PRODUCT_HIERARCHY = [
  {
    id: 'jac-t9',
    name: 'JAC T9',
    brand: 'JAC',
    tagline: 'Flagship Turbo Diesel Double Cabin Pickups',
    description: 'Executive double cabin 4x4 pickups engineered for all-terrain capability and premium comfort.',
    subcategories: [
      { id: 'hunter', name: 'Hunter', slug: 't9-hunter' },
      { id: 'frison', name: 'Frison', slug: 't9-frison' },
    ],
  },
  {
    id: 'jac-commercial',
    name: 'JAC Commercial',
    brand: 'JAC',
    tagline: 'Dependable Cargo Deck & Freight Transport Trucks',
    description: 'Comprehensive commercial transport lineup ranging from nimble 1.15-ton deck trucks to heavy 20-foot haulers.',
    subcategories: [
      { id: 'x200', name: 'X200', slug: 'jac-x200' },
      { id: '1020', name: '1020', slug: 'jac-1020' },
      { id: '1042', name: '1042', slug: 'jac-1042' },
      { id: '1091', name: '1091', slug: 'jac-1091' },
      { id: '1120', name: '1120', slug: 'jac-1120' },
    ],
  },
  {
    id: 'dongfeng',
    name: 'Dongfeng',
    brand: 'Dongfeng',
    tagline: 'Heavy Logistics & Light Commercial Haulers',
    description: 'High-tonnage prime movers, rigid multi-axle trucks, and agile light logistics vehicles.',
    subcategories: [
      {
        id: 'heavy',
        name: 'Heavy',
        description: 'Prime Movers & Heavy-Duty Rigid Trucks for demanding long-haul and industrial freight.',
        subSubcategories: [
          { id: 'prime-movers', name: 'Prime Movers', slug: 'dongfeng-prime-mover' },
          { id: 'rigid', name: 'Rigid', slug: 'dongfeng-rigid' },
        ],
      },
      {
        id: 'light',
        name: 'Light',
        description: 'Urban and regional light commercial trucks for distribution and supply chains.',
        slug: 'dongfeng-light',
      },
    ],
  },
];

// Products catalog is loaded directly from the database API.
// No static demo vehicles are stored here.
export const PRODUCTS = [];

// Aliases for compatibility
export const VEHICLES = PRODUCTS;
export const VEHICLES_DATA = PRODUCTS;
export default PRODUCTS;
