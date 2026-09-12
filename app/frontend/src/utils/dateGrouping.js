// Buckets an already-time-sorted list into per-calendar-day groups,
// preserving order - powers the PMG-style "Date: DD/MM/YYYY (N)" section
// headers on the Quarantine and Tracking Center list pages. Only meaningful
// when the list is actually sorted by time; callers should pass null instead
// of calling this when sorted by another column.
export function groupByDate(items, getTime) {
  const groups = [];
  const byKey = new Map();
  for (const item of items) {
    const d = new Date(getTime(item) * 1000);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    let group = byKey.get(dateKey);
    if (!group) {
      const dateLabel = d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      group = { dateKey, dateLabel, items: [] };
      byKey.set(dateKey, group);
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}
