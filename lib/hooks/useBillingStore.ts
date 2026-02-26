import { useState, useEffect } from "react";
import { Customer } from "@/lib/api/customers";
import { Product } from "@/lib/api/products";

interface BillingItem extends Product {
  cartQuantity: number;
}

interface BillingSession {
  selectedCustomer: Customer | null;
  cart: BillingItem[];
  discount: number;
  paymentMethod: "cash" | "card" | "upi";
  paidAmount: number;
  lastUpdated: string;
}

const BILLING_SESSION_KEY = "current_billing_session";

export const useBillingStore = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [cart, setCart] = useState<BillingItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "upi">(
    "cash",
  );
  const [paidAmount, setPaidAmount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(BILLING_SESSION_KEY);
    if (savedSession) {
      try {
        const session: BillingSession = JSON.parse(savedSession);
        setSelectedCustomer(session.selectedCustomer);
        setCart(session.cart);
        setDiscount(session.discount);
        setPaymentMethod(session.paymentMethod);
        setPaidAmount(session.paidAmount);
      } catch (error) {
        console.error("Error loading billing session:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;

    const session: BillingSession = {
      selectedCustomer,
      cart,
      discount,
      paymentMethod,
      paidAmount,
      lastUpdated: new Date().toISOString(),
    };

    if (selectedCustomer || cart.length > 0) {
      localStorage.setItem(BILLING_SESSION_KEY, JSON.stringify(session));
    } else {
      // Clear storage if no data
      localStorage.removeItem(BILLING_SESSION_KEY);
    }
  }, [selectedCustomer, cart, discount, paymentMethod, paidAmount, isLoaded]);

  // Clear session
  const clearSession = () => {
    setSelectedCustomer(null);
    setCart([]);
    setDiscount(0);
    setPaymentMethod("cash");
    setPaidAmount(0);
    localStorage.removeItem(BILLING_SESSION_KEY);
  };

  // Update customer
  const updateCustomer = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    if (!customer) {
      // Clear cart when customer is removed
      setCart([]);
    }
  };

  // Add to cart
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  // Update quantity
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      setCart((prev) => prev.filter((item) => item._id !== productId));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item._id === productId ? { ...item, cartQuantity: quantity } : item,
        ),
      );
    }
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item._id !== productId));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  return {
    selectedCustomer,
    cart,
    discount,
    paymentMethod,
    paidAmount,
    isLoaded,
    setSelectedCustomer: updateCustomer,
    setDiscount,
    setPaymentMethod,
    setPaidAmount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    clearSession,
  };
};
