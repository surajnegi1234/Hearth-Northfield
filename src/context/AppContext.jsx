import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE = {
  theme: "hearth.theme",
  profile: "hearth.profile.v2",
  prefs: "hearth.prefs",
  chat: "hearth.chat",
  apiKey: "hearth.geminiKey",
};

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const defaultProfile = {
  firstName: "Simran",
  lastName: "Kaur",
  title: "Ops coordinator",
  email: "simran.kaur@northfield.internal",
  desk: "3rd floor, by the tulsi pots",
};

const defaultPrefs = {
  deskPings: true,
  weeklyDigest: false,
  sound: false,
};

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(STORAGE.theme);
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const [profile, setProfile] = useState(() =>
    readJson(STORAGE.profile, defaultProfile)
  );
  const [prefs, setPrefs] = useState(() => readJson(STORAGE.prefs, defaultPrefs));
  const [messages, setMessages] = useState(() => readJson(STORAGE.chat, []));
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem(STORAGE.apiKey) || ""
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE.theme, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE.profile, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE.prefs, JSON.stringify(prefs));
  }, [prefs]);

  useEffect(() => {
    localStorage.setItem(STORAGE.chat, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (apiKey) localStorage.setItem(STORAGE.apiKey, apiKey);
    else localStorage.removeItem(STORAGE.apiKey);
  }, [apiKey]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      setTheme,
      profile,
      setProfile,
      prefs,
      setPrefs,
      messages,
      setMessages,
      clearChat: () => setMessages([]),
      apiKey,
      setApiKey,
    }),
    [theme, profile, prefs, messages, apiKey]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must sit inside AppProvider");
  return ctx;
}
