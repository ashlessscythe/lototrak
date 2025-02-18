"use client";

import { useState, useEffect } from "react";
import { UserSelector } from "@/components/user-selector";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Company {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface UserDepartment {
  user: User;
  assignedAt: string;
}

interface Department {
  id: string;
  name: string;
  description: string | null;
  companyId: string;
  isDefault: boolean;
  company: Company;
  users: UserDepartment[];
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isManageUsersDialogOpen, setIsManageUsersDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    companyId: "",
  });
  const { toast } = useToast();

  const loadCompanies = async () => {
    try {
      const response = await fetch("/api/admin/companies");
      if (!response.ok) throw new Error("Failed to load companies");
      const data = await response.json();
      setCompanies(data);

      // Set default company in form if available
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, companyId: data[0].id }));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive",
      });
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await fetch("/api/admin/departments");
      if (!response.ok) throw new Error("Failed to load departments");
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load departments",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to create department");

      setIsAddDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        companyId: companies[0]?.id || "",
      });
      loadDepartments();
      toast({
        title: "Success",
        description: "Department created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create department",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartment) return;

    try {
      const response = await fetch(
        `/api/admin/departments/${selectedDepartment.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) throw new Error("Failed to update department");

      setIsEditDialogOpen(false);
      setSelectedDepartment(null);
      setFormData({
        name: "",
        description: "",
        companyId: companies[0]?.id || "",
      });
      loadDepartments();
      toast({
        title: "Success",
        description: "Department updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update department",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return;

    try {
      const response = await fetch(`/api/admin/departments/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete department");

      loadDepartments();
      toast({
        title: "Success",
        description: "Department deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete department",
        variant: "destructive",
      });
    }
  };

  // Load data on mount
  useEffect(() => {
    loadCompanies();
    loadDepartments();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Departments</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Department</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="company">Company</Label>
                <select
                  id="company"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.companyId}
                  onChange={(e) =>
                    setFormData({ ...formData, companyId: e.target.value })
                  }
                  required
                >
                  <option value="">Select a company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <Button type="submit">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.map((dept) => (
            <TableRow key={dept.id}>
              <TableCell>{dept.name}</TableCell>
              <TableCell>{dept.company.name}</TableCell>
              <TableCell>{dept.description}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDepartment(dept);
                      setFormData({
                        name: dept.name,
                        description: dept.description || "",
                        companyId: dept.companyId,
                      });
                      setIsEditDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDepartment(dept);
                      setIsManageUsersDialogOpen(true);
                    }}
                  >
                    Manage Users
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(dept.id)}
                    disabled={dept.isDefault}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit-company">Company</Label>
              <select
                id="edit-company"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.companyId}
                onChange={(e) =>
                  setFormData({ ...formData, companyId: e.target.value })
                }
                required
              >
                <option value="">Select a company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <Button type="submit">Update</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isManageUsersDialogOpen}
        onOpenChange={setIsManageUsersDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Department Users</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedDepartment && (
              <UserSelector
                departmentId={selectedDepartment.id}
                departmentUsers={selectedDepartment.users}
                onUpdate={() => {
                  loadDepartments();
                  setIsManageUsersDialogOpen(false);
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
