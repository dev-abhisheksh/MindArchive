import React, { useEffect, useState, useRef } from "react";
import {
    Search, Bell, BrainCircuit, Menu, X,
    LayoutDashboard, Share2, Library, FileText, Loader2
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { semanticSearch } from "../api/search.api";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
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

    // 2. Body Scroll Lock
    useEffect(() => {
        if ((searchData && query) || isMobileSearchOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [searchData, query, isMobileSearchOpen]);

    // 3. Debounce & Fetch
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 400);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setSearchData(null);
            return;
        }
        const searchContent = async () => {
            setIsLoading(true);
            try {
                const res = await semanticSearch({ query: debouncedQuery });
                setSearchData(Array.isArray(res.data) ? { results: res.data } : res.data);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        searchContent();
    }, [debouncedQuery]);

    // UI Helper: The Results List Component
    const SearchResults = () => (
        <div className="absolute top-full left-0 mt-5 w-full bg-white border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
            <div className="max-h-[60vh] md:max-h-[400px] overflow-y-auto p-2">
                {searchData?.results?.length > 0 ? (
                    searchData.results.map((result) => (
                        <Link
                            key={result._id || result.id}
                            to={`/content/${result._id || result.id}`}
                            onClick={() => {
                                setSearchData(null);
                                setQuery("");
                                setIsMobileSearchOpen(false);
                            }}
                            className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition group"
                        >
                            <div className="p-2 bg-gray-100 border rounded-lg text-gray-400 group-hover:text-black transition-all">
                                <FileText size={16} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-semibold text-gray-800 truncate">{result.title}</span>
                                <p className="text-xs text-gray-500 line-clamp-1 italic">{result.text || "No preview..."}</p>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="p-8 text-center text-sm text-gray-500 font-medium">No results for "{query}"</div>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* BACKDROP BLUR */}
            {((searchData && query) || isMobileSearchOpen) && (
                <div
                    className="fixed inset-0 z-[40] bg-black/20 backdrop-blur-md transition-all duration-500"
                    style={{ marginTop: '64px' }}
                    onClick={() => {
                        setSearchData(null);
                        setIsMobileSearchOpen(false);
                        setQuery("");
                    }}
                />
            )}

            <nav className="h-16 w-full bg-white border-b flex items-center justify-between px-4 md:px-8 sticky top-0 z-[50]">
                {/* Logo Section */}
                <div className="flex items-center gap-3">
                    <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <Link to="/" className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-black text-white"><BrainCircuit size={18} /></div>
                        <span className="text-lg font-bold hidden sm:block">MindArchive</span>
                    </Link>
                </div>

                {/* MOBILE SEARCH BAR */}
                <div className={`fixed inset-x-0 top-0 h-16 bg-white z-[70] px-4 flex items-center transition-transform duration-300 md:hidden border-b ${isMobileSearchOpen ? 'translate-y-0' : '-translate-y-full'}`}>
                    <div className="flex items-center bg-gray-100 w-full px-4 py-2 rounded-xl relative">
                        <Search size={18} className="text-gray-500 mr-2" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-transparent outline-none text-sm w-full"
                            autoFocus={isMobileSearchOpen}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button onClick={() => { setIsMobileSearchOpen(false); setQuery(""); }}><X size={20} /></button>
                        {/* MOBILE RESULTS */}
                        {searchData && query && <SearchResults />}
                    </div>
                </div>

                {/* DESKTOP SEARCH BAR */}
                <div className="hidden md:block relative w-[300px] lg:w-[420px]" ref={searchRef}>
                    <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-black/5">
                        <Search size={18} className="text-gray-500 mr-2" />
                        <input
                            type="text"
                            placeholder="Search knowledge... (⌘K)"
                            className="bg-transparent outline-none text-sm w-full"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {isLoading && <Loader2 size={14} className="animate-spin text-gray-400" />}
                    </div>
                    {/* DESKTOP RESULTS */}
                    {searchData && query && <SearchResults />}
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-2">
                    <button className="md:hidden p-2" onClick={() => setIsMobileSearchOpen(true)}><Search size={20} /></button>
                    <button className="p-2 relative"><Bell size={20} /><span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span></button>
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">JD</div>
                </div>
            </nav>
        </>
    );
}