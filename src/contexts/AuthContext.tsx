import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ApiUser, apiFetch, authToken } from "@/integrations/api/client";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface AuthContextType {
  user: ApiUser | null;
  session: { token: string } | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const loadGoogleIdentityScript = () =>
  new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.querySelector('script[data-google-identity="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Google SDK")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.setAttribute("data-google-identity", "true");
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google SDK"));
    document.head.appendChild(script);
  });

const requestGoogleCredential = async (): Promise<string> => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("Missing VITE_GOOGLE_CLIENT_ID");

  await loadGoogleIdentityScript();

  return new Promise<string>((resolve, reject) => {
    let settled = false;

    window.google?.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (settled) return;
        settled = true;
        if (!response.credential) {
          reject(new Error("Google sign-in was cancelled"));
          return;
        }
        resolve(response.credential);
      },
    });

    window.google?.accounts.id.prompt();

    setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error("Google sign-in timed out"));
      }
    }, 60_000);
  });
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [session, setSession] = useState<{ token: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authToken.get();
    if (!token) {
      setLoading(false);
      return;
    }

    apiFetch<{ user: ApiUser }>("/api/auth/me", {}, true)
      .then((data) => {
        setUser(data.user);
        setSession({ token });
      })
      .catch(() => {
        authToken.clear();
        setUser(null);
        setSession(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const signInWithGoogle = async () => {
    const idToken = await requestGoogleCredential();
    const data = await apiFetch<{ token: string; user: ApiUser }>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });

    authToken.set(data.token);
    setSession({ token: data.token });
    setUser(data.user);
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const data = await apiFetch<{ token: string; user: ApiUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      authToken.set(data.token);
      setSession({ token: data.token });
      setUser(data.user);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    try {
      const data = await apiFetch<{ token: string; user: ApiUser }>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password, fullName }),
      });
      authToken.set(data.token);
      setSession({ token: data.token });
      setUser(data.user);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    authToken.clear();
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
