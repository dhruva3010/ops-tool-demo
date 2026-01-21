import { format, formatDistanceToNow } from 'date-fns';

export function formatDate(date, pattern = 'MMM d, yyyy') {
  if (!date) return '-';
  return format(new Date(date), pattern);
}

export function formatDateTime(date) {
  if (!date) return '-';
  return format(new Date(date), 'MMM d, yyyy h:mm a');
}

export function formatRelativeTime(date) {
  if (!date) return '-';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatCurrency(value, currency = 'USD') {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
}

export function formatNumber(value) {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US').format(value);
}

export function truncate(str, length = 50) {
  if (!str) return '';
  if (str.length <= length) return str;
  return `${str.substring(0, length)}...`;
}

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
