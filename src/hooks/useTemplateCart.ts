import { useCallback, useEffect, useState } from "react";

const CART_KEY = "rb_template_cart";

export const useTemplateCart = () => {
  const [cartTemplateIds, setCartTemplateIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setCartTemplateIds(parsed.filter((id) => typeof id === "string"));
      }
    } catch {
      setCartTemplateIds([]);
    }
  }, []);

  const persist = useCallback((ids: string[]) => {
    setCartTemplateIds(ids);
    localStorage.setItem(CART_KEY, JSON.stringify(ids));
  }, []);

  const addToCart = useCallback(
    (templateId: string) => {
      if (cartTemplateIds.includes(templateId)) return;
      persist([...cartTemplateIds, templateId]);
    },
    [cartTemplateIds, persist]
  );

  const removeFromCart = useCallback(
    (templateId: string) => {
      persist(cartTemplateIds.filter((id) => id !== templateId));
    },
    [cartTemplateIds, persist]
  );

  const clearCart = useCallback(() => {
    persist([]);
  }, [persist]);

  const isInCart = useCallback(
    (templateId: string) => cartTemplateIds.includes(templateId),
    [cartTemplateIds]
  );

  return {
    cartTemplateIds,
    cartCount: cartTemplateIds.length,
    addToCart,
    removeFromCart,
    clearCart,
    isInCart,
  };
};
