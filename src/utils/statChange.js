import { parseIndianMoney } from "./money";

export function monthChange(
  rows,
  predicate = () => true,
  valueSelector = () => 1,
) {
  const now = new Date();
  const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const current = sumForPeriod(
    rows,
    currentStart,
    now,
    predicate,
    valueSelector,
  );
  const previous = sumForPeriod(
    rows,
    previousStart,
    currentStart,
    predicate,
    valueSelector,
  );

  if (previous === 0 && current === 0) return "0%";
  if (previous === 0) return "+100%";

  const change = ((current - previous) / previous) * 100;
  const rounded = Math.round(change * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

export function moneyToNumber(value) {
  return parseIndianMoney(value) || 0;
}

function sumForPeriod(rows, start, end, predicate, valueSelector) {
  return rows
    .filter(predicate)
    .filter((row) => {
      if (!row.createdAt) return false;
      const createdAt = new Date(row.createdAt);
      return createdAt >= start && createdAt < end;
    })
    .reduce((total, row) => total + valueSelector(row), 0);
}
