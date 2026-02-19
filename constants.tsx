
import { Product, Category, Gender, Coupon } from './types';

export const CATEGORIES: Category[] = ['Puff Print', 'DTF', 'Screen Print', 'Hybrid', 'Oversized', 'Hoodie', 'Shirt', 'T-shirt'];
export const GENDERS: Gender[] = ['Men', 'Women', 'Unisex', 'Couple'];

export const DUMMY_HERO_IMAGES = [];

export const DUMMY_CATEGORIES_DATA = [];

export const DUMMY_TAGS = [];

export const DUMMY_REVIEWS = [];

export const DUMMY_PRODUCTS: Product[] = [
  {
    id: 'dummy_error_1',
    sku: 'DUMMY-ERR',
    name: 'dummy product',
    category: ['Uncategorized'],
    actualPrice: 0,
    offerPrice: 0,
    images: [],
    description: 'Server connection failed. This is a diagnostic placeholder.',
    gender: 'Unisex',
    sizes: { 'Free Size': 1 },
    quality: 'N/A',
    country_of_origin: 'N/A',
    manufacture_date: 'N/A',
    pickup_point: 'N/A',
    return_policy: 'N/A',
    cancel_policy: 'N/A',
    tags: [],
    isBestSelling: true,
    discountPercentage: 0
  }
];

export const DUMMY_COUPONS: Coupon[] = [
  { code: 'SOUL10', type: 'percentage', value: 10, minBilling: 999, maxDiscount: 200, isVisible: true },
  { code: 'FIRST50', type: 'flat', value: 50, minBilling: 499, isVisible: true },
  { code: 'BIGSAVER', type: 'percentage', value: 15, minBilling: 1499, maxDiscount: 500, isVisible: true }
];
