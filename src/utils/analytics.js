const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

export function initAnalytics() {
  if (!measurementId || window.gtag) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId, { send_page_view: false });
}

export function trackPageView(path) {
  if (!measurementId || !window.gtag) return;
  window.gtag("config", measurementId, {
    page_path: path,
  });
}
