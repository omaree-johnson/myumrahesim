"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CartConfirmationModal } from "./cart-confirmation-modal";

export type CartItem = {
  offerId: string;
  name: string;
  // Original price label used across the app (e.g. "USD 14.95")
  priceLabel: string;
  quantity: number;
};

export type CartState = {
  items: CartItem[];
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (offerId: string) => void;
  setQuantity: (offerId: string, quantity: number) => void;
  replace: (items: CartItem[]) => void;
  clear: () => void;
  showCartModal: (itemName?: string) => void;
};

const CART_STORAGE_KEY = "umrahesim-cart-v1";

function safeParseCart(raw: string | null): CartState {
  if (!raw) return { items: [] };
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) return { items: [] };
    const items: CartItem[] = parsed.items
      .filter((i: any) => i && typeof i.offerId === "string")
      .map((i: any) => ({
        offerId: String(i.offerId),
        name: String(i.name || i.offerId),
        priceLabel: String(i.priceLabel || ""),
        quantity: Math.max(1, Math.min(10, Number(i.quantity) || 1)),
      }));
    return { items };
  } catch {
    return { items: [] };
  }
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItemName, setModalItemName] = useState<string | undefined>();

  useEffect(() => {
    setMounted(true);
    const initial = safeParseCart(localStorage.getItem(CART_STORAGE_KEY));
    setItems(initial.items);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const state: CartState = { items };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  }, [items, mounted]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity: number = 1) => {
    const qty = Math.max(1, Math.min(10, quantity));
    setItems((prev) => {
      const existing = prev.find((p) => p.offerId === item.offerId);
      if (!existing) return [...prev, { ...item, quantity: qty }];
      return prev.map((p) =>
        p.offerId === item.offerId ? { ...p, quantity: Math.min(10, p.quantity + qty) } : p,
      );
    });
  }, []);

  const showCartModal = useCallback((itemName?: string) => {
    setModalItemName(itemName);
    setModalOpen(true);
  }, []);

  const removeItem = useCallback((offerId: string) => {
    setItems((prev) => prev.filter((p) => p.offerId !== offerId));
  }, []);

  const setQuantity = useCallback((offerId: string, quantity: number) => {
    const qty = Math.max(1, Math.min(10, quantity));
    setItems((prev) => prev.map((p) => (p.offerId === offerId ? { ...p, quantity: qty } : p)));
  }, []);

  const replace = useCallback((nextItems: CartItem[]) => {
    const sanitized = (Array.isArray(nextItems) ? nextItems : [])
      .filter((i: any) => i && typeof i.offerId === "string")
      .map((i: any) => ({
        offerId: String(i.offerId),
        name: String(i.name || i.offerId),
        priceLabel: String(i.priceLabel || ""),
        quantity: Math.max(1, Math.min(10, Number(i.quantity) || 1)),
      })) as CartItem[];
    setItems(sanitized);
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + (i.quantity || 0), 0),
    [items],
  );

  const value: CartContextValue = useMemo(
    () => ({ items, totalItems, addItem, removeItem, setQuantity, replace, clear, showCartModal }),
    [items, totalItems, addItem, removeItem, setQuantity, replace, clear, showCartModal],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        itemName={modalItemName}
      />
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    return {
      items: [],
      totalItems: 0,
      addItem: () => {},
      removeItem: () => {},
      setQuantity: () => {},
      replace: () => {},
      clear: () => {},
      showCartModal: () => {},
    };
  }
  return ctx;
}

