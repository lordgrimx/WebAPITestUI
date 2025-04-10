import { ConvexReactClient } from "convex/react";
// Check if we're importing from the correct package
import { ConvexProviderWithAuth0 as Auth0Provider } from "convex/react-auth0";

// Make sure the URL is properly formatted and valid
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://excited-lynx-201.convex.cloud";

export const convex = new ConvexReactClient(convexUrl);

// Export with clear naming
export { Auth0Provider as ConvexProviderWithAuth0 };