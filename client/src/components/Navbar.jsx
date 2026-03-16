import React, { useEffect, useState, useRef } from "react";
import {
    Search, Bell, User, BrainCircuit, Menu, X,
    LayoutDashboard, Share2, Library, FileText, Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { semanticSearch } from "../api/search.api";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [searchData, setSearchData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const searchRef = useRef(null);

    // 1. Close search when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchData(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 2. Body Scroll Lock (Stop background scrolling when search is active)
    useEffect(() => {
        if (searchData && query) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [searchData, query]);

    // 3. Debounce Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 400);
        return () => clearTimeout(timer);
    }, [query]);

    // 4. Fetch Search Results
    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setSearchData(null);
            return;
        }

        const searchContent = async () => {
            setIsLoading(true);
            try {
                // Ensure your API sends { query } correctly
                const res = await semanticSearch({ query: debouncedQuery });
                // Handle both array and object responses
                setSearchData(Array.isArray(res.data) ? { results: res.data } : res.data);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        searchContent();
    }, [debouncedQuery]);

    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
        { name: 'Graph View', path: '/graph', icon: <Share2 size={18} /> },
        { name: 'Collections', path: '/collections', icon: <Library size={18} /> },
    ];

    return (
        <>
            {/* VISUAL BACKDROP BLUR OVERLAY */}
            {/* This div covers the whole page below the navbar */}
            {searchData && query && (
                <div
                    className="fixed inset-0 z-[40] bg-black/10 backdrop-blur-md animate-in fade-in duration-300"
                    style={{ marginTop: '64px' }} // Height of the navbar (h-16)
                    onClick={() => setSearchData(null)}
                />
            )}

            <nav className="h-16 w-full bg-white border-b flex items-center justify-between px-4 md:px-8 sticky top-0 z-[50]">

                {/* Logo & Mobile Menu Toggle */}
                <div className="flex items-center gap-3 font-semibold text-gray-800">
                    <button
                        className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <Link to="/" className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-black text-white">
                            <BrainCircuit size={18} />
                        </div>
                        <span className="text-lg tracking-tight hidden sm:block">MindArchive</span>
                    </Link>
                </div>

                {/* Search Bar with Dropdown */}
                <div className="hidden md:block relative w-[300px] lg:w-[420px]" ref={searchRef}>
                    <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-black/5 z-[60]">
                        <Search size={18} className="text-gray-500 mr-2" />
                        <input
                            type="text"
                            placeholder="Search knowledge..."
                            className="bg-transparent outline-none text-sm w-full placeholder:text-gray-500"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {isLoading ? (
                            <Loader2 size={14} className="animate-spin text-gray-400" />
                        ) : (
                            <span className="text-[10px] font-bold text-gray-400 ml-2 bg-gray-200 px-1.5 py-0.5 rounded">⌘K</span>
                        )}
                    </div>

                    {/* RESULTS DROPDOWN */}
                    {searchData && query && (
                        <div className="absolute top-full left-0 mt-2 w-full bg-white border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
                            <div className="max-h-[400px] overflow-y-auto p-2">
                                {searchData.results?.length > 0 ? (
                                    searchData.results.map((result) => (
                                        <Link
                                            key={result._id || result.id}
                                            to={`/content/${result._id || result.id}`}
                                            onClick={() => { setSearchData(null); setQuery("") }}
                                            className="flex items-start gap-3 p-3 hover:bg-indigo-50/50 rounded-lg transition group"
                                        >
                                            <div className="p-2 bg-gray-100 border rounded-lg text-gray-400 group-hover:text-indigo-600 group-hover:bg-white transition-all">
                                                <FileText size={16} />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-semibold text-gray-800 truncate">
                                                    {result.title}
                                                </span>
                                                <p className="text-xs text-gray-500 line-clamp-1 italic">
                                                    {result.text || "No preview available..."}
                                                </p>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-sm text-gray-500 font-medium">
                                        No results for "{query}"
                                    </div>
                                )}
                            </div>
                            <div className="bg-gray-50 px-4 py-2 border-t flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <span>{searchData.results?.length || 0} results</span>
                                <span>Semantic Engine</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side Icons */}
                <div className="flex items-center gap-2 md:gap-4">
                    <button className="text-gray-600 hover:text-black transition p-2 relative">
                        <Bell size={20} />
                        <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    </button>

                    <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-lg transition">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                            JD
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="absolute top-16 left-0 w-full bg-white border-b shadow-lg md:hidden flex flex-col p-4 space-y-4 animate-in slide-in-from-top duration-200">
                        <nav className="flex flex-col space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 hover:text-black rounded-xl transition-colors"
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                )}
            </nav>
        </>
    );
}