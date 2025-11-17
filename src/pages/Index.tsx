import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "@/components/StatsCard";
import { UserList } from "@/components/UserList";
import { AddUserDialog } from "@/components/AddUserDialog";
import { ExportButton } from "@/components/ExportButton";
import { ImportButton } from "@/components/ImportButton";
import { Input } from "@/components/ui/input";
import { Users, UserCheck, UserX, Search } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: users } = useQuery({
    queryKey: ["tracked-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracked_users")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter(u => u.status === "active").length || 0;
  const inactiveUsers = totalUsers - activeUsers;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">User Activity Dashboard</h1>
              <p className="text-muted-foreground">Track and manage user activity status</p>
            </div>
            <AddUserDialog />
          </div>
          <div className="flex gap-2">
            <ExportButton users={users || []} />
            <ImportButton />
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, department, job title, or office..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <StatsCard
            title="Total Users"
            value={totalUsers}
            icon={Users}
            variant="default"
          />
          <StatsCard
            title="Active Users"
            value={activeUsers}
            icon={UserCheck}
            variant="success"
          />
          <StatsCard
            title="Inactive Users"
            value={inactiveUsers}
            icon={UserX}
            variant="warning"
          />
        </div>

        <UserList searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default Index;