import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import BottomNavigation from "../components/BottomNavigation";

export default function Layout() {
    return (
        <div className="h-screen flex flex-col overflow-hidden bg-bg-primary">
            <Navbar />

            <div className="flex flex-1 overflow-hidden relative">
                <div className="hidden md:block z-40 bg-bg-primary">
                    <Sidebar />
                </div>

                <div className="flex-1 overflow-auto bg-bg-secondary pb-24 md:pb-0">
                    <Outlet />
                </div>
                
                <BottomNavigation />
            </div>
        </div>
    );
}