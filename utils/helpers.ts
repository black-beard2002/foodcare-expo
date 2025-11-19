import { MEDIA_URL } from '@/constants/api_constants';

export const getDiscountPercentage = (
  originalPrice: number,
  discountedPrice: number
): number => {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};
export const formatPrice = (price: number): string => {
  return price?.toFixed(2);
};

export const handleImageSrc = (img: string) => {
  if (img?.includes('storage/images')) {
    return MEDIA_URL?.concat(img);
  } else {
    return img;
  }
};
export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
export const formatDateRange = (dateStrings: string[]) => {
  if (!dateStrings || dateStrings.length === 0) return '';

  // Convert to Date objects and sort chronologically
  const dates = dateStrings
    .map((d) => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime());

  const start = dates[0];
  const end = dates[dates.length - 1];

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  const formatDate = (date: Date) =>
    date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const formatTime = (date: Date) =>
    date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });

  if (sameDay) {
    return `${formatDate(start)} from ${formatTime(start)} to ${formatTime(
      end
    )}`;
  }

  return `From ${formatDate(start)} ${formatTime(start)} to ${formatDate(
    end
  )} ${formatTime(end)}`;
};
