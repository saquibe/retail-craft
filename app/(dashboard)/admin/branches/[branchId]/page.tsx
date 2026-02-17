"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBranches } from "@/lib/hooks/useBranches";
import {
  getUsersByBranch,
  createUser,
  updateUser,
  deleteUser,
  User,
} from "@/lib/api/users";
import UserForm, { UserFormData } from "@/components/forms/UserForm";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Mail,
  User as UserIcon,
  Building2,
  MapPin,
  Globe,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function BranchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const branchId = params.branchId as string;

  const [branch, setBranch] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("users");

  const { branches } = useBranches();

  // Load branch details
  useEffect(() => {
    if (branches.length > 0) {
      const foundBranch = branches.find((b) => b._id === branchId);
      if (foundBranch) {
        setBranch(foundBranch);
      } else {
        toast.error("Branch not found");
        router.push("/admin/branches");
      }
    }
  }, [branches, branchId, router]);

  // Fetch users for this branch
  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await getUsersByBranch(branchId);
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Fetch users error:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoadingUsers(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (branchId) {
      fetchUsers();
    }
  }, [branchId]);

  // Filter users based on search
  const filteredUsers = users.filter((user) => {
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Handle create user
  const handleCreateUser = async (data: UserFormData) => {
    try {
      const response = await createUser(branchId, data);
      if (response.success) {
        toast.success(
          "User created successfully! An email has been sent with login credentials.",
        );
        setIsCreateOpen(false);
        fetchUsers();
      }
    } catch (error: any) {
      console.error("Create user error:", error);
      toast.error(error.response?.data?.message || "Failed to create user");
    }
  };

  // Handle update user
  const handleUpdateUser = async (data: UserFormData) => {
    if (!selectedUser) return;

    try {
      const response = await updateUser(selectedUser._id, data);
      if (response.success) {
        toast.success("User updated successfully!");
        setIsEditOpen(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error: any) {
      console.error("Update user error:", error);
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await deleteUser(selectedUser._id);
      if (response.success) {
        toast.success("User deleted successfully!");
        setIsDeleteOpen(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error: any) {
      console.error("Delete user error:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  if (isLoading || !branch) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/branches")}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Branches
        </Button>
      </div>

      {/* Branch Details Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold">{branch.branchName}</h1>
                <Badge variant="outline" className="bg-white">
                  Code: {branch.branchCode}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>
                    {branch.address}, {branch.city}, {branch.state} -{" "}
                    {branch.pincode}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span>{branch.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{branch.timeZone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">GST:</span>
                  <span className="font-mono text-xs">
                    {branch.branchGstNumber}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {users.length}
                </p>
                <p className="text-xs text-gray-500">Total Users</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="details">Branch Details</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Users Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold">Branch Users</h2>
              <p className="text-sm text-gray-500">
                Manage users assigned to this branch
              </p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add User to Branch
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Users Grid */}
          {isLoadingUsers ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UserIcon className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg mb-2">No users found</p>
                <p className="text-gray-400 text-sm">
                  {searchTerm
                    ? "Try a different search term"
                    : "Click the button above to add your first user to this branch"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <Card
                  key={user._id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-gray-500" />
                          {user.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-400">
                      Joined: {format(new Date(user.createdAt), "dd MMM yyyy")}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
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
                        setSelectedUser(user);
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
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Branch Information</CardTitle>
              <CardDescription>
                Detailed information about this branch
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Branch Name
                  </p>
                  <p className="mt-1">{branch.branchName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Branch Code
                  </p>
                  <p className="mt-1">{branch.branchCode}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    GST Number
                  </p>
                  <p className="mt-1">{branch.branchGstNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Time Zone</p>
                  <p className="mt-1">{branch.timeZone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="mt-1">{branch.address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">City</p>
                  <p className="mt-1">{branch.city}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">State</p>
                  <p className="mt-1">{branch.state}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Country</p>
                  <p className="mt-1">{branch.country}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Pincode</p>
                  <p className="mt-1">{branch.pincode}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p className="mt-1">
                    {format(new Date(branch.createdAt), "dd MMM yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Last Updated
                  </p>
                  <p className="mt-1">
                    {format(new Date(branch.updatedAt), "dd MMM yyyy")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create User Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add User to {branch.branchName}</DialogTitle>
          </DialogHeader>
          <UserForm
            onSubmit={handleCreateUser}
            isLoading={isLoadingUsers}
            onCancel={() => setIsCreateOpen(false)}
            branchName={branch.branchName}
          />
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserForm
              initialData={{
                name: selectedUser.name,
                email: selectedUser.email,
              }}
              onSubmit={handleUpdateUser}
              isLoading={isLoadingUsers}
              onCancel={() => {
                setIsEditOpen(false);
                setSelectedUser(null);
              }}
              branchName={branch.branchName}
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
              user "{selectedUser?.name}" from {branch.branchName}. An email
              notification will be sent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
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
