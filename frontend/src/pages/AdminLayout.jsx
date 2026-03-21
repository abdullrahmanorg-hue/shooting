import { Outlet } from "react-router-dom";
import AdminSidebar from "../commponent/AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-950">
      <AdminSidebar />
      <main className="flex-1 p-6 text-gray-800 dark:text-gray-100">
        <Outlet />
      </main>
    </div>
  );
}
