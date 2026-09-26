/**
 * Utility to calculate month-by-month trajectory for the last 12 months.
 *
 * @param {Array} leadsArray - Array of lead objects from PostgreSQL (containing createdAt dates)
 * @returns {Array<{ month: string, count: number }>} 12-month trajectory array
 */
export const getLast12MonthsLeadTrajectory = (leadsArray = []) => {
  const months = [];
  const now = new Date();

  // Generate last 12 months array (oldest to current month)
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    const monthKey = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    months.push({
      key: monthKey,
      month: monthLabel,
      count: 0,
    });
  }

  // Count actual leads per month based on createdAt date
  if (Array.isArray(leadsArray)) {
    leadsArray.forEach((lead) => {
      if (lead && lead.createdAt) {
        const leadDate = new Date(lead.createdAt);
        if (!isNaN(leadDate.getTime())) {
          const leadKey = `${leadDate.getFullYear()}-${String(leadDate.getMonth() + 1).padStart(2, '0')}`;
          const found = months.find((m) => m.key === leadKey);
          if (found) {
            found.count += 1;
          }
        }
      }
    });
  }

  return months.map(({ month, count }) => ({ month, count }));
};
