import React, { useEffect, useState, useRef } from "react";
import {
    Search, LogOut, BrainCircuit, Menu, X,
    LayoutDashboard, Share2, Library, FileText, Loader2,
    Sun, Moon, Lock
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { semanticSearch } from "../api/search.api";
import { useTheme } from "../hooks/useTheme";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [searchData, setSearchData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    // Logout Logic
    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            localStorage.removeItem("token");
            navigate("/login");
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchData(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if ((searchData && query) || isMobileSearchOpen || isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [searchData, query, isMobileSearchOpen, isMenuOpen]);

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

    const navLinks = [
        { to: "/", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
        { to: "/graph", label: "Graph", icon: <Share2 size={18} /> },
        { to: "/collections", label: "Collections", icon: <Library size={18} /> },
    ];

    const SearchResults = () => (
        <div className="absolute top-full left-0 mt-5 w-full bg-bg-card border border-border-theme rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
            <div className="max-h-[60vh] md:max-h-[400px] overflow-y-auto p-2">
                {searchData?.results?.length > 0 ? (
                    searchData.results.map((result) => {
                        const isPrivate = result.isPrivate === true;

                        if (isPrivate) {
                            return (
                                <div
                                    key={result._id || result.id}
                                    className="flex items-start gap-3 p-3 rounded-lg opacity-60 cursor-not-allowed select-none"
                                >
                                    <div className="p-2 border rounded-lg flex-none bg-amber-500/10 border-amber-500/20 text-amber-500">
                                        <Lock size={16} />
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-text-primary truncate">{result.title}</span>
                                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 flex-none">
                                                Private
                                            </span>
                                        </div>
                                        <p className="text-xs text-text-muted italic">🔒 Unlock in Vault to view</p>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={result._id || result.id}
                                to={`/content/${result._id || result.id}`}
                                onClick={() => {
                                    setSearchData(null);
                                    setQuery("");
                                    setIsMobileSearchOpen(false);
                                }}
                                className="flex items-start gap-3 p-3 hover:bg-bg-hover rounded-lg transition group"
                            >
                                <div className="p-2 bg-bg-input border border-border-theme rounded-lg text-text-muted group-hover:text-text-primary transition-all flex-none">
                                    <FileText size={16} />
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-sm font-semibold text-text-primary truncate">{result.title}</span>
                                    <p className="text-xs text-text-muted line-clamp-1 italic">{result.text || "No preview..."}</p>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className="p-8 text-center text-sm text-text-muted font-medium">No results for "{query}"</div>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* BACKDROP */}
            {((searchData && query) || isMobileSearchOpen || isMenuOpen) && (
                <div
                    className="fixed inset-0 z-[40] bg-backdrop backdrop-blur-md transition-all duration-500"
                    style={{ marginTop: '64px' }}
                    onClick={() => {
                        setSearchData(null);
                        setIsMobileSearchOpen(false);
                        setIsMenuOpen(false);
                        setQuery("");
                    }}
                />
            )}

            {/* MOBILE SIDE MENU */}
            <div className={`fixed top-16 left-0 h-[calc(100vh-64px)] w-64 bg-bg-primary z-[60] shadow-xl transform transition-transform duration-300 md:hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <nav className="flex flex-col p-4 gap-1">
                    {navLinks.map(({ to, label, icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setIsMenuOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive
                                    ? 'bg-accent-primary text-white'
                                    : 'text-text-secondary hover:bg-bg-hover'
                                }`
                            }
                        >
                            {icon}
                            {label}
                        </NavLink>
                    ))}
                    {/* Logout in Mobile Menu */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-all mt-4"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </nav>
            </div>

            {/* MOBILE SEARCH BAR */}
            <div className={`fixed inset-x-0 top-0 h-16 bg-bg-primary z-[70] px-4 flex items-center transition-transform duration-300 md:hidden border-b border-border-theme ${isMobileSearchOpen ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="flex items-center bg-bg-input w-full px-4 py-2 rounded-xl relative">
                    <Search size={18} className="text-text-muted mr-2" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent outline-none text-sm w-full text-text-primary"
                        autoFocus={isMobileSearchOpen}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button onClick={() => { setIsMobileSearchOpen(false); setQuery(""); }}><X size={20} className="text-text-secondary" /></button>
                    {searchData && query && <SearchResults />}
                </div>
            </div>

            <nav className="h-16 w-full bg-bg-primary border-b border-border-theme flex items-center justify-between px-4 md:px-8 sticky top-0 z-[50]">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <button
                        className="md:hidden p-2 hover:bg-bg-hover rounded-lg text-text-primary"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <Link to="/" className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-accent-primary text-white"><BrainCircuit size={18} /></div>
                        <span className="text-lg font-bold hidden sm:block text-text-primary">MindArchive</span>
                    </Link>
                </div>

                {/* DESKTOP SEARCH */}
                <div className="hidden md:block relative w-[300px] lg:w-[420px]" ref={searchRef}>
                    <div className="flex items-center bg-bg-input px-4 py-2 rounded-lg hover:bg-bg-hover transition focus-within:bg-bg-input-focus focus-within:ring-2 focus-within:ring-accent-primary/10">
                        <Search size={18} className="text-text-muted mr-2" />
                        <input
                            type="text"
                            placeholder="Search knowledge... (⌘K)"
                            className="bg-transparent outline-none text-sm w-full text-text-primary placeholder:text-text-muted"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {isLoading && <Loader2 size={14} className="animate-spin text-text-muted" />}
                    </div>
                    {searchData && query && <SearchResults />}
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-2 md:gap-4">
                    <button className="md:hidden p-2 text-text-secondary" onClick={() => setIsMobileSearchOpen(true)}><Search size={20} /></button>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="theme-toggle-btn p-2 rounded-lg hover:bg-bg-hover text-text-secondary transition-colors"
                        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>

                    <div className="w-8 h-8 rounded-full bg-accent-light text-accent-text flex items-center justify-center font-bold text-xs">JD</div>
                </div>
            </nav>
        </>
    );
}