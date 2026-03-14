import React, { useState } from "react";
import { Search, Bell, User, BrainCircuit, Menu, X, LayoutDashboard, Share2, Library } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
        { name: 'Graph View', path: '/graph', icon: <Share2 size={18} /> },
        { name: 'Collections', path: '/collections', icon: <Library size={18} /> },
    ];

    return (
        <nav className="min-h-16 w-full bg-white backdrop-blur border-b flex items-center justify-between px-4 md:px-8 sticky top-0 z-50">

            <div className="flex items-center gap-3 font-semibold text-gray-800">
                <button
                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-black text-white">
                        <BrainCircuit size={18} />
                    </div>
                    <span className="text-lg tracking-tight hidden sm:block">MindArchive</span>
                </div>
            </div>

            <div className="hidden md:flex items-center bg-gray-100 px-4 py-2 rounded-lg w-[300px] lg:w-[420px] hover:bg-gray-200 transition">
                <Search size={18} className="text-gray-500 mr-2" />
                <input
                    type="text"
                    placeholder="Search knowledge..."
                    className="bg-transparent outline-none text-sm w-full placeholder:text-gray-500"
                />
                <span className="text-xs text-gray-400 ml-2">⌘K</span>
            </div>

            <div className="flex items-center gap-2 md:gap-6">
                <button className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Search size={20} />
                </button>

                <button className="text-gray-600 hover:text-black transition p-2">
                    <Bell size={20} />
                </button>

                <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 px-2 md:px-3 py-2 rounded-lg transition">
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <User size={16} />
                    </div>

                    <div className="hidden sm:flex flex-col leading-tight">
                        <span className="text-sm font-medium text-gray-800">User</span>
                        <span className="text-xs text-gray-500">Member</span>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="absolute top-16 left-0 w-full bg-white border-b shadow-lg md:hidden flex flex-col p-4 space-y-4 animate-in slide-in-from-top duration-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input
                            className="w-full bg-gray-100 rounded-md py-2 pl-10 pr-4 text-sm outline-none"
                            placeholder="Search..."
                        />
                    </div>
                    <nav className="flex flex-col space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-indigo-600 rounded-xl transition-colors"
                            >
                                {item.icon}
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </nav>
    );
}