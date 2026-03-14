import { Link } from "react-router-dom";

export default function Sidebar() {
    return (
        <aside className="w-64 bg-white border-r h-[calc(100vh-64px)] p-4">
            <nav className="flex flex-col gap-2 text-gray-700">

                <Link to="/dashboard" className="px-3 py-2 rounded hover:bg-gray-100">
                    Dashboard
                </Link>

                <Link to="/graph" className="px-3 py-2 rounded hover:bg-gray-100">
                    Knowledge Graph
                </Link>

                <Link to="/collections" className="px-3 py-2 rounded hover:bg-gray-100">
                    Collections
                </Link>

                <Link to="/discover" className="px-3 py-2 rounded hover:bg-gray-100">
                    Discover
                </Link>

            </nav>
        </aside>
    );
}