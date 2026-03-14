import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { contentById } from "../api/content.api";
import Button from "../components/Button";

const ContentDetail = () => {
    const [content, setContent] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchContentDetail = async () => {
            try {
                const res = await contentById(id);
                setContent(res.data.content || res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchContentDetail();
    }, [id]);

    const getYouTubeEmbedUrl = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    if (!content) return (
        <div className="flex h-screen items-center justify-center bg-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    const embedUrl = content.type === 'video' ? getYouTubeEmbedUrl(content.url) : null;

    return (
        /* FIXED: Added h-screen and overflow-hidden to lock the page */
        <div className=" flex gap-0 flex-col bg-white font-sans text-gray-900 overflow-hidden">

            {/* Minimalist Top Nav */}
            <header className="flex-none bg-[#d5d5d5] border-b rounded-md border-gray-100 px-4  py-3 flex items-center justify-between z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
                    >
                        <svg className="w-6 h-6 text-gray-500 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                </div>

                <div className="flex items-center gap-3">
                    <Button
                        text="Open Source"
                        className="bg-black text-white"
                    />
                </div>
            </header>

            {/* Main Content Area: FIXED scroll behavior */}
            <main className="flex-1 overflow-y-auto bg-gray-50">
                <div className="min-h-full w-full flex flex-col items-center">

                    {/* Media Section: Expands to full width for videos */}
                    {embedUrl ? (
                        <div className="w-full bg-black flex justify-center">
                            <div className="w-full max-w-5xl aspect-video">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={embedUrl}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    ) : null}

                    {/* Text/Article Content Section */}
                    <div className="w-full h-full bg-white p-8 md:p-16 my-4 md:my-4 md:rounded-2xl md:shadow-sm border-x md:border border-gray-100">
                        <header className="mb-4">
                            <div className="flex flex-wrap gap-2 mb-6">
                                {content.tags?.map(tag => (
                                    <span key={tag} className="text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                                {content.title}
                            </h1>
                        </header>

                        <div className="prose prose-lg prose-indigo max-w-none">
                            <p className="text-gray-800 text-xl leading-relaxed whitespace-pre-line antialiased">
                                {content.text}
                            </p>
                        </div>

                        {/* Metadata Footer */}
                        <footer className="mt-16 pt-8 border-t border-gray-100 flex items-center justify-between">
                            <div className="text-sm text-gray-400 font-medium">
                                Saved on {new Date(content.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                            </div>
                            <div className="flex gap-4">
                                {/* Placeholders for Delete/Edit */}
                                <button className="text-gray-400 hover:text-red-500 text-sm font-medium transition-colors">Delete</button>
                                <button className="text-gray-400 hover:text-indigo-600 text-sm font-medium transition-colors">Edit</button>
                            </div>
                        </footer>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ContentDetail;