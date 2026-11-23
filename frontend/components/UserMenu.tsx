"use client";

import { useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import LogoutIcon from "@mui/icons-material/Logout";
import { API_URL, clearSession, getToken } from "@/lib/auth";

export default function UserMenu({ email }: { email: string }) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = anchorEl !== null;
  const letter = email.charAt(0).toUpperCase() || "?";

  async function handleLogout() {
    setAnchorEl(null);
    const token = getToken();
    try {
      if (token) {
        await fetch(`${API_URL}/session`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // Server unreachable — still log out locally.
    }
    clearSession();
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <IconButton
        onClick={(e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)}
        aria-label="Account menu"
        aria-controls={open ? "user-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        size="small"
      >
        <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main" }}>{letter}</Avatar>
      </IconButton>
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1 }}>
          {email}
        </Typography>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
