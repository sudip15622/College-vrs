"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ShieldCheck, ShieldX, Trash2 } from "lucide-react";
import Confirmation from "@/components/confirmation/Confirmation";
import { makeUserAdmin, removeUserAdmin, deleteUser } from "@/lib/actions/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type UsersActionMenuProps = {
  userId: string;
  role: "Admin" | "User";
};

const UsersActionMenu = ({ userId, role }: UsersActionMenuProps) => {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [activeModal, setActiveModal] = React.useState<"make-admin" | "remove-admin" | "delete-user" | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleMakeAdmin = async () => {
    const result = await makeUserAdmin(userId);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to make user admin");
    }
  };

  const handleRemoveAdmin = async () => {
    const result = await removeUserAdmin(userId);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to remove admin privileges");
    }
  };

  const handleDeleteUser = async () => {
    const result = await deleteUser(userId);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      throw new Error(result.error || "Failed to delete user");
    }
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled aria-label="Open menu">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open actions menu">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Toggle Admin Action */}
        {role === "User" ? (
          <DropdownMenuItem onClick={() => setActiveModal("make-admin")} className="cursor-pointer">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Make Admin
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => setActiveModal("remove-admin")} className="cursor-pointer">
            <ShieldX className="mr-2 h-4 w-4" />
            Remove Admin
          </DropdownMenuItem>
        )}

        {/* Delete User Action */}
        <DropdownMenuItem variant="destructive" onClick={() => setActiveModal("delete-user")} className="cursor-pointer">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>

      <Confirmation
        isOpen={activeModal === "make-admin"}
        onClose={() => setActiveModal(null)}
        title="Make User Admin?"
        description="This user will gain administrative privileges and can manage the platform."
        actionButtonName="Make Admin"
        actionFunction={handleMakeAdmin}
      />

      <Confirmation
        isOpen={activeModal === "remove-admin"}
        onClose={() => setActiveModal(null)}
        title="Remove Admin Privileges?"
        description="This user will be downgraded to a regular user and lose administrative privileges."
        actionButtonName="Remove Admin"
        actionFunction={handleRemoveAdmin}
      />

      <Confirmation
        isOpen={activeModal === "delete-user"}
        onClose={() => setActiveModal(null)}
        title="Delete User?"
        description="This action cannot be undone. The user and all their bookings will be permanently deleted."
        actionButtonName="Delete User"
        actionFunction={handleDeleteUser}
        isDangerous={true}
      />
    </DropdownMenu>
  );
};

export default UsersActionMenu;
