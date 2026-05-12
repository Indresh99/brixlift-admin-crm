const PROD_API_BASE_URL = "https://api.brixlift.com";

function getDefaultApiBaseUrl() {
  if (typeof window === "undefined") {
    return PROD_API_BASE_URL;
  }

  const { hostname } = window.location;
  const localHosts = ["localhost", "127.0.0.1", "0.0.0.0", "::1"];

  if (localHosts.includes(hostname)) {
    return "http://localhost:8080";
  }

  return PROD_API_BASE_URL;
}

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || getDefaultApiBaseUrl()
).replace(/\/$/, "");

export const API_ROOT = `${API_BASE_URL}/api`;
