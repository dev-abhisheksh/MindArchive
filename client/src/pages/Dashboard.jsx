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
        /* Removed h-screen and fixed sidebar logic here because Layout.jsx handles it */
        <div className="max-w-6xl p-3">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold capitalize">
                        {filter === 'all' ? 'Your Library' : `${filter}s`}
                    </h2>
                    <p className="text-gray-500 mt-1">Found {filteredContent.length} resources</p>
                </div>
                
                {/* Simplified Category Toggles if they aren't in your Sidebar component yet */}
                <div className="flex gap-2">
                    {['all', 'article', 'video'].map((cat) => (
                        <button 
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                                filter === cat ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </header>

            {/* Content Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
                {filteredContent.length > 0 ? (
                    filteredContent.map((item) => (
                        <div
                            key={item._id}
                            onClick={() => navigate(`/content/${item._id}`)}
                            className="group bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:-translate-y-1"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-md ${
                                    item.type === 'video' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                                }`}>
                                    {item.type}
                                </span>
                                <div className="text-gray-400 group-hover:text-indigo-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold leading-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                {item.title}
                            </h3>

                            <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                                {item.text}
                            </p>

                            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-50">
                                {item.tags?.map((tag, idx) => (
                                    <span key={idx} className="text-xs text-indigo-500 font-medium">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400">No {filter} items found yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;