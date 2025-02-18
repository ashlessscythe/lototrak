"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface Department {
  id: string;
  name: string;
  company: {
    name: string;
  };
  isDefault: boolean;
}

interface UserDepartment {
  department: Department;
  assignedAt: string;
}

interface DepartmentSelectorProps {
  userId: string;
  userDepartments: UserDepartment[];
  onUpdate: () => void;
}

export function DepartmentSelector({
  userId,
  userDepartments,
  onUpdate,
}: DepartmentSelectorProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepts, setSelectedDepts] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDepartments();
    // Initialize selected departments from props
    setSelectedDepts(new Set(userDepartments.map((ud) => ud.department.id)));
  }, [userDepartments]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/admin/departments");
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch departments",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDepartment = (deptId: string, checked: boolean) => {
    setSelectedDepts((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(deptId);
      } else {
        newSet.delete(deptId);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    try {
      // Get current department IDs
      const currentDepts = new Set(
        userDepartments.map((ud) => ud.department.id)
      );

      // Find departments to add and remove
      const toAdd = [...selectedDepts].filter((id) => !currentDepts.has(id));
      const toRemove = [...currentDepts].filter((id) => !selectedDepts.has(id));

      // Make API calls for all changes
      const promises = [
        ...toAdd.map((deptId) =>
          fetch(`/api/users/${userId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ departmentId: deptId, action: "add" }),
          })
        ),
        ...toRemove.map((deptId) =>
          fetch(`/api/users/${userId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ departmentId: deptId, action: "remove" }),
          })
        ),
      ];

      await Promise.all(promises);

      toast({
        title: "Success",
        description: "Departments updated successfully",
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
    return <div>Loading departments...</div>;
  }

  return (
    <div className="space-y-6">
      {departments.map((dept) => (
        <div key={dept.id} className="flex items-start space-x-3 space-y-0">
          <Checkbox
            id={dept.id}
            checked={selectedDepts.has(dept.id)}
            onCheckedChange={(checked) => {
              if (typeof checked === "boolean") {
                toggleDepartment(dept.id, checked);
              }
            }}
          />
          <div className="space-y-1 leading-none">
            <Label
              htmlFor={dept.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {dept.company.name} / {dept.name}
            </Label>
            {dept.isDefault && (
              <p className="text-sm text-muted-foreground">
                Default department
              </p>
            )}
          </div>
        </div>
      ))}
      <Button onClick={handleSubmit} className="w-full">
        Save Changes
      </Button>
    </div>
  );
}
