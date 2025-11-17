import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

interface ExportButtonProps {
  users: any[];
}

export const ExportButton = ({ users }: ExportButtonProps) => {
  const handleExport = () => {
    if (!users || users.length === 0) {
      toast.error("No users to export");
      return;
    }

    try {
      // Prepare data for export
      const exportData = users.map(user => ({
        "First Name": user.first_name,
        "Last Name": user.last_name || "",
        Email: user.email,
        Department: user.department || "",
        "Job Title": user.job_title || "",
        Office: user.office || "",
        Status: user.status,
        "Last Active": user.last_active_at 
          ? new Date(user.last_active_at).toLocaleString() 
          : "Never",
        "Created At": new Date(user.created_at).toLocaleString(),
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      worksheet['!cols'] = [
        { wch: 20 }, // First Name
        { wch: 20 }, // Last Name
        { wch: 30 }, // Email
        { wch: 20 }, // Department
        { wch: 25 }, // Job Title
        { wch: 15 }, // Office
        { wch: 10 }, // Status
        { wch: 25 }, // Last Active
        { wch: 25 }, // Created At
      ];

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

      // Generate filename with timestamp
      const filename = `user-activity-${new Date().toISOString().split('T')[0]}.xlsx`;

      // Download file
      XLSX.writeFile(workbook, filename);
      
      toast.success("Excel file exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    }
  };

  return (
    <Button variant="outline" onClick={handleExport} className="gap-2">
      <Download className="h-4 w-4" />
      Export to Excel
    </Button>
  );
};