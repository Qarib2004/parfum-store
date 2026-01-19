import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function formatDate(date: string | Date, formatStr: string = 'dd.MM.yyyy HH:mm') {
  return format(new Date(date), formatStr, { locale: ru });
}


export function formatRelativeDate(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ru });
}


export function formatPrice(price: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}


export function formatNumber(num: number) {
  return new Intl.NumberFormat('ru-RU').format(num);
}


export function truncate(str: string, length: number = 100) {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}


export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}


export function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


export function getErrorMessage(error: any): string {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response?.data?.errors?.length > 0) {
    return error.response.data.errors.map((e: any) => e.message).join(', ');
  }
  if (error?.message) {
    return error.message;
  }
  return 'Presented error';
}


export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}


export function hasRole(userRole: string, allowedRoles: string[]) {
  return allowedRoles.includes(userRole);
}


export async function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}


export function generateId(prefix: string = 'id') {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}


export function isFileSizeValid(file: File, maxSizeMB: number = 5) {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}


export function isImageFile(file: File) {
  return file.type.startsWith('image/');
}


export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}