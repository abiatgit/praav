import { Category } from '@/types';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Sarees', slug: 'sarees' },
  { id: '2', name: 'Lehengas', slug: 'lehengas' },
  { id: '3', name: 'Salwar Kameez', slug: 'salwar-kameez' },
  { id: '4', name: 'Anarkali', slug: 'anarkali' },
  { id: '5', name: 'Kurtas & Kurtis', slug: 'kurtas-kurtis' },
  { id: '6', name: 'Sherwanis', slug: 'sherwanis' },
  { id: '7', name: 'Kidswear', slug: 'kidswear' },
  { id: '8', name: 'Accessories', slug: 'accessories' },
];

export const PRODUCT_CONDITIONS = [
  'New with tags',
  'Like new',
  'Good',
  'Fair',
] as const;
