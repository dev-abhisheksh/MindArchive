import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Layout() {
    return (
        <div className="h-screen flex flex-col">

            <Navbar />

            <div className="flex flex-1">
                <Sidebar />

                <div className="flex-1 p-4 overflow-auto">
                    <Outlet />
                </div>
            </div>

        </div>
    );
}