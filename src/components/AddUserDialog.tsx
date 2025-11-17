import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const AddUserDialog = () => {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [office, setOffice] = useState("");
  const queryClient = useQueryClient();

  const addUserMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("tracked_users")
        .insert({ 
          first_name: firstName,
          last_name: lastName,
          email,
          department: department || null,
          job_title: jobTitle || null,
          office: office || null,
          status: "active", 
          last_active_at: new Date().toISOString() 
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracked-users"] });
      toast.success("User added successfully");
      setOpen(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setDepartment("");
      setJobTitle("");
      setOffice("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add user");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) {
      toast.error("Please fill in first name and email");
      return;
    }
    addUserMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Engineering"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Software Engineer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="office">Office</Label>
            <Input
              id="office"
              value={office}
              onChange={(e) => setOffice(e.target.value)}
              placeholder="New York"
            />
          </div>
          <Button type="submit" className="w-full" disabled={addUserMutation.isPending}>
            {addUserMutation.isPending ? "Adding..." : "Add User"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};