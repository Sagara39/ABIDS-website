export type ImagePlaceholder = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// Inlined placeholder images to avoid Turbopack HMR issues with importing
// the raw JSON file directly during development. Keeping data in TypeScript
// removes module-matching errors and improves HMR reliability.
export const PlaceHolderImages: ImagePlaceholder[] = [
  {
    id: '1',
    name: 'Cream bun',
    description: 'A soft bun filled with delicious cream.',
    imageUrl: '/cream-bun.jpg',
    imageHint: 'cream bun',
  },
  {
    id: '2',
    name: 'Fish bun',
    description: 'A savory bun with a fish filling.',
    imageUrl: '/fish-bun.jpg',
    imageHint: 'fish bun',
  },
  {
    id: '3',
    name: 'Viana bun',
    description: 'A delicious and popular Viana sausage bun.',
    imageUrl: '/viana-bun.jpg',
    imageHint: 'sausage bun',
  },
  {
    id: '4',
    name: 'Tea bun',
    description: 'A slightly sweet bun, perfect with tea.',
    imageUrl: '/tea-bun.jpeg',
    imageHint: 'tea bun',
  },
  {
    id: '5',
    name: 'Elawalu rotti',
    description: 'A vegetable-filled flatbread, a local favorite.',
    imageUrl: '/elawalu-rotti.jpg',
    imageHint: 'vegetable rotti',
  },
  {
    id: '6',
    name: 'Sausage bun',
    description: 'A classic sausage bun.',
    imageUrl: '/sausage-bun.png',
    imageHint: 'sausage bun',
  },
  {
    id: '7',
    name: 'Original Cream Bun',
    description: 'A soft bun filled with delicious cream.',
    imageUrl: '/cream-bun.jpg',
    imageHint: 'cream bun',
  },
];
