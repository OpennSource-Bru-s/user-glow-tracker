import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export const ImportButton = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (users: any[]) => {
      const { error } = await supabase
        .from("tracked_users")
        .insert(users);
      
      if (error) throw error;
      return users.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["tracked-users"] });
      toast.success(`Successfully imported ${count} user${count > 1 ? 's' : ''}`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to import users");
    },
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      // Get first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error("Excel file is empty");
        return;
      }

      // Map Excel data to database format
      const users = jsonData.map((row: any) => {
        // Support both column name formats (case-insensitive)
        const firstName = row["First Name"] || row["first name"] || row.FIRST_NAME || row.FirstName || row.firstName;
        const lastName = row["Last Name"] || row["last name"] || row.LAST_NAME || row.LastName || row.lastName;
        const email = row.Email || row.email || row.EMAIL;
        const department = row.Department || row.department || row.DEPARTMENT;
        const jobTitle = row["Job Title"] || row["job title"] || row.JOB_TITLE || row.JobTitle || row.jobTitle;
        const office = row.Office || row.office || row.OFFICE;
        const status = (row.Status || row.status || row.STATUS || "inactive").toLowerCase();

        if (!firstName || !email) {
          throw new Error("Excel file must have 'First Name' and 'Email' columns");
        }

        return {
          first_name: String(firstName).trim(),
          last_name: lastName ? String(lastName).trim() : null,
          email: String(email).trim().toLowerCase(),
          department: department ? String(department).trim() : null,
          job_title: jobTitle ? String(jobTitle).trim() : null,
          office: office ? String(office).trim() : null,
          status: status === "active" ? "active" : "inactive",
          last_active_at: status === "active" ? new Date().toISOString() : null,
        };
      });

      // Validate emails
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = users.filter(u => !emailRegex.test(u.email));
      
      if (invalidEmails.length > 0) {
        toast.error(`Found ${invalidEmails.length} invalid email address(es)`);
        return;
      }

      // Import users
      importMutation.mutate(users);
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(error.message || "Failed to parse Excel file");
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button 
        variant="outline" 
        onClick={handleClick}
        disabled={importMutation.isPending}
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        {importMutation.isPending ? "Importing..." : "Import from Excel"}
      </Button>
    </>
  );
};