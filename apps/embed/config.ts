export const EMBED_CONFIG = {
  WIDGET_URL: import.meta.env.PROD
  ? "https://support-platform-widget-lime.vercel.app/widget"
  : "http://localhost:3001",
  DEFAULT_ORG_ID: "org_3CZzYyYx1HIAbkfLONcTwxDRhsW",
  DEFAULT_POSITION: "bottom-right" as const,
};