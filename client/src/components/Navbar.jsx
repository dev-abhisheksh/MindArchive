import { Search, Bell, User, BrainCircuit } from "lucide-react";

export default function Navbar() {
    return (
        <div className="min-h-16 w-full bg-white backdrop-blur border-b flex items-center justify-between px-8">

            {/* Left section - Logo */}
            <div className="flex items-center gap-2 font-semibold text-gray-800">
                <div className="p-2 rounded-lg bg-black text-white">
                    <BrainCircuit size={18} />
                </div>
                <span className="text-lg tracking-tight">MindArchive</span>
            </div>

            {/* Search */}
            <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg w-[420px] hover:bg-gray-200 transition">
                <Search size={18} className="text-gray-500 mr-2" />
                <input
                    type="text"
                    placeholder="Search knowledge..."
                    className="bg-transparent outline-none text-sm w-full placeholder:text-gray-500"
                />
                <span className="text-xs text-gray-400 ml-2">⌘K</span>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-6">

                <button className="text-gray-600 hover:text-black transition">
                    <Bell size={20} />
                </button>

                <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg transition">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={16} />
                    </div>

                    <div className="flex flex-col leading-tight">
                        <span className="text-sm font-medium text-gray-800">
                            User
                        </span>
                        <span className="text-xs text-gray-500">
                            Member
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
}