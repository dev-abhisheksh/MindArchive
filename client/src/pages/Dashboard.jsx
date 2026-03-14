import React, { useEffect, useState } from 'react';
import { fetchContent } from '../api/content.api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [content, setContent] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
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
            {/* Header: Vertical on mobile, horizontal on desktop */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold capitalize text-gray-900">
                        {filter === 'all' ? 'Your Library' : `${filter}s`}
                    </h2>
                    <p className="text-gray-500 mt-1 text-sm md:text-base">
                        Found {filteredContent.length} resources
                    </p>
                </div>

                {/* Scrollable category list for mobile touch screens */}
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

            {/* Content Grid: 1 col on mobile, 2 on tablet, 3 on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredContent.length > 0 ? (
                    filteredContent.map((item) => (
                        <div
                            key={item._id}
                            onClick={() => navigate(`/content/${item._id}`)}
                            className="group bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98] md:hover:-translate-y-1"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md ${item.type === 'video' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                                    }`}>
                                    {item.type}
                                </span>
                                <div className="text-gray-300 group-hover:text-indigo-600 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
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
                    ))
                ) : (
                    <div className="col-span-full py-16 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium">No {filter} items found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;