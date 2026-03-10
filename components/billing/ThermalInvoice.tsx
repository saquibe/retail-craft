"use client";

import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { Billing } from "@/lib/api/billing";

interface ThermalInvoiceProps {
  billing: Billing;
  onPrinted?: () => void;
}

export function ThermalInvoice({ billing, onPrinted }: ThermalInvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-print when component mounts
    const printInvoice = () => {
      if (invoiceRef.current) {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          const html = `<!DOCTYPE html>
<html>
<head>
<title>Invoice ${billing.invoiceNumber}</title>
<style>
/* ensure consistent font and wrapping */
*, body, html {
  font-family: 'Arial', sans-serif;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
}
@page {
  size: 80mm auto; /* Thermal paper width */
  margin: 0;
}
body {
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 8px;
  width: 72mm; /* Slightly less than page width */
  font-size: 10px;
  line-height: 1.2;
}
.header {
  text-align: center;
  margin-bottom: 8px;
  border-bottom: 1px dashed #000;
  padding-bottom: 4px;
}
.store-name {
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
}
.store-details {
  font-size: 8px;
  margin-top: 2px;
}
.gst {
  font-size: 8px;
  font-weight: bold;
}
.invoice-title {
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  margin: 6px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  margin: 2px 0;
}
.info-label {
  font-weight: bold;
}
.items-table {
  width: 100%;
  border-collapse: collapse;
  margin: 6px 0;
  font-size: 9px;
}
.items-table th {
  text-align: left;
  border-bottom: 1px solid #000;
  padding: 2px 0;
}
.items-table td {
  padding: 2px 0;
}
.product-name {
  font-size: 8px;
  color: #333;
}
.text-right {
  text-align: right;
}
.totals {
  margin-top: 6px;
  border-top: 1px solid #000;
  padding-top: 4px;
}
.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  margin: 2px 0;
}
.grand-total {
  font-weight: bold;
  font-size: 11px;
  border-top: 1px dashed #000;
  padding-top: 4px;
  margin-top: 4px;
}
.amount-in-words {
  font-size: 8px;
  margin: 6px 0;
  padding: 4px 0;
  border-top: 1px dashed #000;
  border-bottom: 1px dashed #000;
}
.footer {
  text-align: center;
  margin-top: 10px;
  font-size: 8px;
  font-weight: bold;
}
.thank-you {
  font-size: 10px;
  margin: 8px 0;
}
.divider {
  border-top: 1px dashed #000;
  margin: 4px 0;
}
</style>
</head>
<body>
${invoiceRef.current.outerHTML}
<script>
window.onload = function() { 
  window.print(); 
  setTimeout(function() { window.close(); }, 500);
};
</script>
</body>
</html>`;

          printWindow.document.open();
          printWindow.document.write(html);
          printWindow.document.close();
        }
      }
    };

    printInvoice();
    if (onPrinted) {
      setTimeout(onPrinted, 1000);
    }
  }, [billing, onPrinted]);

  // Convert number to words (simplified version)
  const numberToWords = (num: number): string => {
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
    if (num >= 100000) {
      result += convertLessThanThousand(Math.floor(num / 100000)) + " Lakh ";
      num %= 100000;
    }
    if (num >= 1000) {
      result += convertLessThanThousand(Math.floor(num / 1000)) + " Thousand ";
      num %= 1000;
    }
    result += convertLessThanThousand(num);

    return result.trim() + " Only";
  };

  // Group items by tax rate for GST summary
  const itemsByTax = billing.items.reduce((acc, item) => {
    const taxRate = item.taxPercent / 2; // Split into CGST/SGST
    const taxableAmt = item.price * item.quantity;

    if (!acc[item.taxPercent]) {
      acc[item.taxPercent] = {
        rate: item.taxPercent,
        taxableAmt: 0,
        cgst: 0,
        sgst: 0,
        totalTax: 0,
      };
    }

    acc[item.taxPercent].taxableAmt += taxableAmt;
    acc[item.taxPercent].cgst += item.taxAmount / 2;
    acc[item.taxPercent].sgst += item.taxAmount / 2;
    acc[item.taxPercent].totalTax += item.taxAmount;

    return acc;
  }, {} as Record<number, { rate: number; taxableAmt: number; cgst: number; sgst: number; totalTax: number }>);

  return (
    <div
      ref={invoiceRef}
      className="thermal-invoice"
      style={{
        fontFamily: "Arial",
        fontSize: "10px",
        width: "72mm",
        margin: "0 auto",
        padding: "4px",
      }}
    >
      {/* Store Header */}
      <div className="header">
        <div className="store-name">
          {billing.branchId.branchName?.toUpperCase() || "N/A"}
        </div>
        <div className="store-details">
          {billing.branchId.address || "N/A"}
          <br />
          {billing.branchId.city}, {billing.branchId.state} -{" "}
          {billing.branchId.pincode}
          <br />
          Phone: {billing.branchId.branchPhoneNumber || "N/A"}
        </div>
        <div className="gst">
          GST NO: {billing.branchId.branchGstNumber || "N/A"}
        </div>
      </div>

      {/* Invoice Title */}
      <div className="invoice-title">TAX INVOICE</div>

      {/* Invoice Details */}
      <div className="info-row">
        <span className="info-label">Invoice No/Date</span>
        <span>
          {billing.invoiceNumber} /{" "}
          {format(new Date(billing.createdAt), "dd-MM-yyyy")}
        </span>
      </div>

      {/* Customer Details */}
      <div className="info-row">
        <span className="info-label">Customer Name</span>
        <span>{billing.customerId.name || "Cash"}</span>
      </div>
      {billing.customerId.mobile && (
        <div className="info-row">
          <span className="info-label">Cust Mobile No</span>
          <span>{billing.customerId.mobile}</span>
        </div>
      )}

      <div className="divider"></div>

      {/* Items Table */}
      <table className="items-table">
        <thead>
          <tr>
            <th>Product</th>
            <th className="text-right">QTY</th>
            <th className="text-right">MRP</th>
            <th className="text-right">Net Amt</th>
          </tr>
        </thead>
        <tbody>
          {billing.items.map((item, index) => (
            <tr key={index}>
              <td>
                <div>{item.productName}</div>
                <div className="product-name">{item.barCode}</div>
              </td>
              <td className="text-right">{item.quantity}</td>
              <td className="text-right">₹{item.price.toFixed(2)}</td>
              <td className="text-right">
                ₹{(item.price * item.quantity).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="divider"></div>

      {/* Amount in Words */}
      <div className="amount-in-words">
        <span className="info-label">
          Rupees {numberToWords(Math.round(billing.grandTotal))}
        </span>
      </div>

      {/* Tax Breakdown */}
      <table className="items-table">
        <thead>
          <tr>
            <th>Tax Rate</th>
            <th className="text-right">Taxable Amt.</th>
            <th className="text-right">CGST Amt.</th>
            <th className="text-right">SGST Amt.</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(itemsByTax).map((item) => (
            <tr key={item.rate}>
              <td>{item.rate}%</td>
              <td className="text-right">₹{item.taxableAmt.toFixed(2)}</td>
              <td className="text-right">₹{item.cgst.toFixed(2)}</td>
              <td className="text-right">₹{item.sgst.toFixed(2)}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={2} className="text-right info-label">
              Total GST
            </td>
            <td className="text-right">₹{billing.totalTax.toFixed(2)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>

      {/* Totals */}
      <div className="totals">
        <div className="total-row">
          <span>Subtotal</span>
          <span>₹{billing.subTotal.toFixed(2)}</span>
        </div>
        <div className="total-row">
          <span>Total Tax</span>
          <span>₹{billing.totalTax.toFixed(2)}</span>
        </div>
        <div className="grand-total total-row">
          <span>Net Payable</span>
          <span>₹{billing.grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <div className="thank-you">THANK YOU. VISIT US AGAIN.</div>
        <div style={{ fontSize: "7px", marginTop: "4px" }}>
          ** Powered by RetailCraft **
        </div>
      </div>
    </div>
  );
}
