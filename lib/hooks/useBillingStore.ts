import { useState, useEffect } from "react";
import { Customer } from "@/lib/api/customers";
import { Product } from "@/lib/api/products";
import {
  createBilling,
  addProductToBilling,
  removeProductFromBilling,
  updateProductQuantity,
  completeBilling,
  deleteBilling,
} from "@/lib/api/billing";
import toast from "react-hot-toast";

interface BillingItem extends Product {
  cartQuantity: number;
}

interface BillingSession {
  selectedCustomer: Customer | null;
  cart: BillingItem[];
  discount: number;
  paymentMethod: "cash" | "card" | "upi";
  paidAmount: number;
  billingId?: string;
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
  const [billingId, setBillingId] = useState<string | undefined>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        setBillingId(session.billingId);
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
      billingId,
      lastUpdated: new Date().toISOString(),
    };

    if (selectedCustomer || cart.length > 0) {
      localStorage.setItem(BILLING_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(BILLING_SESSION_KEY);
    }
  }, [
    selectedCustomer,
    cart,
    discount,
    paymentMethod,
    paidAmount,
    billingId,
    isLoaded,
  ]);

  // Create billing draft when customer is selected
  useEffect(() => {
    const createDraftBilling = async () => {
      if (selectedCustomer && !billingId && !isLoading) {
        setIsLoading(true);
        try {
          const response = await createBilling(selectedCustomer._id);
          if (response.success && response.data) {
            setBillingId(response.data._id);
            toast.success("Billing session created");
          }
        } catch (error: any) {
          console.error("Error creating billing draft:", error);
          toast.error(
            error.response?.data?.message || "Failed to create billing",
          );
        } finally {
          setIsLoading(false);
        }
      }
    };

    createDraftBilling();
  }, [selectedCustomer, billingId, isLoading]);

  // Clear session
  const clearSession = async () => {
    if (billingId) {
      try {
        await deleteBilling(billingId);
      } catch (error) {
        console.error("Error deleting billing:", error);
      }
    }

    setSelectedCustomer(null);
    setCart([]);
    setDiscount(0);
    setPaymentMethod("cash");
    setPaidAmount(0);
    setBillingId(undefined);
    localStorage.removeItem(BILLING_SESSION_KEY);
  };

  // Update customer
  const updateCustomer = async (customer: Customer | null) => {
    // If there's an existing billing, delete it first
    if (billingId) {
      try {
        await deleteBilling(billingId);
      } catch (error) {
        console.error("Error deleting previous billing:", error);
      }
    }

    setSelectedCustomer(customer);
    setBillingId(undefined);
    if (!customer) {
      setCart([]);
    }
  };

  // Add to cart
  const addToCart = async (product: Product) => {
    if (!billingId) {
      toast.error("Billing session not initialized");
      return;
    }

    const existingItem = cart.find((item) => item._id === product._id);
    const newQuantity = existingItem ? existingItem.cartQuantity + 1 : 1;

    try {
      const response = await addProductToBilling(billingId, product.barCode, 1);

      if (response.success && response.data) {
        // Update cart with the response data
        setCart((prev) => {
          const existing = prev.find((item) => item._id === product._id);
          if (existing) {
            return prev.map((item) =>
              item._id === product._id
                ? { ...item, cartQuantity: newQuantity }
                : item,
            );
          }
          return [...prev, { ...product, cartQuantity: 1 }];
        });
        toast.success("Product added to cart");
      }
    } catch (error: any) {
      console.error("Error adding product:", error);
      toast.error(error.response?.data?.message || "Failed to add product");
    }
  };

  // Update quantity
  const updateQuantity = async (productId: string, quantity: number) => {
    if (!billingId) return;

    const product = cart.find((item) => item._id === productId);
    if (!product) return;

    if (quantity < 1) {
      await removeFromCart(productId);
      return;
    }

    try {
      const response = await updateProductQuantity(
        billingId,
        productId,
        quantity,
      );

      if (response.success) {
        setCart((prev) =>
          prev.map((item) =>
            item._id === productId ? { ...item, cartQuantity: quantity } : item,
          ),
        );
      }
    } catch (error: any) {
      console.error("Error updating quantity:", error);
      toast.error(error.response?.data?.message || "Failed to update quantity");
    }
  };

  // Remove from cart
  const removeFromCart = async (productId: string) => {
    if (!billingId) {
      toast.error("No active billing session");
      return;
    }

    const product = cart.find((item) => item._id === productId);
    if (!product) return;

    try {
      const response = await removeProductFromBilling(billingId, productId);

      if (response.success) {
        setCart((prev) => prev.filter((item) => item._id !== productId));
        toast.success("Item removed from cart");

        // Update the billing data if needed
        if (response.data) {
          // You can update totals from response if needed
          console.log("Billing updated:", response.data);
        }
      }
    } catch (error: any) {
      console.error("Error removing item:", error);
      toast.error(error.response?.data?.message || "Failed to remove item");
    }
  };

  const deleteBillingDraft = async (billingIdToDelete: string) => {
    try {
      const response = await deleteBilling(billingIdToDelete);
      if (response.success) {
        toast.success(response.message || "Billing deleted successfully");
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error deleting billing:", error);
      toast.error(error.response?.data?.message || "Failed to delete billing");
      return false;
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!billingId || cart.length === 0) return;

    // Remove all items one by one
    for (const item of cart) {
      try {
        await removeProductFromBilling(billingId, item._id);
      } catch (error) {
        console.error("Error removing item:", error);
      }
    }

    setCart([]);
    toast.success("Cart cleared");
  };

  // Generate invoice (complete billing)
  const generateInvoice = async (): Promise<string | null> => {
    if (!billingId) {
      toast.error("No active billing session");
      return null;
    }

    if (cart.length === 0) {
      toast.error("Cart is empty");
      return null;
    }

    setIsLoading(true);
    try {
      const response = await completeBilling(billingId);
      if (response.success) {
        toast.success(response.message || "Invoice generated successfully");
        return billingId; // Return the billing ID to fetch full data
      }
      return null;
    } catch (error: any) {
      console.error("Error generating invoice:", error);
      toast.error(
        error.response?.data?.message || "Failed to generate invoice",
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    selectedCustomer,
    cart,
    discount,
    paymentMethod,
    paidAmount,
    billingId,
    isLoaded,
    isLoading,
    setSelectedCustomer: updateCustomer,
    setDiscount,
    setPaymentMethod,
    setPaidAmount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    clearSession,
    generateInvoice,
    deleteBillingDraft,
  };
};
