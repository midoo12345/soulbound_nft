// Pinata configuration
// Load credentials from environment variables (Vite: use VITE_ prefix)

const PINATA_CONFIG = {
  jwt: import.meta.env.VITE_PINATA_JWT || "",
  apiKey: import.meta.env.VITE_PINATA_API_KEY || "",
  apiSecret: import.meta.env.VITE_PINATA_API_SECRET || "",
  gateway: import.meta.env.VITE_PINATA_GATEWAY || "",
};

export default PINATA_CONFIG;



 