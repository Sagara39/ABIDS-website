import type { MenuItem } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => {
  const img = PlaceHolderImages.find(img => img.id === id);
  if (!img) {
    return {
      imageUrl: 'https://placehold.co/600x400',
      imageHint: 'placeholder',
    };
  }
  return {
    imageUrl: img.imageUrl,
    imageHint: img.imageHint,
  };
};

export const placeholderMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Croissant',
    description: 'A freshly baked, flaky croissant.',
    price: 2.5,
    ...getImage('public/Cream bun.jpg'),
  },
  {
    id: '2',
    name: 'Coffee',
    description: 'A cup of aromatic black coffee.',
    price: 3.0,
    ...getImage('coffee'),
  },
  {
    id: '3',
    name: 'Club Sandwich',
    description: 'A delicious and healthy club sandwich.',
    price: 8.5,
    ...getImage('sandwich'),
  },
  {
    id: '4',
    name: 'Chocolate Cake',
    description: 'A slice of rich chocolate cake.',
    price: 4.5,
    ...getImage('cake'),
  },
  {
    id: '5',
    name: 'Orange Juice',
    description: 'A refreshing glass of orange juice.',
    price: 3.5,
    ...getImage('juice'),
  },
  {
    id: '6',
    name: 'Garden Salad',
    description: 'A healthy and crisp garden salad.',
    price: 6.0,
    ...getImage('salad'),
  },
  {
    id: '7',
    name: 'Cream Bun',
    description: 'A soft bun filled with delicious cream.',
    price: 2.0,
    ...getImage('cream-bun'),
  },
];
