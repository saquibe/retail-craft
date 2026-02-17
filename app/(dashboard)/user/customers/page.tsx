"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  Customer,
  CreateCustomerData,
} from "@/lib/api/customers";
import CustomerForm, {
  CustomerFormData,
} from "@/components/forms/CustomerForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function CustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "B2B" | "B2C">("all");

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await getCustomers();
      if (response.success && response.data) {
        setCustomers(response.data);
      }
    } catch (error) {
      console.error("Fetch customers error:", error);
      toast.error("Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers based on type and search
  const filteredCustomers = customers.filter((customer: Customer) => {
    const matchesType =
      filterType === "all" || customer.customerType === filterType;
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.mobile?.includes(searchTerm) ||
      customer.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.customerType === "B2B" &&
        customer.companyName?.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesType && matchesSearch;
  });

  // Handle create customer
  const handleCreateCustomer = async (data: CustomerFormData) => {
    try {
      const response = await createCustomer(data as any);
      if (response.success) {
        toast.success("Customer created successfully!");
        setIsCreateOpen(false);
        fetchCustomers();
      }
    } catch (error: any) {
      console.error("Create customer error:", error);
      toast.error(error.response?.data?.message || "Failed to create customer");
    }
  };

  // Handle update customer
  const handleUpdateCustomer = async (data: CustomerFormData) => {
    if (!selectedCustomer) return;

    try {
      const response = await updateCustomer(selectedCustomer._id, data as any);
      if (response.success) {
        toast.success("Customer updated successfully!");
        setIsEditOpen(false);
        setSelectedCustomer(null);
        fetchCustomers();
      }
    } catch (error: any) {
      console.error("Update customer error:", error);
      toast.error(error.response?.data?.message || "Failed to update customer");
    }
  };

  // Handle delete customer
  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      const response = await deleteCustomer(selectedCustomer._id);
      if (response.success) {
        toast.success("Customer deleted successfully!");
        setIsDeleteOpen(false);
        setSelectedCustomer(null);
        fetchCustomers();
      }
    } catch (error: any) {
      console.error("Delete customer error:", error);
      toast.error(error.response?.data?.message || "Failed to delete customer");
    }
  };

  // Get customer type badge color
  const getTypeBadge = (type: string) => {
    return type === "B2B"
      ? "bg-purple-100 text-purple-800"
      : "bg-green-100 text-green-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-gray-500">Manage your B2B and B2C customers</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs
          value={filterType}
          onValueChange={(v: string) =>
            setFilterType(v as "all" | "B2B" | "B2C")
          }
          className="w-full sm:w-auto"
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="B2B">B2B</TabsTrigger>
            <TabsTrigger value="B2C">B2C</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search customers by name, email, phone, city..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="pl-10"
          />
        </div>
      </div>

      {/* Customers Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg mb-2">No customers found</p>
            <p className="text-gray-400 text-sm">
              {searchTerm || filterType !== "all"
                ? "Try adjusting your filters"
                : "Click the button above to add your first customer"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer: Customer) => (
            <Card
              key={customer._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {customer.customerType === "B2B" ? (
                      <Building2 className="w-5 h-5 text-purple-600" />
                    ) : (
                      <User className="w-5 h-5 text-green-600" />
                    )}
                    <div>
                      <CardTitle className="text-lg">{customer.name}</CardTitle>
                      <Badge className={getTypeBadge(customer.customerType)}>
                        {customer.customerType}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Contact Info */}
                <div className="space-y-2">
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{customer.email}</span>
                    </div>
                  )}
                  {customer.mobile && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{customer.mobile}</span>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>
                    {customer.city}, {customer.state}, {customer.country}
                  </span>
                </div>

                {/* B2B Specific Info */}
                {customer.customerType === "B2B" && customer.companyName && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">
                        {customer.companyName}
                      </span>
                    </div>
                    {customer.gstIn && (
                      <p className="text-xs text-gray-500 mt-1">
                        GST: {customer.gstIn}
                      </p>
                    )}
                  </div>
                )}

                <p className="text-xs text-gray-400">
                  Added: {format(new Date(customer.createdAt), "dd MMM yyyy")}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setIsEditOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setIsDeleteOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Customer Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm
            onSubmit={handleCreateCustomer}
            isLoading={isLoading}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <CustomerForm
              initialData={{
                customerType: selectedCustomer.customerType,
                name: selectedCustomer.name,
                email: selectedCustomer.email,
                mobile: selectedCustomer.mobile,
                country: selectedCustomer.country,
                state: selectedCustomer.state,
                city: selectedCustomer.city,
                ...(selectedCustomer.customerType === "B2B" && {
                  companyName: selectedCustomer.companyName,
                  GstRegistrationType: selectedCustomer.GstRegistrationType,
                  gstIn: selectedCustomer.gstIn,
                  contactName: selectedCustomer.contactName,
                  contactNumber: selectedCustomer.contactNumber,
                  contactEmail: selectedCustomer.contactEmail,
                }),
              }}
              onSubmit={handleUpdateCustomer}
              isLoading={isLoading}
              onCancel={() => {
                setIsEditOpen(false);
                setSelectedCustomer(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              customer "{selectedCustomer?.name}" and remove all associated
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedCustomer(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCustomer}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
