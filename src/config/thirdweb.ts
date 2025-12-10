import { createThirdwebClient } from "thirdweb";

// Get client ID from environment variable
const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;

// Debug logging (will show in browser console)
console.log("Environment check:", {
  clientId: clientId ? "EXISTS" : "MISSING",
  allEnvVars: import.meta.env
});

// Validate that client ID exists
if (!clientId) {
  console.error("❌ VITE_THIRDWEB_CLIENT_ID is missing!");
  console.error("Available env vars:", Object.keys(import.meta.env));
  throw new Error(
    "Missing VITE_THIRDWEB_CLIENT_ID environment variable. " +
    "Please check your Render environment variables."
  );
}

console.log("✅ Creating thirdweb client...");

export const client = createThirdwebClient({
  clientId: clientId,
});

console.log("✅ Thirdweb client created successfully");
