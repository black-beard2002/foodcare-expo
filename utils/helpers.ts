import { MEDIA_URL } from '@/constants/api_constants';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

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
function convertUTCToLocal(utcDateString: string): Date {
  // Ensure the string is treated as UTC
  const normalized = utcDateString.endsWith('Z')
    ? utcDateString
    : `${utcDateString}Z`;

  // Parse as UTC and convert to local Date object
  return new Date(normalized);
}
export function formatDateTime(utcDateTime: string | null | undefined): string {
  if (!utcDateTime) return 'Not set';

  const localDate = convertUTCToLocal(utcDateTime);

  return localDate.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// ✅ WORKS IN REACT NATIVE
export const formatDateRange = (dateStrings: string[]) => {
  if (!dateStrings || dateStrings.length === 0) return '';

  // Convert UTC strings to local Date objects
  const dates = dateStrings
    .map((d) => new Date(d.endsWith('Z') ? d : `${d}Z`))
    .sort((a, b) => a.getTime() - b.getTime());

  const start = dates[0];
  const end = dates[dates.length - 1];

  // Check if same day
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
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
export const formatCountdown = (ms: number) => {
  if (ms <= 0) return 'Expired';

  const totalMinutes = Math.floor(ms / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  let result = '';
  if (days > 0) result += `${days}day`;
  if (hours > 0) result += `${hours}hrs`;
  if (minutes > 0 || result === '') result += `${minutes}min`;

  return result;
};

export const getCountdownColor = (remainingMs: number, theme: any) => {
  const minutes = remainingMs / (1000 * 60);

  if (minutes <= 0) return theme.error;
  if (minutes <= 30) return theme.error; // 🔴 red
  if (minutes <= 120) return theme.warning; // 🟡 orange
  return theme.success; // 🟢 green
};
