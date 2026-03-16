import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { contentById } from "../api/content.api";
import Button from "../components/Button";
import { fetchRelatedContents } from "../api/relatedContent.api";

const ContentDetail = () => {
    const [content, setContent] = useState(null);
    const [relatedContent, setRelatedContent] = useState([]);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        setContent(null);
        setRelatedContent([]);

        const fetchContentDetail = async () => {
            try {
                const res = await contentById(id);
                setContent(res.data.content || res.data);
            } catch (error) {
                console.error(error);
            }
        };

        const allRelatedContents = async () => {
            try {
                const res = await fetchRelatedContents(id);
                setRelatedContent(res.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchContentDetail();
        allRelatedContents();
    }, [id]);

    const getYouTubeEmbedUrl = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    if (!content) return (
        <div className="flex h-full items-center justify-center bg-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    const embedUrl = content.type === 'video' ? getYouTubeEmbedUrl(content.url) : null;

    return (
        <div className="flex flex-col min-h-full w-full">
            <div className="w-full md:p-8 max-w-7xl mx-auto">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full mb-8">
                    <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors flex-none"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar sm:flex-wrap">
                            {content.tags?.map(tag => (
                                <span key={tag} className="whitespace-nowrap text-[9px] sm:text-[10px] uppercase tracking-wider font-black text-indigo-600 bg-indigo-50 px-2 sm:px-3 py-1 rounded-lg">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex-none w-full sm:w-auto">
                        <Button
                            text="Open Source"
                            className="w-full sm:w-auto bg-black text-white rounded-xl py-2 px-6 font-bold text-sm"
                            onClick={() => window.open(content.url, '_blank')}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 md:p-12">
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-8">
                            {content.title}
                        </h1>

                        {embedUrl && (
                            <div className="mb-10 w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={embedUrl}
                                    title="Video"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        )}

                        <div className="prose prose-lg max-w-none">
                            <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line antialiased">
                                {content.text}
                            </p>
                        </div>

                        <footer className="mt-16 pt-8 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                Saved {new Date(content.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                            </div>
                            <div className="flex gap-6">
                                <button className="text-gray-400 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest transition-colors">Delete</button>
                                <button className="text-gray-400 hover:text-indigo-600 text-[10px] font-bold uppercase tracking-widest transition-colors">Edit</button>
                            </div>
                        </footer>
                    </div>
                </div>

                {relatedContent.length > 0 && (
                    <div className="mt-16">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 px-2">Related Discoveries</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedContent.map((item) => (
                                <div
                                    key={item._id}
                                    onClick={() => navigate(`/content/${item.to._id}`)}
                                    className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all cursor-pointer"
                                >
                                    <span className={`text-[9px] uppercase font-black px-2 py-1 rounded mb-4 inline-block ${item.to.type === 'video' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                                        }`}>
                                        {item.to.type}
                                    </span>
                                    <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 line-clamp-2 mb-2">{item.to.title}</h4>
                                    <p className="text-gray-500 text-xs line-clamp-2">{item.to.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContentDetail;