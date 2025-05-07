import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(dateString: string): string {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
}

export function formatDate(dateString: string, formatStr: string = 'PPP'): string {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, formatStr);
  } catch (error) {
    return 'Invalid date';
  }
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function generateProjectId(country: string, year: string): string {
  const randomId = Math.floor(1000 + Math.random() * 9000);
  return `${country.toUpperCase()}-${year}-${randomId.toString().padStart(4, '0')}`;
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'verified':
      return 'bg-green-100 text-green-800';
    case 'registered':
      return 'bg-blue-100 text-blue-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'available':
      return 'bg-green-100 text-green-800';
    case 'retired':
      return 'bg-gray-100 text-gray-800';
    case 'transferred':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getCategoryColor(category: string): string {
  switch (category.toLowerCase()) {
    case 'forestry':
      return 'bg-green-100 text-green-800';
    case 'renewable energy':
      return 'bg-blue-100 text-blue-800';
    case 'agriculture':
      return 'bg-yellow-100 text-yellow-800';
    case 'waste management':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getVerificationStageColor(stage: string): string {
  switch (stage.toLowerCase()) {
    case 'data validation':
      return 'bg-yellow-100 text-yellow-800';
    case 'field audit':
      return 'bg-blue-100 text-blue-800';
    case 'final review':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getActivityIcon(action: string): { icon: string; color: string } {
  switch (action) {
    case 'project_created':
    case 'project_registered':
      return { icon: 'add_circle', color: 'bg-primary-light text-primary' };
    case 'project_verified':
      return { icon: 'verified', color: 'bg-success bg-opacity-20 text-success' };
    case 'credit_issued':
      return { icon: 'account_balance_wallet', color: 'bg-secondary-light text-secondary' };
    case 'verification_requested':
      return { icon: 'assignment', color: 'bg-warning bg-opacity-20 text-warning' };
    case 'project_updated':
      return { icon: 'edit', color: 'bg-blue-100 text-blue-600' };
    case 'credit_retired':
      return { icon: 'delete', color: 'bg-gray-100 text-gray-600' };
    default:
      return { icon: 'notifications', color: 'bg-gray-100 text-gray-600' };
  }
}

export function getProjectCategoryIcon(category: string): string {
  switch (category.toLowerCase()) {
    case 'forestry':
      return 'eco';
    case 'renewable energy':
      return 'wb_sunny';
    case 'agriculture':
      return 'grass';
    case 'waste management':
      return 'delete';
    default:
      return 'category';
  }
}
