"use client";

import { useState, useEffect } from "react";
import BranchForm, { BranchFormData } from "@/components/forms/BranchForm";
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
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Building2,
  Users,
  MapPin,
  Globe,
  Clock,
} from "lucide-react";
import { useBranches } from "@/lib/hooks/useBranches";
import { getUsersByBranch } from "@/lib/api/users";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Branch } from "@/types";

interface BranchWithUserCount extends Branch {
  userCount: number;
  isLoadingUsers?: boolean;
}

export default function BranchesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] =
    useState<BranchWithUserCount | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchesWithCount, setBranchesWithCount] = useState<
    BranchWithUserCount[]
  >([]);
  const router = useRouter();

  const { branches, isLoading, createBranch, updateBranch, deleteBranch } =
    useBranches();

  // Fetch user counts for each branch
  useEffect(() => {
    const fetchUserCounts = async () => {
      if (!branches.length) return;

      const updatedBranches = await Promise.all(
        branches.map(async (branch) => {
          try {
            const response = await getUsersByBranch(branch._id);
            return {
              ...branch,
              userCount: response.count || 0,
              isLoadingUsers: false,
            };
          } catch (error) {
            console.error(
              `Error fetching users for branch ${branch._id}:`,
              error,
            );
            return {
              ...branch,
              userCount: 0,
              isLoadingUsers: false,
            };
          }
        }),
      );

      setBranchesWithCount(updatedBranches);
    };

    fetchUserCounts();
  }, [branches]);

  // Filter branches based on search
  const filteredBranches = branchesWithCount.filter(
    (branch) =>
      branch.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.branchCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.state.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Calculate total users across all branches
  const totalUsers = branchesWithCount.reduce(
    (sum, branch) => sum + (branch.userCount || 0),
    0,
  );

  // Handle create branch
  const handleCreateBranch = async (data: BranchFormData) => {
    const result = await createBranch(data);
    if (result?.success) {
      setIsCreateOpen(false);
    }
  };

  // Handle update branch
  const handleUpdateBranch = async (data: BranchFormData) => {
    if (!selectedBranch) return;
    const result = await updateBranch(selectedBranch._id, data);
    if (result?.success) {
      setIsEditOpen(false);
      setSelectedBranch(null);
    }
  };

  // Handle delete branch
  const handleDeleteBranch = async () => {
    if (!selectedBranch) return;

    // Check if branch has users
    if (selectedBranch.userCount > 0) {
      toast.error(
        `Cannot delete branch with ${selectedBranch.userCount} users. Please move or delete users first.`,
      );
      setIsDeleteOpen(false);
      setSelectedBranch(null);
      return;
    }

    const result = await deleteBranch(selectedBranch._id);
    if (result?.success) {
      setIsDeleteOpen(false);
      setSelectedBranch(null);
    }
  };

  // Open edit dialog
  const openEditDialog = (branch: BranchWithUserCount) => {
    setSelectedBranch(branch);
    setIsEditOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (branch: BranchWithUserCount) => {
    setSelectedBranch(branch);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Branches</h1>
          <p className="text-gray-500">
            Manage your business branches and users
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Branch
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Branches
                </p>
                <p className="text-3xl font-bold">{branches.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Users Across Branches
                </p>
                <p className="text-3xl font-bold">{totalUsers}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search branches by name, code, city, or state..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Branches Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredBranches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg mb-2">No branches found</p>
            <p className="text-gray-400 text-sm">
              {searchTerm
                ? "Try a different search term"
                : "Click the button above to add your first branch"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBranches.map((branch) => (
            <Card
              key={branch._id}
              className="hover:shadow-lg transition-shadow h-full flex flex-col"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {branch.branchName}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      GST: {branch.branchGstNumber}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {branch.branchCode}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 flex-1">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                  <span>
                    {branch.address}, {branch.city}, {branch.state},{" "}
                    {branch.country} - {branch.pincode}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{branch.timeZone}</span>
                </div>

                {/* User Count Section - Clickable to manage users */}
                <Link
                  href={`/admin/branches/${branch._id}`}
                  className="block mt-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        Users in this branch
                      </span>
                    </div>
                    {branch.isLoadingUsers ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : (
                      <Badge variant="secondary">
                        {branch.userCount}{" "}
                        {branch.userCount === 1 ? "user" : "users"}
                      </Badge>
                    )}
                  </div>
                </Link>

                <p className="text-xs text-gray-400 pt-2">
                  Created: {format(new Date(branch.createdAt), "dd MMM yyyy")}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center mt-auto">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => router.push(`/admin/branches/${branch._id}`)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Building2 className="w-4 h-4 mr-1" />
                  Manage Branch
                </Button>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(branch)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteDialog(branch)}
                    disabled={branch.userCount > 0}
                    title={
                      branch.userCount > 0
                        ? "Cannot delete branch with users"
                        : ""
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Branch Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Branch</DialogTitle>
          </DialogHeader>
          <BranchForm
            onSubmit={handleCreateBranch}
            isLoading={isLoading}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Branch Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
          </DialogHeader>
          {selectedBranch && (
            <BranchForm
              initialData={selectedBranch}
              onSubmit={handleUpdateBranch}
              isLoading={isLoading}
              onCancel={() => {
                setIsEditOpen(false);
                setSelectedBranch(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedBranch?.userCount && selectedBranch.userCount > 0
                ? "Cannot Delete Branch"
                : "Are you sure?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedBranch?.userCount && selectedBranch.userCount > 0 ? (
                <span className="text-red-600">
                  This branch has{" "}
                  <span className="font-bold">{selectedBranch.userCount}</span>{" "}
                  users. Please move or delete these users before deleting the
                  branch.
                </span>
              ) : (
                <>
                  This action cannot be undone. This will permanently delete the
                  branch "
                  <span className="font-semibold">
                    {selectedBranch?.branchName}
                  </span>
                  " and remove all associated data.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedBranch(null)}>
              {selectedBranch?.userCount && selectedBranch.userCount > 0
                ? "OK"
                : "Cancel"}
            </AlertDialogCancel>
            {(!selectedBranch?.userCount || selectedBranch.userCount === 0) && (
              <AlertDialogAction
                onClick={handleDeleteBranch}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
