import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-bg-primary">
            <Navbar onMenuClick={toggleSidebar} />

            <div className="flex flex-1 overflow-hidden relative">
                <div className={`
                    fixed inset-y-0 left-0 z-40 w-64 bg-bg-primary transform transition-transform duration-300 ease-in-out
                    md:relative md:translate-x-0 
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                `}>
                    <Sidebar />
                </div>

                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-backdrop z-30 md:hidden"
                        onClick={toggleSidebar}
                    />
                )}

                <div className="flex-1 p-4 overflow-auto bg-bg-secondary">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}