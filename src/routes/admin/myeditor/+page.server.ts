import type { PageServerLoad } from "./$types";
import { requireRole } from "$lib/server/auth/guard";

export const load: PageServerLoad = async (event) => {
  requireRole(event, "admin");
  return {};
};
