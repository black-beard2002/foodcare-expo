import { MEDIA_URL } from '@/constants/api_constants';

export const getDiscountPercentage = (
  originalPrice: number,
  discountedPrice: number
): number => {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};
export const formatPrice = (price: number): string => {
  return price.toFixed(2);
};

export const handleImageSrc = (img: string) => {
  if (img?.includes('storage/images')) {
    return MEDIA_URL?.concat(img);
  } else {
    return img;
  }
};
