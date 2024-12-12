"use client";

import { useEffect, useState } from "react";
import { Lock, Status } from "@/lib/types";
import { useRouter } from "next/navigation";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

type LockWithAssignee = Lock & {
  assignedTo: {
    name: string | null;
    email: string;
  } | null;
};

export default function LocksPage() {
  const [locks, setLocks] = useState<LockWithAssignee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [selectedLock, setSelectedLock] = useState<LockWithAssignee | null>(
    null
  );
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    status: "AVAILABLE" as Status,
    safetyProcedures: [] as string[],
    qrCode: "", // Added QR code field
  });

  const [newProcedure, setNewProcedure] = useState("");

  useEffect(() => {
    fetchLocks();
  }, []);

  const fetchLocks = async () => {
    try {
      console.log("Fetching locks...");
      const response = await fetch("/api/admin/locks");

      if (response.status === 401) {
        console.log("Unauthorized - redirecting to login");
        router.push("/auth/signin");
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch locks:", errorText);
        throw new Error("Failed to fetch locks");
      }

      const data = await response.json();
      console.log("Fetched locks:", data);
      setLocks(data);
    } catch (error) {
      console.error("Error fetching locks:", error);
      toast({
        title: "Error",
        description: "Failed to fetch locks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/locks", {
        method: selectedLock ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          selectedLock
            ? {
                ...formData,
                id: selectedLock.id,
                safetyProcedures: formData.safetyProcedures,
              }
            : {
                ...formData,
                safetyProcedures: formData.safetyProcedures,
              }
        ),
      });

      if (response.status === 401) {
        router.push("/auth/signin");
        return;
      }

      if (!response.ok) throw new Error("Failed to save lock");

      toast({
        title: "Success",
        description: `Lock ${
          selectedLock ? "updated" : "created"
        } successfully`,
      });

      setIsDialogOpen(false);
      fetchLocks();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save lock",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/locks/${id}`, {
        method: "DELETE",
      });

      if (response.status === 401) {
        router.push("/auth/signin");
        return;
      }

      if (!response.ok) throw new Error("Failed to delete lock");

      toast({
        title: "Success",
        description: "Lock deleted successfully",
      });

      fetchLocks();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete lock",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: Status) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/locks/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.status === 401) {
        router.push("/auth/signin");
        return;
      }

      if (!response.ok) throw new Error("Failed to update status");

      toast({
        title: "Success",
        description: "Status updated successfully",
      });

      fetchLocks();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProcedure = () => {
    if (newProcedure.trim()) {
      setFormData({
        ...formData,
        safetyProcedures: [...formData.safetyProcedures, newProcedure.trim()],
      });
      setNewProcedure("");
    }
  };

  const handleRemoveProcedure = (index: number) => {
    setFormData({
      ...formData,
      safetyProcedures: formData.safetyProcedures.filter((_, i) => i !== index),
    });
  };

  const getStatusBadgeVariant = (status: Status) => {
    switch (status) {
      case "AVAILABLE":
        return "default";
      case "IN_USE":
        return "secondary";
      case "MAINTENANCE":
        return "destructive";
      case "RETIRED":
        return "outline";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="py-10">
            <div className="flex justify-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lock Management</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setSelectedLock(null);
                    setFormData({
                      name: "",
                      location: "",
                      status: "AVAILABLE",
                      safetyProcedures: [],
                      qrCode: "", // Reset QR code
                    });
                  }}
                >
                  Add New Lock
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedLock ? "Edit Lock" : "Add New Lock"}
                  </DialogTitle>
                  <DialogDescription>
                    Fill in the details below to{" "}
                    {selectedLock ? "update" : "create"} a lock.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label htmlFor="name">Name</label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="location">Location</label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="qrCode">QR Code Value (Optional)</label>
                      <Input
                        id="qrCode"
                        value={formData.qrCode}
                        onChange={(e) =>
                          setFormData({ ...formData, qrCode: e.target.value })
                        }
                        placeholder="Leave blank for auto-generated value"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="status">Status</label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: Status) =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger className="bg-background text-foreground border border-border shadow-sm rounded-md">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background text-foreground border border-border shadow-lg rounded-md">
                          {[
                            "AVAILABLE",
                            "IN_USE",
                            "MAINTENANCE",
                            "RETIRED",
                          ].map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="safetyProcedures">
                        Safety Procedures
                      </label>
                      <div className="flex gap-2">
                        <Input
                          id="newProcedure"
                          value={newProcedure}
                          onChange={(e) => setNewProcedure(e.target.value)}
                          placeholder="Add a safety procedure"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddProcedure}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="mt-2 space-y-2">
                        {formData.safetyProcedures.map((procedure, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-muted p-2 rounded-md"
                          >
                            <span>{procedure}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveProcedure(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                      {selectedLock ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {locks.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No locks found. Create one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Safety Procedures</TableHead>
                  <TableHead>QR Code</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locks.map((lock) => (
                  <TableRow key={lock.id}>
                    <TableCell>{lock.name}</TableCell>
                    <TableCell>{lock.location}</TableCell>
                    <TableCell className="text-center">
                      <Select
                        value={lock.status}
                        onValueChange={(value: Status) =>
                          handleStatusChange(lock.id, value)
                        }
                      >
                        <SelectTrigger className="w-full max-w-[200px] mx-auto bg-background text-foreground border border-border rounded-md shadow-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background text-foreground border border-border rounded-md shadow-sm">
                          {[
                            "AVAILABLE",
                            "IN_USE",
                            "MAINTENANCE",
                            "RETIRED",
                          ].map((status) => (
                            <SelectItem
                              key={status}
                              value={status}
                              className="w-[140px]"
                            >
                              <Badge
                                variant={getStatusBadgeVariant(
                                  status as Status
                                )}
                              >
                                {status}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {lock.assignedTo
                        ? `${lock.assignedTo.name || lock.assignedTo.email}`
                        : "Unassigned"}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] space-y-1">
                        {(lock.safetyProcedures as string[] | null)?.map(
                          (procedure, index) => (
                            <Badge key={index} variant="outline">
                              {procedure}
                            </Badge>
                          )
                        ) || "No procedures"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">View QR</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>QR Code for {lock.name}</DialogTitle>
                            <DialogDescription>
                              Scan this QR code to access the lock.
                              <div className="mt-2 text-sm text-muted-foreground">
                                Value: {lock.qrCode}
                              </div>
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-center p-4">
                            <img
                              src={`/api/admin/locks/${lock.id}/qr`}
                              alt={`QR code for ${lock.name}`}
                              className="w-64 h-64"
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() =>
                                window.open(
                                  `/api/admin/locks/${lock.id}/qr`,
                                  "_blank"
                                )
                              }
                            >
                              Download
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedLock(lock);
                            setFormData({
                              name: lock.name,
                              location: lock.location,
                              status: lock.status,
                              safetyProcedures:
                                (lock.safetyProcedures as string[]) || [],
                              qrCode: lock.qrCode, // Set current QR code
                            });
                            setIsDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">Delete</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Lock</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this lock? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(lock.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
