export const UK_WOMENS_SIZES = [
  'UK 4',
  'UK 6',
  'UK 8',
  'UK 10',
  'UK 12',
  'UK 14',
  'UK 16',
  'UK 18',
  'UK 20',
  'UK 22',
  'UK 24+',
] as const;

export const UK_MENS_SIZES = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  'XXXL',
] as const;

export const SPECIAL_SIZES = [
  'Free Size',
  'One Size',
  'Custom',
] as const;

export const ALL_SIZES = [
  ...UK_WOMENS_SIZES,
  ...UK_MENS_SIZES,
  ...SPECIAL_SIZES,
];

export const ONBOARDING_STEPS = [
  {
    step: 1,
    title: 'Tell us about yourself',
    description: 'Basic information and profile photo',
  },
  {
    step: 2,
    title: 'Where are you based?',
    description: 'Your location (address stays private)',
  },
  {
    step: 3,
    title: 'What do you usually sell?',
    description: 'Categories and sizes you offer',
  },
  {
    step: 4,
    title: 'Almost there',
    description: 'Final preferences and review',
  },
] as const;

export const USERNAME_REGEX = /^[a-z0-9_-]+$/;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const BIO_MAX_LENGTH = 160;
export const SELLER_INTRO_MAX_LENGTH = 500;

export const COMMUNICATION_OPTIONS = [
  {
    value: 'platform_only',
    label: 'Platform messages only',
    description: 'Buyers contact you through praav.uk messages (recommended)',
  },
] as const;

export const PROFILE_VISIBILITY_OPTIONS = [
  {
    value: 'public' as const,
    label: 'Public',
    description: 'Buyers can view your profile and listings',
  },
  {
    value: 'private' as const,
    label: 'Private',
    description: 'Your profile and listings are hidden',
  },
] as const;
