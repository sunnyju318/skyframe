// Authentication and session management
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AtpAgent, AtpSessionData } from "@atproto/api";

const SESSION_KEY = "bluesky_session";

// Create Bluesky agent instance and EXPORT it
export const agent = new AtpAgent({
  service: "https://bsky.social",
});

// Use AtpSessionData from @atproto/api
export type Session = AtpSessionData;

// Save session to AsyncStorage
export const saveSession = async (session: Session): Promise<void> => {
  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error("Error saving session:", error);
    throw error;
  }
};

// Load session from AsyncStorage
export const loadSession = async (): Promise<Session | null> => {
  try {
    const sessionData = await AsyncStorage.getItem(SESSION_KEY);
    if (sessionData) {
      return JSON.parse(sessionData);
    }
    return null;
  } catch (error) {
    console.error("Error loading session:", error);
    return null;
  }
};

// Clear session (logout)
export const clearSession = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error("Error clearing session:", error);
    throw error;
  }
};

// Login with credentials
export const login = async (
  identifier: string,
  password: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await agent.login({ identifier, password });

    if (!agent.session) {
      throw new Error("No session after login");
    }

    // Save session (tokens only, never password!)
    await saveSession(agent.session);

    return { success: true };
  } catch (error: any) {
    console.error("Login failed:", error);
    return { success: false, error: error.message || "Login failed" };
  }
};

// Logout
export const logout = async (): Promise<void> => {
  await clearSession();
};

// Check if user is logged in
export const isLoggedIn = async (): Promise<boolean> => {
  const session = await loadSession();
  return session !== null;
};

// Get agent instance (for API calls)
export const getAgent = (): AtpAgent => {
  return agent;
};

// Resume session (for app startup)
export const resumeSession = async (): Promise<boolean> => {
  try {
    const session = await loadSession();
    if (!session) {
      return false;
    }

    await agent.resumeSession(session);
    return true;
  } catch (error) {
    console.error("Error resuming session:", error);
    // If resume fails, clear invalid session
    await clearSession();
    return false;
  }
};

// Get current logged-in user
export const getCurrentUser = async (): Promise<Session | null> => {
  return await loadSession();
};
