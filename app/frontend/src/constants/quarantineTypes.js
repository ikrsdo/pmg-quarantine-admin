export const QUARANTINE_TYPES = [
  { value: 'spam', label: 'Spam Quarantine' },
  { value: 'virus', label: 'Virus Quarantine' },
  { value: 'attachment', label: 'Attachment Quarantine' },
];

export const DEFAULT_QUARANTINE_TYPE = 'spam';

export function quarantineTypeLabel(type) {
  return QUARANTINE_TYPES.find((t) => t.value === type)?.label || 'Quarantine';
}
