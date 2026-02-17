"use client";

import { useState, useEffect } from "react";
import { useBranches } from "@/lib/hooks/useBranches";
import {
  getAllUsers,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Mail,
  User as UserIcon,
  Building2,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { branches } = useBranches();

  // Fetch users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await getAllUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Fetch users error:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on branch and search
  const filteredUsers = users.filter((user) => {
    const matchesBranch =
      selectedBranchId === "all" || user.branchId._id === selectedBranchId;
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.branchId.branchName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBranch && matchesSearch;
  });

  // Handle create user
  const handleCreateUser = async (data: UserFormData) => {
    if (selectedBranchId === "all") {
      toast.error("Please select a branch first");
      return;
    }

    try {
      const response = await createUser(selectedBranchId, data);
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

  // Get branch name for display
  const getBranchName = (branchId: string) => {
    const branch = branches.find((b) => b._id === branchId);
    return branch?.branchName || "Unknown Branch";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-500">Manage users across all branches</p>
        </div>
        <Button
          onClick={() => {
            if (selectedBranchId === "all") {
              toast.error("Please select a branch first");
              return;
            }
            setIsCreateOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Branch Filter */}
        <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {branches.map((branch) => (
              <SelectItem key={branch._id} value={branch._id}>
                {branch.branchName} ({branch.branchCode})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search Bar */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search users by name, email, or branch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserIcon className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg mb-2">No users found</p>
            <p className="text-gray-400 text-sm">
              {searchTerm || selectedBranchId !== "all"
                ? "Try adjusting your filters"
                : "Click the button above to add your first user"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user._id} className="hover:shadow-lg transition-shadow">
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
              <CardContent className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-medium">Branch:</span>
                  <span className="ml-2">
                    {user.branchId?.branchName || "No Branch"}
                  </span>
                  <span className="ml-2 text-xs text-gray-400">
                    ({user.branchId?.branchCode || "N/A"})
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Created: {format(new Date(user.createdAt), "dd MMM yyyy")}
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

      {/* Create User Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <UserForm
            onSubmit={handleCreateUser}
            isLoading={isLoading}
            onCancel={() => setIsCreateOpen(false)}
            branchName={getBranchName(selectedBranchId)}
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
              isLoading={isLoading}
              onCancel={() => {
                setIsEditOpen(false);
                setSelectedUser(null);
              }}
              // branchName={selectedUser.branchId.branchName}
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
              user "{selectedUser?.name}" and remove all associated data. An
              email notification will be sent.
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
