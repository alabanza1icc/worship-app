import { createServiceClient } from "@/lib/supabase";

export type AppRole = "admin" | "leader" | "participant" | "musician" | "multimedia";

export interface PermissionProfile {
  id: string;
  role: AppRole;
  is_leader: boolean;
  onboarding_completed?: boolean;
}

export function canAdmin(profile: PermissionProfile | null | undefined) {
  return profile?.role === "admin";
}

export function canManageEvents(profile: PermissionProfile | null | undefined) {
  return profile?.role === "admin" || profile?.role === "leader" || profile?.is_leader === true;
}

export function canManageSongs(profile: PermissionProfile | null | undefined) {
  return canAdmin(profile);
}

export async function getPermissionProfile(userId: string) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, is_leader, onboarding_completed")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data as PermissionProfile;
}

export async function requireAdmin(userId: string) {
  const profile = await getPermissionProfile(userId);
  return canAdmin(profile) ? profile : null;
}

export async function requireEventManager(userId: string) {
  const profile = await getPermissionProfile(userId);
  return canManageEvents(profile) ? profile : null;
}
