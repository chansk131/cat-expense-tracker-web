import { Outlet } from "react-router";
import { TopBar } from "../components/TopBar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <TopBar />
      <Outlet />
    </div>
  );
}
