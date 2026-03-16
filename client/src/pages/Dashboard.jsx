import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { fetchContent } from '../api/content.api';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, FolderPlus, Loader2 } from 'lucide-react';
import { addContentsToCollection, fetchCollections } from '../api/collection.api';

const Dashboard = () => {
    const [content, setContent] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [collections, setCollections] = useState([]);
    const [activeMenu, setActiveMenu] = useState(null);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    const [isAdding, setIsAdding] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const getMyData = async () => {
            try {
                const res = await fetchContent();
                const fetchedData = res.data?.content || res.data || [];
                setContent(Array.isArray(fetchedData) ? fetchedData : []);
            } catch (error) {
                console.error("Failed to fetch:", error);
            } finally {
                setLoading(false);
            }
        };
        getMyData();
    }, []);

    const handleOpenMenu = async (e, contentId) => {
        e.stopPropagation();
        e.preventDefault();

        if (activeMenu === contentId) {
            setActiveMenu(null);
            return;
        }

        // Calculate position from the button so the portal dropdown lands in the right spot
        const rect = e.currentTarget.getBoundingClientRect();
        setMenuPos({
            top: rect.bottom + window.scrollY + 8,
            left: rect.right + window.scrollX - 224, // 224 = w-56
        });
        setActiveMenu(contentId);

        if (collections.length === 0) {
            try {
                const res = await fetchCollections();
                setCollections(res.data.collections || []);
            } catch (err) {
                console.error("Error fetching collections:", err);
            }
        }
    };

    const handleAddToCollection = async (e, contentId, collectionId) => {
        e.stopPropagation();
        e.preventDefault();
        setIsAdding(contentId);
        try {
            await addContentsToCollection(collectionId, [contentId]);
            setActiveMenu(null);
            console.log("Added to collection");
        } catch (error) {
            console.error(error);
        } finally {
            setIsAdding(null);
        }
    };

    const safeContent = Array.isArray(content) ? content : [];
    const filteredContent = filter === 'all'
        ? safeContent
        : safeContent.filter(item => item.type === filter);

    if (loading) return (
        <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold capitalize text-gray-900">
                        {filter === 'all' ? 'Your Library' : `${filter}s`}
                    </h2>
                    <p className="text-gray-500 mt-1 text-sm md:text-base">
                        Found {filteredContent.length} resources
                    </p>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    {['all', 'article', 'video'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-5 py-2 rounded-full text-sm font-semibold capitalize whitespace-nowrap transition-all border shadow-sm ${filter === cat
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredContent.map((item) => (
                    <div
                        key={item._id}
                        onClick={() => navigate(`/content/${item._id}`)}
                        className="group bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98] md:hover:-translate-y-1 relative"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md ${item.type === 'video' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                {item.type}
                            </span>

                            <button
                                onClick={(e) => handleOpenMenu(e, item._id)}
                                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <MoreVertical size={18} className="text-gray-400 group-hover:text-gray-600" />
                            </button>
                        </div>

                        <h3 className="text-lg font-bold leading-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                            {item.title}
                        </h3>

                        <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                            {item.text}
                        </p>

                        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-50">
                            {item.tags?.map((tag, idx) => (
                                <span key={idx} className="text-[11px] font-bold text-indigo-500 uppercase">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Dropdown rendered via portal directly into body — no z-index or overflow conflicts */}
            {activeMenu && createPortal(
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setActiveMenu(null)}
                    />
                    {/* Menu */}
                    <div
                        style={{ top: menuPos.top, left: menuPos.left }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute z-50 w-56 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2"
                    >
                        <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase border-b border-gray-50 flex items-center gap-2">
                            <FolderPlus size={12} /> Add to collection
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                            {collections.map(col => (
                                <button
                                    key={col._id}
                                    type="button"
                                    onClick={(e) => handleAddToCollection(e, activeMenu, col._id)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex justify-between items-center"
                                >
                                    <span className="truncate">{col.name}</span>
                                    {isAdding === activeMenu && <Loader2 size={12} className="animate-spin" />}
                                </button>
                            ))}
                            {collections.length === 0 && (
                                <div className="px-4 py-3 text-xs text-gray-400 italic">No collections found</div>
                            )}
                        </div>
                    </div>
                </>,
                document.body
            )}
        </div>
    );
};

export default Dashboard;