// 🎸 useSession Hook (Re-export)
// Custom Hook für Session Management

import { useSession as useNextAuthSession } from "next-auth/react";

export function useSession() {
  return useNextAuthSession();
}
