import { useState, useEffect, useRef, useCallback } from "react";
import { Supplier } from "@/lib/api/suppliers";
import {
  createPurchase,
  addProductToPurchase,
  removeProductFromPurchase,
  updatePurchaseQuantity,
  completePurchase,
  deletePurchase,
  PurchaseInvoice,
  PurchaseItem,
} from "@/lib/api/purchases";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface PurchaseSession {
  selectedSupplier: Supplier | null;
  items: PurchaseItem[];
  invoiceNumber: string;
  invoiceDate: string;
  placeOfSupply: string;
  reverseCharge: string;
  purchaseId?: string;
  lastUpdated: string;
}

const PURCHASE_SESSION_KEY = "current_purchase_session";

export const usePurchaseStore = () => {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [placeOfSupply, setPlaceOfSupply] = useState("");
  const [reverseCharge, setReverseCharge] = useState("No");
  const [purchaseId, setPurchaseId] = useState<string | undefined>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseData, setPurchaseData] = useState<PurchaseInvoice | null>(
    null,
  );

  // Use a ref to track if we've already attempted to create a purchase for this combination
  const creationAttemptedRef = useRef<{ [key: string]: boolean }>({});

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(PURCHASE_SESSION_KEY);
    if (savedSession) {
      try {
        const session: PurchaseSession = JSON.parse(savedSession);
        setSelectedSupplier(session.selectedSupplier);
        setItems(session.items);
        setInvoiceNumber(session.invoiceNumber);
        setInvoiceDate(session.invoiceDate || format(new Date(), "yyyy-MM-dd"));
        setPlaceOfSupply(session.placeOfSupply || "");
        setReverseCharge(session.reverseCharge || "No");
        setPurchaseId(session.purchaseId);
      } catch (error) {
        console.error("Error loading purchase session:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;

    const session: PurchaseSession = {
      selectedSupplier,
      items,
      invoiceNumber,
      invoiceDate,
      placeOfSupply,
      reverseCharge,
      purchaseId,
      lastUpdated: new Date().toISOString(),
    };

    if (
      selectedSupplier ||
      items.length > 0 ||
      invoiceNumber ||
      invoiceDate ||
      placeOfSupply
    ) {
      localStorage.setItem(PURCHASE_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(PURCHASE_SESSION_KEY);
    }
  }, [
    selectedSupplier,
    items,
    invoiceNumber,
    invoiceDate,
    placeOfSupply,
    reverseCharge,
    purchaseId,
    isLoaded,
  ]);

  // Clear session
  const clearSession = useCallback(async () => {
    if (purchaseId && items.length === 0) {
      try {
        await deletePurchase(purchaseId);
      } catch (error) {
        console.error("Error deleting purchase:", error);
      }
    }

    setSelectedSupplier(null);
    setItems([]);
    setInvoiceNumber("");
    setInvoiceDate(format(new Date(), "yyyy-MM-dd"));
    setPlaceOfSupply("");
    setReverseCharge("No");
    setPurchaseId(undefined);
    setPurchaseData(null);
    localStorage.removeItem(PURCHASE_SESSION_KEY);
    // Clear the creation attempts ref
    creationAttemptedRef.current = {};
  }, [purchaseId, items.length]);

  // Update supplier
  const updateSupplier = useCallback(
    async (supplier: Supplier | null) => {
      // If there's an existing purchase with no items, delete it
      if (purchaseId && items.length === 0) {
        try {
          await deletePurchase(purchaseId);
        } catch (error) {
          console.error("Error deleting previous purchase:", error);
        }
      }

      setSelectedSupplier(supplier);
      setPurchaseId(undefined);
      setPurchaseData(null);
      if (!supplier) {
        setItems([]);
        setInvoiceNumber("");
        setInvoiceDate(format(new Date(), "yyyy-MM-dd"));
        setPlaceOfSupply("");
        setReverseCharge("No");
      }
      // Clear the creation attempts ref when supplier changes
      creationAttemptedRef.current = {};
    },
    [purchaseId, items.length],
  );

  // Manual function to create purchase - call this when user is ready
  const createPurchaseDraft = useCallback(async (): Promise<boolean> => {
    if (!selectedSupplier) {
      toast.error("Please select a supplier first");
      return false;
    }

    if (!invoiceNumber.trim()) {
      toast.error("Please enter invoice number");
      return false;
    }

    if (!invoiceDate) {
      toast.error("Please select invoice date");
      return false;
    }

    if (!placeOfSupply.trim()) {
      toast.error("Please enter place of supply");
      return false;
    }

    if (!reverseCharge) {
      toast.error("Please select reverse charge");
      return false;
    }

    if (purchaseId) {
      return true; // Already have a purchase
    }

    // Create a unique key for this supplier+invoice combination
    const key = `${selectedSupplier._id}-${invoiceNumber.trim()}`;

    // Check if we've already attempted this combination
    if (creationAttemptedRef.current[key]) {
      return false;
    }

    setIsLoading(true);
    try {
      const response = await createPurchase({
        supplierId: selectedSupplier._id,
        invoiceNumber: invoiceNumber.trim(),
        invoiceDate: invoiceDate,
        placeOfSupply: placeOfSupply.trim(),
        reverseCharge: reverseCharge,
      });

      if (response.success && response.data) {
        setPurchaseId(response.data._id);
        setPurchaseData(response.data);
        toast.success("Purchase invoice created");
        // Mark this combination as successfully created
        creationAttemptedRef.current[key] = true;
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error creating purchase draft:", error);
      // Mark this combination as attempted (failed)
      creationAttemptedRef.current[key] = true;

      toast.error(
        error.response?.data?.message || "Failed to create purchase invoice",
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedSupplier,
    invoiceNumber,
    invoiceDate,
    placeOfSupply,
    reverseCharge,
    purchaseId,
  ]);

  // Scan barcode to add product
  const scanBarcode = useCallback(
    async (barcode: string, quantity: number = 1) => {
      if (!purchaseId) {
        // Try to create purchase first
        const created = await createPurchaseDraft();
        if (!created) {
          return false;
        }
      }

      if (!barcode.trim()) {
        toast.error("Please enter barcode");
        return false;
      }

      setIsLoading(true);
      try {
        const response = await addProductToPurchase({
          purchaseId: purchaseId!,
          barCode: barcode,
          quantity,
        });

        if (response.success && response.data) {
          setItems(response.data.items);
          setPurchaseData(response.data);
          toast.success("Product added to purchase");
          return true;
        }
        return false;
      } catch (error: any) {
        console.error("Error adding product:", error);

        // If product not found (404), we need to create it first
        if (error.response?.status === 404) {
          // Don't show error, just return false so UI can show create product dialog
          return false;
        }

        toast.error(error.response?.data?.message || "Failed to add product");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [purchaseId, createPurchaseDraft],
  );

  // Update quantity
  const updateQuantity = useCallback(
    async (productId: string, newQuantity: number) => {
      if (!purchaseId) {
        toast.error("No active purchase session");
        return false;
      }

      if (newQuantity < 1) {
        return await removeProduct(productId);
      }

      setIsLoading(true);
      try {
        const response = await updatePurchaseQuantity({
          purchaseId,
          productId,
          quantity: newQuantity,
        });

        if (response.success && response.data) {
          setItems(response.data.items);
          setPurchaseData(response.data);
          return true;
        }
        return false;
      } catch (error: any) {
        console.error("Error updating quantity:", error);
        toast.error(
          error.response?.data?.message || "Failed to update quantity",
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [purchaseId],
  );

  // Remove product
  const removeProduct = useCallback(
    async (productId: string) => {
      if (!purchaseId) {
        toast.error("No active purchase session");
        return false;
      }

      setIsLoading(true);
      try {
        const response = await removeProductFromPurchase({
          purchaseId,
          productId,
        });

        if (response.success && response.data) {
          setItems(response.data.items);
          setPurchaseData(response.data);
          toast.success("Product removed from purchase");
          return true;
        }
        return false;
      } catch (error: any) {
        console.error("Error removing product:", error);
        toast.error(
          error.response?.data?.message || "Failed to remove product",
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [purchaseId],
  );

  // Complete purchase - THIS SHOULD ONLY BE CALLED MANUALLY
  const completePurchaseInvoice = useCallback(async (): Promise<boolean> => {
    console.log("completePurchaseInvoice called manually");

    if (!purchaseId) {
      toast.error("No active purchase session");
      return false;
    }

    if (items.length === 0) {
      toast.error("No items in purchase invoice");
      return false;
    }

    setIsLoading(true);
    try {
      const response = await completePurchase(purchaseId);
      if (response.success) {
        toast.success("Purchase invoice completed successfully");

        // Clear the session after successful completion
        await clearSession();

        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error completing purchase:", error);
      toast.error(
        error.response?.data?.message || "Failed to complete purchase",
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [purchaseId, items.length, clearSession]);

  // Calculate totals
  const totals = {
    subTotal: items.reduce(
      (sum, item) => sum + item.purchasePrice * item.quantity,
      0,
    ),
    totalTax: items.reduce((sum, item) => sum + item.taxAmount, 0),
    grandTotal: items.reduce((sum, item) => sum + item.totalAmount, 0),
  };

  return {
    // State
    selectedSupplier,
    items,
    invoiceNumber,
    invoiceDate,
    placeOfSupply,
    reverseCharge,
    purchaseId,
    isLoaded,
    isLoading,
    purchaseData,
    totals,

    // Setters
    setSelectedSupplier: updateSupplier,
    setInvoiceNumber,
    setInvoiceDate,
    setPlaceOfSupply,
    setReverseCharge,

    // Actions
    createPurchaseDraft,
    scanBarcode,
    updateQuantity,
    removeProduct,
    completePurchaseInvoice,
    clearSession,
  };
};
