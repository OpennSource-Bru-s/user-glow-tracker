import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface TrackedUser {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  department: string | null;
  job_title: string | null;
  office: string | null;
  status: string;
  last_active_at: string | null;
  created_at: string;
}

export const UserList = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["tracked-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracked_users")
        .select("*")
        .order("last_active_at", { ascending: false, nullsFirst: false });
      
      if (error) throw error;
      return data as TrackedUser[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tracked_users")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracked-users"] });
      toast.success("User deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete user");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: string }) => {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const { error } = await supabase
        .from("tracked_users")
        .update({ 
          status: newStatus,
          last_active_at: newStatus === "active" ? new Date().toISOString() : null
        })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracked-users"] });
      toast.success("Status updated");
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {users?.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-semibold text-foreground truncate">
                    {user.first_name} {user.last_name || ''}
                  </p>
                  <Badge
                    variant={user.status === "active" ? "default" : "secondary"}
                    className={user.status === "active" ? "bg-success hover:bg-success/80" : ""}
                  >
                    {user.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  {user.job_title && <span>{user.job_title}</span>}
                  {user.department && <span>• {user.department}</span>}
                  {user.office && <span>• {user.office}</span>}
                </div>
                {user.last_active_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last active {formatDistanceToNow(new Date(user.last_active_at), { addSuffix: true })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleStatusMutation.mutate({ id: user.id, currentStatus: user.status })}
                  disabled={toggleStatusMutation.isPending}
                >
                  Toggle Status
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(user.id)}
                  disabled={deleteMutation.isPending}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {users?.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No users yet. Add your first user to start tracking!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};