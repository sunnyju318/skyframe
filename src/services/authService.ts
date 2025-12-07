// ============================================================================
// Authentication & Session Management for Bluesky (AT Protocol)
// ============================================================================

import AsyncStorage from "@react-native-async-storage/async-storage";
import { AtpAgent, AtpSessionData } from "@atproto/api";

// Storage key for persisted sessions
const SESSION_KEY = "bluesky_session";

// ============================================================================
// Agent — Shared Bluesky API client instance
// ============================================================================
export const agent = new AtpAgent({
  service: "https://bsky.social",
});

// Re-export Bluesky Session type for convenience
export type Session = AtpSessionData;

// ============================================================================
// Save session to device storage
// ============================================================================
export const saveSession = async (session: Session): Promise<void> => {
  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error("Error saving session:", error);
    throw error;
  }
};

// ============================================================================
// Load session (tokens) from AsyncStorage
// ============================================================================
export const loadSession = async (): Promise<Session | null> => {
  try {
    const sessionData = await AsyncStorage.getItem(SESSION_KEY);
    return sessionData ? JSON.parse(sessionData) : null;
  } catch (error) {
    console.error("Error loading session:", error);
    return null;
  }
};

// ============================================================================
// Clear session (logout)
// ============================================================================
export const clearSession = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error("Error clearing session:", error);
    throw error;
  }
};

// ============================================================================
// Login — authenticate with Bluesky credentials
// (Uses App Password recommended by Bluesky security)
// ============================================================================
export const login = async (
  identifier: string,
  password: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await agent.login({ identifier, password });

    if (!agent.session) {
      throw new Error("No session returned after login");
    }

    // Save session tokens (never store password)
    await saveSession(agent.session);

    return { success: true };
  } catch (error: any) {
    console.error("Login failed:", error);
    return { success: false, error: error.message || "Login failed" };
  }
};

// ============================================================================
// Logout — remove saved session
// ============================================================================
export const logout = async (): Promise<void> => {
  await clearSession();
};

// ============================================================================
// Check login status
// ============================================================================
export const isLoggedIn = async (): Promise<boolean> => {
  const session = await loadSession();
  return session !== null;
};

// ============================================================================
// Get shared agent instance (for API calls)
// ============================================================================
export const getAgent = (): AtpAgent => {
  return agent;
};

// ============================================================================
// Resume session on app startup — prevents login screen flash
// ============================================================================
export const resumeSession = async (): Promise<boolean> => {
  try {
    const session = await loadSession();
    if (!session) return false;

    await agent.resumeSession(session);
    return true;
  } catch (error) {
    console.error("Error resuming session:", error);

    // Invalid token? Clear it.
    await clearSession();
    return false;
  }
};

// ============================================================================
// Get currently stored user/session info
// ============================================================================
export const getCurrentUser = async (): Promise<Session | null> => {
  return await loadSession();
};
