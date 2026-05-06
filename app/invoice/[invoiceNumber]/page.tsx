// app/invoice/[invoiceNumber]/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Loader2, AlertCircle, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPublicInvoice, PublicInvoice } from "@/lib/api/public";

export default function PublicInvoicePage() {
  const params = useParams();
  const invoiceNumber = params.invoiceNumber as string;
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<PublicInvoice | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invoiceNumber) {
      fetchInvoice();
    }
  }, [invoiceNumber]);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const response = await getPublicInvoice(invoiceNumber);
      if (response.success && response.data) {
        setInvoice(response.data);
      } else {
        setError(response.message || "Invoice not found");
      }
    } catch (err) {
      setError("Failed to load invoice");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Invoice Not Found
            </h2>
            <p className="text-gray-500">
              {error || "The invoice you're looking for doesn't exist."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const finalTotal = invoice.finalTotal || invoice.grandTotal;
  const roundedGrandTotal = Math.round(finalTotal);
  const roundOffAmount = roundedGrandTotal - finalTotal;
  const amountAfterDiscount =
    (invoice.subTotal || 0) - (invoice.discountAmount || 0);
  const hasDiscount = invoice.discountAmount && invoice.discountAmount > 0;
  const hasFreight = invoice.freightCharge && invoice.freightCharge > 0;
  const originalTotal = invoice.subTotal + (invoice.totalTax || 0);

  // Calculate total tax (already in invoice.totalTax)
  const totalTax = invoice.totalTax || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-3 md:py-8 md:px-4 print:bg-white print:py-0">
      <div className="max-w-5xl mx-auto">
        {/* Print Button */}
        <div className="text-right mb-4 print:hidden">
          <Button onClick={handlePrint} variant="outline" className="bg-white">
            <Printer className="w-4 h-4 mr-2" />
            Print Invoice
          </Button>
        </div>

        {/* Invoice Container */}
        <div
          ref={invoiceRef}
          className="bg-white shadow-lg rounded-lg print:shadow-none overflow-hidden"
        >
          {/* Header Section */}
          <div className="p-4 md:p-6 border-b border-gray-200">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  TAX INVOICE
                </h1>
                <div className="mt-3 text-sm text-gray-600">
                  <p>
                    <span className="font-semibold">Sold By:</span>{" "}
                    {invoice.branchId?.branchName}
                  </p>
                  <p className="text-xs mt-1">
                    {invoice.branchId?.address}, {invoice.branchId?.city},{" "}
                    {invoice.branchId?.state} - {invoice.branchId?.pincode}
                  </p>
                  <p className="text-xs">
                    GSTIN - {invoice.branchId?.branchGstNumber}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  Order ID: {invoice.invoiceNumber}
                </p>
                <p className="text-sm text-gray-500">
                  Order Date:{" "}
                  {format(new Date(invoice.createdAt), "dd-MM-yyyy")}
                </p>
                <p className="text-sm text-gray-500">
                  Invoice Date:{" "}
                  {format(new Date(invoice.createdAt), "dd-MM-yyyy")}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Details Section - Flipkart Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-gray-200">
            <div className="p-4 md:p-6 border-r border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Bill To
              </h3>
              <p className="text-sm font-medium text-gray-800">
                {invoice.customerId?.name}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {invoice.customerId?.address || "Address not available"}
              </p>
              <p className="text-xs text-gray-600">
                Phone: {invoice.customerId?.mobile}
              </p>
              {invoice.customerId?.email && (
                <p className="text-xs text-gray-600">
                  Email: {invoice.customerId?.email}
                </p>
              )}
            </div>
            <div className="p-4 md:p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Ship To
              </h3>
              <p className="text-sm font-medium text-gray-800">
                {invoice.customerId?.name}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {invoice.customerId?.address || "Address not available"}
              </p>
              <p className="text-xs text-gray-600">
                Phone: {invoice.customerId?.mobile}
              </p>
            </div>
          </div>

          {/* Items Table - Flipkart Style */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Product
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    Qty
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Gross Amount
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Discount
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Taxable Value
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    SGST
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    CGST
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => {
                  const grossAmount = item.price * item.quantity;
                  const discountPerItem = invoice.discountAmount
                    ? (invoice.discountAmount * (item.price * item.quantity)) /
                      (invoice.subTotal || 1)
                    : 0;
                  const taxableValue = grossAmount - discountPerItem;
                  const taxAmount = (taxableValue * item.taxPercent) / 100;
                  const sgst = taxAmount / 2;
                  const cgst = taxAmount / 2;
                  const total = taxableValue + taxAmount;

                  return (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-800">
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          FSN: {item.itemCode}
                        </p>
                        <p className="text-xs text-gray-500">
                          HSN/SAC: 61091000
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          SGST: {item.taxPercent}% | CGST: {item.taxPercent}%
                        </p>
                      </td>
                      <td className="text-center py-3 px-4">{item.quantity}</td>
                      <td className="text-right py-3 px-4">
                        {formatCurrency(grossAmount)}
                      </td>
                      <td className="text-right py-3 px-4 text-red-600">
                        {discountPerItem > 0
                          ? `-${formatCurrency(discountPerItem)}`
                          : "-"}
                      </td>
                      <td className="text-right py-3 px-4">
                        {formatCurrency(taxableValue)}
                      </td>
                      <td className="text-right py-3 px-4">
                        {formatCurrency(sgst)}
                      </td>
                      <td className="text-right py-3 px-4">
                        {formatCurrency(cgst)}
                      </td>
                      <td className="text-right py-3 px-4 font-medium">
                        {formatCurrency(total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-gray-200">
                {/* Handling / Freight Fee Row */}
                {hasFreight && (
                  <tr className="bg-gray-50">
                    <td
                      colSpan={7}
                      className="text-right py-2 px-4 font-medium"
                    >
                      Handling Fee:
                    </td>
                    <td className="text-right py-2 px-4 font-medium">
                      {formatCurrency(invoice.freightCharge || 0)}
                    </td>
                  </tr>
                )}
                {/* Discount Row */}
                {hasDiscount && (
                  <tr className="bg-gray-50">
                    <td
                      colSpan={7}
                      className="text-right py-2 px-4 font-medium text-red-600"
                    >
                      Discount:
                    </td>
                    <td className="text-right py-2 px-4 font-medium text-red-600">
                      -{formatCurrency(invoice.discountAmount || 0)}
                    </td>
                  </tr>
                )}
                {/* Total Row */}
                <tr className="bg-gray-100 font-semibold">
                  <td colSpan={7} className="text-right py-3 px-4 text-base">
                    Grand Total:
                  </td>
                  <td className="text-right py-3 px-4 text-base font-bold text-green-700">
                    {formatCurrency(roundedGrandTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Amount in Words */}
          <div className="p-4 md:p-6 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Amount in Words: </span>
              {numberToWords(roundedGrandTotal)} Only
            </p>
          </div>

          {/* Footer */}
          <div className="p-4 md:p-6 border-t border-gray-200 text-xs text-gray-500 space-y-2">
            <p className="font-semibold text-gray-700">Returns Policy:</p>
            <p>
              Goods once sold will not be returned or exchanged. Please check
              the product at the time of delivery.
            </p>
            <p className="mt-3">Thank you for your business!</p>
            <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-400">
                This is a computer generated invoice.
              </p>
              <p className="text-xs font-semibold text-gray-600">
                For {invoice.branchId?.branchName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to convert number to words
function numberToWords(num: number): string {
  const units = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (num === 0) return "Zero";

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return "";
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      return (
        tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + units[n % 10] : "")
      );
    }
    return (
      units[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 !== 0 ? " " + convertLessThanThousand(n % 100) : "")
    );
  };

  let result = "";
  let remainingNum = Math.round(num);

  if (remainingNum >= 100000) {
    result +=
      convertLessThanThousand(Math.floor(remainingNum / 100000)) + " Lakh ";
    remainingNum %= 100000;
  }
  if (remainingNum >= 1000) {
    result +=
      convertLessThanThousand(Math.floor(remainingNum / 1000)) + " Thousand ";
    remainingNum %= 1000;
  }
  if (remainingNum > 0) {
    result += convertLessThanThousand(remainingNum);
  }

  return result.trim();
}
