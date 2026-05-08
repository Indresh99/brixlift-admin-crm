export function parseIndianMoney(value) {
  if (value === null || value === undefined || value === "") return null;
  const raw = String(value).trim().toLowerCase();
  const number = Number(raw.replace(/[^0-9.-]/g, ""));
  if (Number.isNaN(number)) return null;

  if (raw.includes("crore") || raw.includes("cr")) {
    return number * 10000000;
  }
  if (raw.includes("lakh") || raw.includes("lac") || raw.includes("lk")) {
    return number * 100000;
  }
  return number;
}

export function formatIndianMoney(value) {
  const amount = parseIndianMoney(value);
  if (!amount) return "₹ 0";

  const absolute = Math.abs(amount);
  if (absolute >= 10000000) {
    return `₹ ${compact(amount / 10000000)} Crore`;
  }
  if (absolute >= 100000) {
    return `₹ ${compact(amount / 100000)} Lakh`;
  }
  return `₹ ${Math.round(amount).toLocaleString("en-IN")}`;
}

function compact(value) {
  return Number(value.toFixed(2)).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}
