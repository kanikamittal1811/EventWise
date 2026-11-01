export function formatCurrency(amount: number, currency = 'INR'): string {
  const safeAmount = Number(amount) || 0;

  try {
    if (currency === 'INR') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(safeAmount);
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(safeAmount);
  } catch {
    return `${currency} ${safeAmount.toLocaleString()}`;
  }
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'Date not set';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function getDaysUntil(dateString?: string): { days: number; isPast: boolean; label: string } {
  if (!dateString) return { days: 0, isPast: false, label: 'No date' };
  try {
    const target = new Date(dateString);
    const now = new Date();
    // Normalize to midnight
    target.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diffMs = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { days: 0, isPast: false, label: 'Today!' };
    } else if (diffDays === 1) {
      return { days: 1, isPast: false, label: 'Tomorrow' };
    } else if (diffDays > 1) {
      return { days: diffDays, isPast: false, label: `${diffDays} days to go` };
    } else {
      return { days: Math.abs(diffDays), isPast: true, label: `${Math.abs(diffDays)} days ago` };
    }
  } catch {
    return { days: 0, isPast: false, label: '' };
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

