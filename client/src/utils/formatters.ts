export function formatCurrency(amount: number | undefined | null, currency: string = 'RWF'): string {
  if (amount === undefined || amount === null || isNaN(amount)) return `0 ${currency}`;
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted} ${currency}`;
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case 'paid':
    case 'completed':
      return 'badge-paid';
    case 'partial':
    case 'in_progress':
      return 'badge-partial';
    case 'overdue':
      return 'badge-overdue';
    case 'sent':
    case 'pending':
      return 'badge-sent';
    case 'draft':
    default:
      return 'badge-draft';
  }
}

export function formatStatusLabel(status: string): string {
  switch (status?.toLowerCase()) {
    case 'partial':
      return 'Partially Paid';
    case 'in_progress':
      return 'In Progress';
    default:
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : '';
  }
}
