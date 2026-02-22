"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

type CustomerType = "B2B" | "B2C";

type Product = {
  id: string;
  name: string;
  stock: number;
  tax: number;
  b2bPrice: number;
  b2cPrice: number;
};

type BillingItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  tax: number;
};

export default function BillingPage() {
  const [customerName, setCustomerName] = useState("");
  const [customerType, setCustomerType] = useState<CustomerType>("B2C");
  const [items, setItems] = useState<BillingItem[]>([]);

  // 🔥 Replace with API later
  const products: Product[] = [
    {
      id: "1",
      name: "Shirt",
      stock: 20,
      tax: 5,
      b2bPrice: 400,
      b2cPrice: 500,
    },
    {
      id: "2",
      name: "Jeans",
      stock: 15,
      tax: 12,
      b2bPrice: 800,
      b2cPrice: 1000,
    },
  ];

  const addProduct = (product: Product) => {
    const price = customerType === "B2B" ? product.b2bPrice : product.b2cPrice;

    const existing = items.find((i) => i.productId === product.id);

    if (existing) {
      setItems(
        items.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      );
    } else {
      setItems([
        ...items,
        {
          productId: product.id,
          name: product.name,
          price,
          quantity: 1,
          tax: product.tax,
        },
      ]);
    }
  };

  const updateQuantity = (id: string, qty: number) => {
    setItems(
      items.map((i) => (i.productId === id ? { ...i, quantity: qty } : i)),
    );
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.productId !== id));
  };

  const subTotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );

  const taxTotal = useMemo(
    () =>
      items.reduce((sum, i) => sum + (i.price * i.quantity * i.tax) / 100, 0),
    [items],
  );

  const grandTotal = subTotal + taxTotal;

  const handlePrint = () => window.print();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Billing System</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div className="xl:col-span-2 space-y-6">
          {/* Customer Card */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />

              <Select
                value={customerType}
                onValueChange={(v) => setCustomerType(v as CustomerType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B2C">B2C</SelectItem>
                  <SelectItem value="B2B">B2B</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Product Add */}
          <Card>
            <CardHeader>
              <CardTitle>Add Products</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <Button
                  key={product.id}
                  variant="outline"
                  disabled={product.stock === 0}
                  onClick={() => addProduct(product)}
                >
                  {product.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Billing Table */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Tax</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>₹{item.price}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-20"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              item.productId,
                              Number(e.target.value),
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>{item.tax}%</TableCell>
                      <TableCell>
                        ₹
                        {(
                          item.price * item.quantity +
                          (item.price * item.quantity * item.tax) / 100
                        ).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeItem(item.productId)}
                        >
                          X
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {items.length === 0 && (
                <p className="text-muted-foreground text-sm mt-4">
                  No items added
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SIDE SUMMARY */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹{taxTotal.toFixed(2)}</span>
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>

              <Button className="w-full" onClick={handlePrint}>
                Print Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PRINT LAYOUT */}
      <div className="hidden print:block mt-10">
        <h2 className="text-xl font-bold">Retail Craft Invoice</h2>
        <p>Date: {format(new Date(), "dd MMM yyyy")}</p>
        <p>Customer: {customerName}</p>

        <Separator className="my-2" />

        {items.map((item) => (
          <div key={item.productId} className="flex justify-between">
            <span>
              {item.name} x {item.quantity}
            </span>
            <span>
              ₹
              {(
                item.price * item.quantity +
                (item.price * item.quantity * item.tax) / 100
              ).toFixed(2)}
            </span>
          </div>
        ))}

        <Separator className="my-2" />

        <div className="flex justify-between font-bold">
          <span>Grand Total</span>
          <span>₹{grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
