// app/invoice/[invoiceNumber]/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Loader2, AlertCircle, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getPublicInvoice, PublicInvoice } from "@/lib/api/public";

export default function PublicInvoicePage() {
  const params = useParams();
  const invoiceNumber = params.invoiceNumber as string;
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<PublicInvoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

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

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    setDownloading(true);
    try {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Invoice_${invoice?.invoiceNumber || "download"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try printing instead.");
    } finally {
      setDownloading(false);
    }
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
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

  // Group items by tax rate
  const itemsByTax = invoice.items.reduce((acc: any, item) => {
    const totalAmount = item.price * item.quantity;
    const taxableAmt = totalAmount / (1 + item.taxPercent / 100);
    const taxAmount = totalAmount - taxableAmt;

    if (!acc[item.taxPercent]) {
      acc[item.taxPercent] = {
        rate: item.taxPercent,
        taxableAmt: 0,
        cgst: 0,
        sgst: 0,
      };
    }

    acc[item.taxPercent].taxableAmt += taxableAmt;
    acc[item.taxPercent].cgst += taxAmount / 2;
    acc[item.taxPercent].sgst += taxAmount / 2;

    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto">
        {/* Action Buttons */}
        <div className="text-right mb-4 print:hidden space-x-2">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownloadPDF} disabled={downloading}>
            {downloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download PDF
          </Button>
        </div>

        {/* Invoice Card */}
        <div ref={invoiceRef}>
          <Card className="print:shadow-none">
            <CardContent className="p-6 md:p-8 print:p-4">
              {/* Header */}
              <div className="text-center mb-6 border-b pb-6">
                <h1 className="text-2xl font-bold">TAX INVOICE</h1>
                <p className="text-lg font-semibold mt-2">
                  {invoice.branchId?.branchName}
                </p>
                <p className="text-sm text-gray-600">
                  {invoice.branchId?.address}, {invoice.branchId?.city},{" "}
                  {invoice.branchId?.state} - {invoice.branchId?.pincode}
                </p>
                <p className="text-sm text-gray-600">
                  Phone: {invoice.branchId?.branchPhoneNumber}
                </p>
                <p className="text-sm font-medium mt-1">
                  GST: {invoice.branchId?.branchGstNumber}
                </p>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm">
                    <span className="font-semibold">Invoice No:</span>{" "}
                    {invoice.invoiceNumber}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Invoice Date:</span>{" "}
                    {format(
                      new Date(invoice.createdAt),
                      "dd MMM yyyy, hh:mm a",
                    )}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Payment Mode:</span>{" "}
                    {invoice.paymentMode || "N/A"}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Payment Status:</span>
                    <Badge
                      className={`ml-2 ${
                        invoice.paymentStatus === "Paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {invoice.paymentStatus || "Pending"}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Customer Details:</p>
                  <p className="text-sm">Name: {invoice.customerId?.name}</p>
                  <p className="text-sm">
                    Mobile: {invoice.customerId?.mobile}
                  </p>
                  {invoice.customerId?.email && (
                    <p className="text-sm">
                      Email: {invoice.customerId?.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2">Sl No.</th>
                      <th className="text-left py-2">Product</th>
                      <th className="text-center py-2">Qty</th>
                      <th className="text-center py-2">Unit</th>
                      <th className="text-right py-2">Price</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-2">{index + 1}</td>
                        <td className="py-2">
                          {item.productName}
                          <div className="text-xs text-gray-500">
                            Code: {item.itemCode}
                          </div>
                        </td>
                        <td className="text-center py-2">{item.quantity}</td>
                        <td className="text-center py-2">Pcs.</td>
                        <td className="text-right py-2">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="text-right py-2">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tax Table */}
              {Object.keys(itemsByTax).length > 0 && (
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-2">Tax Rate</th>
                        <th className="text-right py-2">Taxable Amt.</th>
                        <th className="text-right py-2">CGST</th>
                        <th className="text-right py-2">SGST</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(itemsByTax).map((item: any, index) => (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="py-2">{item.rate}%</td>
                          <td className="text-right py-2">
                            {formatCurrency(item.taxableAmt)}
                          </td>
                          <td className="text-right py-2">
                            {formatCurrency(item.cgst)}
                          </td>
                          <td className="text-right py-2">
                            {formatCurrency(item.sgst)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Summary */}
              <div className="border-t-2 border-gray-300 pt-4">
                <div className="space-y-1 text-right">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">Base Amount:</span>
                    <span>{formatCurrency(invoice.subTotal)}</span>
                  </div>

                  {invoice.discountAmount && invoice.discountAmount > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold">Discount:</span>
                        <span className="text-red-600">
                          -{formatCurrency(invoice.discountAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold">
                          Amount after Discount:
                        </span>
                        <span>{formatCurrency(amountAfterDiscount)}</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">Total Tax:</span>
                    <span>{formatCurrency(invoice.totalTax)}</span>
                  </div>

                  {invoice.freightCharge && invoice.freightCharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">Freight Charge:</span>
                      <span className="text-blue-600">
                        +{formatCurrency(invoice.freightCharge)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">Grand Total:</span>
                    <span>{formatCurrency(finalTotal)}</span>
                  </div>

                  {roundOffAmount !== 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">Rounded Off:</span>
                      <span
                        className={
                          roundOffAmount > 0 ? "text-blue-600" : "text-red-600"
                        }
                      >
                        {roundOffAmount > 0
                          ? `+${formatCurrency(roundOffAmount)}`
                          : `-${formatCurrency(Math.abs(roundOffAmount))}`}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span>NET PAYABLE:</span>
                    <span className="text-green-600">
                      {formatCurrency(roundedGrandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount in Words */}
              <div className="mt-6 pt-4 border-t text-center">
                <p className="text-sm font-semibold">Amount in Words:</p>
                <p className="text-sm">
                  {numberToWords(roundedGrandTotal)} Only
                </p>
              </div>

              {/* Footer */}
              <div className="mt-8 text-center text-sm text-gray-500 border-t pt-4">
                <p>Thank you for your business!</p>
                <p className="text-xs mt-1">
                  This is a computer generated invoice.
                </p>
              </div>
            </CardContent>
          </Card>
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
