import { useState, useEffect, useCallback } from "react";
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
  const [isCreating, setIsCreating] = useState(false);

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(PURCHASE_SESSION_KEY);
    if (savedSession) {
      try {
        const session: PurchaseSession = JSON.parse(savedSession);
        setSelectedSupplier(session.selectedSupplier);
        setItems(session.items || []);
        setInvoiceNumber(session.invoiceNumber || "");
        setInvoiceDate(session.invoiceDate || format(new Date(), "yyyy-MM-dd"));
        setPlaceOfSupply(session.placeOfSupply || "");
        setReverseCharge(session.reverseCharge || "No");
        setPurchaseId(session.purchaseId);
      } catch (error) {
        console.error("🔴 [STORE] Error loading purchase session:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;

    const session: PurchaseSession = {
      selectedSupplier,
      items: items || [],
      invoiceNumber,
      invoiceDate,
      placeOfSupply,
      reverseCharge,
      purchaseId,
      lastUpdated: new Date().toISOString(),
    };

    if (
      selectedSupplier ||
      (items && items.length > 0) ||
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

  // Create purchase ONLY when ALL required fields are filled
  useEffect(() => {
    const createPurchaseWhenReady = async () => {
      const hasAllFields =
        selectedSupplier &&
        invoiceNumber &&
        invoiceNumber.trim() !== "" &&
        invoiceDate &&
        placeOfSupply &&
        placeOfSupply.trim() !== "" &&
        reverseCharge;

      if (hasAllFields && !purchaseId && !isCreating && !isLoading) {
        setIsCreating(true);
        setIsLoading(true);

        try {
          const response = await createPurchase({
            supplierId: selectedSupplier._id,
            invoiceNumber: invoiceNumber,
            invoiceDate: invoiceDate,
            placeOfSupply: placeOfSupply,
            reverseCharge: reverseCharge,
          });

          if (response.success && response.data) {
            setPurchaseId(response.data._id);
            setPurchaseData(response.data);
            toast.success("Purchase session created");
          } else {
            toast.error(response.message || "Failed to create purchase");
          }
        } catch (error: any) {
          console.error("🔴 [STORE] Error creating purchase:", error);
          if (
            error.response?.status === 400 &&
            error.response?.data?.message?.includes(
              "Invoice number already exists",
            )
          ) {
            toast.error(
              `Invoice number "${invoiceNumber}" already exists. Please use a different invoice number.`,
            );
            setInvoiceNumber("");
          } else {
            toast.error(
              error.response?.data?.message ||
                "Failed to create purchase session",
            );
          }
        } finally {
          setIsCreating(false);
          setIsLoading(false);
        }
      }
    };

    createPurchaseWhenReady();
  }, [
    selectedSupplier,
    invoiceNumber,
    invoiceDate,
    placeOfSupply,
    reverseCharge,
    purchaseId,
    isCreating,
    isLoading,
  ]);

  // Clear session - ALWAYS delete the draft from database
  const clearSession = useCallback(async () => {
    if (purchaseId) {
      try {
        const response = await deletePurchase(purchaseId);
        if (response.success) {
          toast.success("Draft deleted successfully");
        }
      } catch (error: any) {
        console.error("🔴 [STORE] Error deleting purchase:", error);
        if (error.response?.status !== 404) {
          console.error("Delete error details:", error.response?.data);
          toast.error("Failed to delete draft");
        }
      }
    }

    // Reset all state
    setSelectedSupplier(null);
    setItems([]);
    setInvoiceNumber("");
    setInvoiceDate(format(new Date(), "yyyy-MM-dd"));
    setPlaceOfSupply("");
    setReverseCharge("No");
    setPurchaseId(undefined);
    setPurchaseData(null);
    setIsCreating(false);
    setIsLoading(false);
    localStorage.removeItem(PURCHASE_SESSION_KEY);

    toast.success("New purchase session started");
  }, [purchaseId]);

  // Update supplier
  const updateSupplier = useCallback(
    async (supplier: Supplier | null) => {
      if (purchaseId && items && items.length === 0) {
        try {
          await deletePurchase(purchaseId);
        } catch (error) {
          console.error("🔴 [STORE] Error deleting previous purchase:", error);
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
    },
    [purchaseId, items],
  );

  // Scan barcode to add product
  const scanBarcode = useCallback(
    async (barcode: string, quantity: number = 1, productId?: string) => {
      if (!purchaseId) {
        toast.error("Please complete all supplier details first");
        return false;
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
          productId,
        });

        if (productId) {
          if (response.success && response.data) {
            setItems(response.data.items);
            setPurchaseData(response.data);
            setIsLoading(false);
            return true;
          }
          setIsLoading(false);
          return false;
        }

        if (response.multiple) {
          setIsLoading(false);
          return response;
        }

        // Single product added successfully
        if (response.success && response.data) {
          setItems(response.data.items);
          setPurchaseData(response.data);
          setIsLoading(false);
          return true;
        }

        setIsLoading(false);
        return false;
      } catch (error: any) {
        console.error("🔴 [STORE] Error adding product:", error);

        if (error.response?.data?.multiple) {
          setIsLoading(false);
          return error.response.data;
        }

        toast.error(error.response?.data?.message || "Failed to add product");
        setIsLoading(false);
        return false;
      }
    },
    [purchaseId],
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

  // Complete purchase
  const completePurchaseInvoice = useCallback(async (): Promise<boolean> => {
    if (!purchaseId) {
      toast.error("No active purchase session");
      return false;
    }

    if (!items || items.length === 0) {
      toast.error("No items in purchase invoice");
      return false;
    }
    if (!invoiceNumber || !invoiceNumber.trim()) {
      toast.error("Please enter invoice number");
      return false;
    }

    if (!placeOfSupply || !placeOfSupply.trim()) {
      toast.error("Please enter place of supply");
      return false;
    }

    if (!invoiceDate) {
      toast.error("Please select invoice date");
      return false;
    }

    if (!reverseCharge) {
      toast.error("Please select reverse charge");
      return false;
    }

    setIsLoading(true);
    try {
      const response = await completePurchase(purchaseId);
      if (response.success) {
        toast.success("Purchase invoice completed successfully");

        // Clear session after completion
        setSelectedSupplier(null);
        setItems([]);
        setInvoiceNumber("");
        setInvoiceDate(format(new Date(), "yyyy-MM-dd"));
        setPlaceOfSupply("");
        setReverseCharge("No");
        setPurchaseId(undefined);
        setPurchaseData(null);
        localStorage.removeItem(PURCHASE_SESSION_KEY);

        return true;
      }
      return false;
    } catch (error: any) {
      console.error("🔴 [STORE] Error completing purchase:", error);
      toast.error(
        error.response?.data?.message || "Failed to complete purchase",
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [
    purchaseId,
    items,
    invoiceNumber,
    invoiceDate,
    placeOfSupply,
    reverseCharge,
  ]);

  // Calculate totals
  const totals = {
    subTotal:
      items?.reduce(
        (sum, item) => sum + item.purchasePrice * item.quantity,
        0,
      ) || 0,
    totalTax: items?.reduce((sum, item) => sum + item.taxAmount, 0) || 0,
    grandTotal: items?.reduce((sum, item) => sum + item.totalAmount, 0) || 0,
  };

  return {
    selectedSupplier,
    items: items || [],
    invoiceNumber,
    invoiceDate,
    placeOfSupply,
    reverseCharge,
    purchaseId,
    isLoaded,
    isLoading,
    purchaseData,
    totals,
    setSelectedSupplier: updateSupplier,
    setInvoiceNumber,
    setInvoiceDate,
    setPlaceOfSupply,
    setReverseCharge,
    scanBarcode,
    updateQuantity,
    removeProduct,
    completePurchaseInvoice,
    clearSession,
  };
};
