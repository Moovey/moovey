/**
 * Shared constants for business services across the application
 * These services should match between business registration and customer search
 */

export const PREDEFINED_SERVICES = [
  'House Removals',
  'Packing Service',
  'Storage',
  'Man and Van',
  'Office Moves',
  'Long-distance Moves',
  'Furniture Assembly',
  'Cleaning',
  'Fragile-only Packing',
  'Piano Moves',
] as const;

export const POPULAR_SERVICES = [
  'House Removals',
  'Packing Service', 
  'Man and Van',
  'Cleaning',
  'Storage'
] as const;

export type PredefinedService = typeof PREDEFINED_SERVICES[number];
export type PopularService = typeof POPULAR_SERVICES[number];