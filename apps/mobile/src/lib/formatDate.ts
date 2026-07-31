/**
 * Firestore fields typed `string` in @zyra/conf's domain entities (createdAt,
 * updatedAt, ...) are actually written via `serverTimestamp()`, so at runtime
 * they come back as Firestore `Timestamp` instances, not strings. This accepts
 * either shape (plus a raw ISO string, for anything set manually) safely.
 */
export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && value !== null) {
    if ('toDate' in value && typeof (value as { toDate: unknown }).toDate === 'function') {
      return (value as { toDate: () => Date }).toDate();
    }
    if ('seconds' in value && typeof (value as { seconds: unknown }).seconds === 'number') {
      return new Date((value as { seconds: number }).seconds * 1000);
    }
  }
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(value: unknown, fallback = '—'): string {
  const date = toDate(value);
  if (!date) return fallback;
  return (
    date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) +
    ', ' +
    date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  );
}

export function formatDateLong(value: unknown, fallback = '—'): string {
  const date = toDate(value);
  if (!date) return fallback;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}
