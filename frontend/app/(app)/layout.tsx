import { Suspense } from "react";
import { cookies } from "next/headers";
import AppBar from "@mui/material/AppBar";
import Skeleton from "@mui/material/Skeleton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import UserMenu from "@/components/UserMenu";
import { EMAIL_COOKIE } from "@/lib/auth";

async function CurrentUserMenu() {
  const email = (await cookies()).get(EMAIL_COOKIE)?.value ?? "";
  return <UserMenu email={email} />;
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Todo
          </Typography>
          <Suspense fallback={<Skeleton variant="circular" width={36} height={36} />}>
            <CurrentUserMenu />
          </Suspense>
        </Toolbar>
      </AppBar>
      {children}
    </>
  );
}
