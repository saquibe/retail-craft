"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";

interface PurchaseInvoicePrintProps {
  purchase: any;
  onPrint?: () => void;
}

export function PurchaseInvoicePrint({
  purchase,
  onPrint,
}: PurchaseInvoicePrintProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContent.outerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // Reload to restore React state
    onPrint?.();
  };

  if (!purchase) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-end print:hidden">
        <Button onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print Invoice
        </Button>
      </div>

      {/* Print Layout */}
      <div
        ref={printRef}
        className="hidden print:block p-8"
        style={{
          fontFamily: "Arial, sans-serif",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">PURCHASE INVOICE</h1>
          <p className="text-sm text-gray-600">
            {purchase.branchId?.branchName}
          </p>
          <p className="text-sm text-gray-600">
            {purchase.branchId?.address}, {purchase.branchId?.city},{" "}
            {purchase.branchId?.state} - {purchase.branchId?.pincode}
          </p>
          <p className="text-sm text-gray-600">
            GST: {purchase.branchId?.branchGstNumber}
          </p>
          <p className="text-sm text-gray-600">
            Phone: {purchase.branchId?.branchPhoneNumber}
          </p>
        </div>

        {/* Invoice Info */}
        <div className="mb-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm">
                <span className="font-bold">Invoice No:</span>{" "}
                {purchase.invoiceNumber}
              </p>
              <p className="text-sm">
                <span className="font-bold">Invoice Date:</span>{" "}
                {format(new Date(purchase.invoiceDate), "dd MMM yyyy")}
              </p>
              <p className="text-sm">
                <span className="font-bold">Place of Supply:</span>{" "}
                {purchase.placeOfSupply}
              </p>
              <p className="text-sm">
                <span className="font-bold">Reverse Charge:</span>{" "}
                {purchase.reverseCharge}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm">
                <span className="font-bold">Created:</span>{" "}
                {format(new Date(purchase.createdAt), "dd MMM yyyy, hh:mm a")}
              </p>
              <p className="text-sm">
                <span className="font-bold">Status:</span>{" "}
                <span
                  className={
                    purchase.status === "Completed"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }
                >
                  {purchase.status}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Supplier Details */}
        <div className="mb-6 p-3 bg-gray-50 rounded">
          <h2 className="font-bold mb-2">Supplier Details:</h2>
          <p className="text-sm">Name: {purchase.supplierId?.name}</p>
          <p className="text-sm">GST: {purchase.supplierId?.gstIn}</p>
          <p className="text-sm">
            Address: {purchase.supplierId?.address}, {purchase.supplierId?.city}
            , {purchase.supplierId?.state} - {purchase.supplierId?.pincode}
          </p>
          <p className="text-sm">
            Contact: {purchase.supplierId?.email} |{" "}
            {purchase.supplierId?.mobile}
          </p>
        </div>

        {/* Items Table */}
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-2">Sl No.</th>
              <th className="text-left py-2">Product</th>
              <th className="text-left py-2">Barcode</th>
              <th className="text-right py-2">Qty</th>
              <th className="text-right py-2">Price</th>
              <th className="text-right py-2">Tax %</th>
              <th className="text-right py-2">Tax Amt</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {purchase.items?.map((item: any, index: number) => (
              <tr key={item.productId} className="border-b">
                <td className="py-2">{index + 1}</td>
                <td className="py-2">{item.productName}</td>
                <td className="py-2 font-mono">{item.barCode}</td>
                <td className="text-right py-2">{item.quantity}</td>
                <td className="text-right py-2">
                  ₹{item.purchasePrice.toFixed(2)}
                </td>
                <td className="text-right py-2">{item.taxPercent}%</td>
                <td className="text-right py-2">
                  ₹{item.taxAmount.toFixed(2)}
                </td>
                <td className="text-right py-2">
                  ₹{item.totalAmount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary - Add discount */}
        <div className="text-right space-y-1 border-t-2 border-black pt-4">
          <p className="text-sm">
            <span className="font-bold inline-block w-32">Subtotal:</span>
            <span className="inline-block w-32">
              ₹{purchase.subTotal?.toFixed(2)}
            </span>
          </p>
          <p className="text-sm">
            <span className="font-bold inline-block w-32">Total Tax:</span>
            <span className="inline-block w-32">
              ₹{purchase.totalTax?.toFixed(2)}
            </span>
          </p>

          {/* ADD DISCOUNT DISPLAY */}
          {purchase.discount && purchase.discount > 0 && (
            <>
              <p className="text-sm">
                <span className="font-bold inline-block w-32">
                  Discount ({purchase.discount}%):
                </span>
                <span className="inline-block w-32 text-red-600">
                  -₹{purchase.discountAmount?.toFixed(2)}
                </span>
              </p>
              <p className="text-sm">
                <span className="font-bold inline-block w-32">
                  Final Total:
                </span>
                <span className="inline-block w-32">
                  ₹{purchase.finalTotal?.toFixed(2)}
                </span>
              </p>
            </>
          )}

          <p className="text-lg font-bold">
            <span className="inline-block w-32">Grand Total:</span>
            <span className="inline-block w-32">
              ₹{(purchase.finalTotal || purchase.grandTotal)?.toFixed(2)}
            </span>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm">
          <p className="mb-1">Goods received in good condition</p>
          <div className="flex justify-between mt-8">
            <div className="text-center">
              <p>Receiver's Signature</p>
            </div>
            <div className="text-center">
              <p>Authorised Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
