// ============================================================================
// 🔐 AuthContext — Global authentication state (login, logout, session restore)
// ============================================================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  login as loginService,
  logout as logoutService,
  resumeSession,
  getCurrentUser,
  clearSession,
  Session,
} from "../services/authService";

// ============================================================================
// Types
// ============================================================================

interface AuthContextType {
  isAuthenticated: boolean;
  user: Session | null;
  loading: boolean;
  login: (
    identifier: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

export function AuthProvider({ children }: AuthProviderProps) {
  // Global auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------------------------------
  // Check for existing session on mount
  // --------------------------------------------------------------------------
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      console.log("Checking for existing session...");

      const sessionRestored = await resumeSession();
      console.log("Session restored:", sessionRestored);

      if (sessionRestored) {
        const currentUser = await getCurrentUser();
        console.log("User found:", currentUser?.handle);
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        console.log("No session found");
      }
    } catch (error) {
      console.error("Session check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Login
  // --------------------------------------------------------------------------
  const login = async (
    identifier: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const result = await loginService(identifier, password);

    if (result.success) {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);
    }

    return result;
  };

  // --------------------------------------------------------------------------
  // Logout
  // --------------------------------------------------------------------------
  const logout = async () => {
    await logoutService();
    setUser(null);
    setIsAuthenticated(false);
  };

  // --------------------------------------------------------------------------
  // Context value
  // --------------------------------------------------------------------------
  const value: AuthContextType = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// Hook — useAuth
// ============================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
