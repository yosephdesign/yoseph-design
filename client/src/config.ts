/** Base URL for the Express API (set VITE_API_URL on production hosts like Render). */
const raw = import.meta.env.VITE_API_URL as string | undefined;
export const API_URL = (raw?.replace(/\/$/, "") || "http://localhost:4000").trim();
