"use client";

export const dynamic = "force-dynamic";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Role, User } from "@/lib/types";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch users",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: Role) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User role updated successfully",
        });
        fetchUsers(); // Refresh the users list
      } else {
        throw new Error("Failed to update user role");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user role",
      });
    }
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return "text-red-600 dark:text-red-400";
      case "SUPERVISOR":
        return "text-blue-600 dark:text-blue-400";
      case "USER":
        return "text-green-600 dark:text-green-400";
      case "PENDING":
        return "text-yellow-600 dark:text-yellow-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const roleOptions: Role[] = ["USER", "SUPERVISOR", "ADMIN", "PENDING"];

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user roles and approve pending accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center">Loading users...</div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm ${getRoleColor(user.role)}`}>
                        Current: {user.role}
                      </span>
                      <Select
                        defaultValue={user.role}
                        onValueChange={(value: Role) =>
                          updateUserRole(user.id, value)
                        }
                      >
                        <SelectTrigger className="w-[140px] bg-background text-foreground border border-border rounded-md shadow-sm">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent className="bg-background text-foreground border border-border rounded-md shadow-lg">
                          {roleOptions.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
