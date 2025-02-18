"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

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

interface UserSelectorProps {
  departmentId: string;
  departmentUsers: UserDepartment[];
  onUpdate: () => void;
}

export function UserSelector({
  departmentId,
  departmentUsers,
  onUpdate,
}: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    // Initialize selected users from props
    setSelectedUsers(new Set(departmentUsers.map((du) => du.user.id)));
  }, [departmentUsers]);

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

  const toggleUser = (userId: string, checked: boolean) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    try {
      // Get current user IDs
      const currentUsers = new Set(departmentUsers.map((du) => du.user.id));

      // Find users to add and remove
      const toAdd = [...selectedUsers].filter((id) => !currentUsers.has(id));
      const toRemove = [...currentUsers].filter((id) => !selectedUsers.has(id));

      // Make API calls for all changes
      const promises = [
        ...toAdd.map((userId) =>
          fetch(`/api/users/${userId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ departmentId, action: "add" }),
          })
        ),
        ...toRemove.map((userId) =>
          fetch(`/api/users/${userId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ departmentId, action: "remove" }),
          })
        ),
      ];

      await Promise.all(promises);

      toast({
        title: "Success",
        description: "Users updated successfully",
      });
      onUpdate();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      {users.map((user) => (
        <div key={user.id} className="flex items-start space-x-3 space-y-0">
          <Checkbox
            id={user.id}
            checked={selectedUsers.has(user.id)}
            onCheckedChange={(checked) => {
              if (typeof checked === "boolean") {
                toggleUser(user.id, checked);
              }
            }}
          />
          <div className="space-y-1 leading-none">
            <Label
              htmlFor={user.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {user.email}
            </Label>
            <p className="text-sm text-muted-foreground">
              {user.name} ({user.role})
            </p>
          </div>
        </div>
      ))}
      <Button onClick={handleSubmit} className="w-full">
        Save Changes
      </Button>
    </div>
  );
}
