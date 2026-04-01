/** Base URL for the Express API (set VITE_API_URL on production hosts like Render). */
const rawApi = import.meta.env.VITE_API_URL as string | undefined;
export const API_URL = (rawApi?.replace(/\/$/, "") || "http://localhost:4000").trim();

const rawStore = import.meta.env.VITE_STORE_URL as string | undefined;
const storeDefault = import.meta.env.PROD ? "https://yosephdesign.onrender.com" : "http://localhost:3000";
export const STORE_URL = (rawStore?.replace(/\/$/, "") || storeDefault).trim();
