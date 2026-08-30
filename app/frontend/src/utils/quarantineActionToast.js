const ACTION_TOAST = {
  deliver: { tone: 'success', label: (n) => (n > 1 ? `${n} messages delivered` : 'Message delivered') },
  blocklist: {
    tone: 'danger',
    label: (n) => (n > 1 ? `${n} senders blocked, messages deleted` : 'Sender blocked, message deleted'),
  },
  whitelist: { tone: 'info', label: () => 'Sender added to welcome list and message delivered' },
};

export function quarantineActionToast(action, count = 1) {
  const entry = ACTION_TOAST[action];
  if (!entry) return { tone: 'success', message: 'Action completed' };
  return { tone: entry.tone, message: entry.label(count) };
}
