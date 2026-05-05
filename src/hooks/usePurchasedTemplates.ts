import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/integrations/api/client";

const FREE_TEMPLATES: string[] = [];
const SPECIAL_FREE_NAME = "dhaval talaviya";

const normalizeName = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

const getStoredResumeName = () => {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("resume_full_name") ?? "";
};

export const usePurchasedTemplates = (resumeFullName?: string) => {
  const { user } = useAuth();
  const [purchased, setPurchased] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshPurchased = async () => {
    if (!user) {
      setPurchased([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch<{ templateIds: string[] }>("/api/templates/purchases", {}, true);
      setPurchased(data.templateIds ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPurchased();
  }, [user]);

  const effectiveName = resumeFullName ?? getStoredResumeName();
  const unlockAllForSpecialName = normalizeName(effectiveName) === SPECIAL_FREE_NAME;

  const isOwned = (templateId: string) => purchased.includes(templateId);
  const isFree = (templateId: string) => unlockAllForSpecialName || FREE_TEMPLATES.includes(templateId);

  return { purchased, loading, isOwned, isFree, refreshPurchased };
};
