import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { contentById } from "../api/content.api";
import { verifyPin } from "../api/vault.api";
import Button from "../components/Button";
import { fetchRelatedContents } from "../api/relatedContent.api";
import Loader from "../components/ui/Loader";
import { Lock, Loader2 } from "lucide-react";
import { webSearch } from "../api/web.api";


const ContentDetail = () => {
    const [content, setContent] = useState(null);
    const [relatedContent, setRelatedContent] = useState([]);
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [needsPin, setNeedsPin] = useState(false);
    const [pinUnlocked, setPinUnlocked] = useState(false);
    const [pin, setPin] = useState(["", "", "", ""]);
    const [pinError, setPinError] = useState("");
    const [pinLoading, setPinLoading] = useState(false);
    const [results, setResults] = useState([]);
    const pinRefs = useRef([]);

    useEffect(() => {
        setContent(null);
        setRelatedContent([]);
        setLoading(true);
        setNeedsPin(false);
        setPinUnlocked(false);
        setPin(["", "", "", ""]);
        setPinError("");

        const fetchContentDetail = async () => {
            try {
                const res = await contentById(id);
                const data = res.data.content || res.data;
                setContent(data);

                // Check if content is private and vault not verified
                if (data.isPrivate) {
                    const verified = sessionStorage.getItem("vaultVerified") === "true";
                    if (!verified) {
                        setNeedsPin(true);
                    } else {
                        setPinUnlocked(true);
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
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

    const handleWebSearch = async () => {
        try {
            setLoading(true);
            const query = `${content.title} ${content.text?.slice(0, 80)}`;
            const res = await webSearch(query);
            console.log(res.data.results);
            setResults(res.data.results);
        } catch (error) {
            console.error("Web search failed:", error);
        } finally {
            setLoading(false);
        }
    }

    const handlePinChange = (value, index) => {
        if (!/^\d?$/.test(value)) return;
        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);
        setPinError("");
        if (value && index < 3) pinRefs.current[index + 1].focus();
    };

    const handlePinKeyDown = (e, index) => {
        if (e.key === "Backspace" && !pin[index] && index > 0) {
            pinRefs.current[index - 1].focus();
        }
    };

    const handlePinPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
        if (pasted.length === 4) {
            setPin(pasted.split(""));
            pinRefs.current[3].focus();
        }
    };

    const handlePinSubmit = async (e) => {
        e.preventDefault();
        const finalPin = pin.join("");
        if (finalPin.length < 4) {
            setPinError("Enter all 4 digits");
            return;
        }
        setPinLoading(true);
        try {
            await verifyPin(finalPin);
            sessionStorage.setItem("vaultVerified", "true");
            setNeedsPin(false);
            setPinUnlocked(true);
        } catch (err) {
            setPinError(err.response?.data?.message || "Wrong PIN");
            setPin(["", "", "", ""]);
            pinRefs.current[0]?.focus();
        } finally {
            setPinLoading(false);
        }
    };

    const getYouTubeEmbedUrl = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    if (loading || !content) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader />
            </div>
        );
    }


    if (needsPin && !pinUnlocked) {
        return (
            <div className="flex flex-col min-h-full w-full items-center justify-center">
                <div className="bg-bg-card border border-border-theme rounded-2xl shadow-md p-8 w-80 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-2xl bg-amber-500/10">
                            <Lock size={28} className="text-amber-500" />
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-text-primary mb-1">
                        Private Content
                    </h2>
                    <p className="text-text-muted text-sm mb-6">
                        This content is in your private vault. Enter your PIN to view it.
                    </p>

                    <form onSubmit={handlePinSubmit}>
                        <div className="flex justify-center gap-3 mb-4" onPaste={handlePinPaste}>
                            {pin.map((digit, index) => (
                                <input
                                    key={index}
                                    type="password"
                                    maxLength="1"
                                    value={digit}
                                    ref={(el) => (pinRefs.current[index] = el)}
                                    onChange={(e) => handlePinChange(e.target.value, index)}
                                    onKeyDown={(e) => handlePinKeyDown(e, index)}
                                    disabled={pinLoading}
                                    autoFocus={index === 0}
                                    className="w-12 h-14 text-xl text-center font-bold border border-border-theme rounded-xl bg-bg-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary disabled:opacity-50 transition-all"
                                />
                            ))}
                        </div>

                        {pinError && (
                            <p className="text-red-500 text-xs font-medium mb-3">❌ {pinError}</p>
                        )}

                        <button
                            type="submit"
                            disabled={pinLoading || pin.some(d => d === "")}
                            className="w-full bg-accent-primary hover:opacity-90 text-white py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {pinLoading ? (
                                <><Loader2 size={14} className="animate-spin" /> Verifying...</>
                            ) : (
                                <><Lock size={14} /> Unlock Content</>
                            )}
                        </button>
                    </form>

                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 text-text-muted hover:text-text-secondary text-xs font-medium transition-colors"
                    >
                        ← Go back
                    </button>
                </div>
            </div>
        );
    }

    // ── Normal Content View ─────────────────────────────
    const embedUrl = content.type === 'video' ? getYouTubeEmbedUrl(content.url) : null;

    return (
        <div className="flex flex-col min-h-full w-full p-4">
            <div className="w-full md:p-8 max-w-7xl mx-auto">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full mb-8">
                    <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-bg-hover rounded-full transition-colors flex-none"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar sm:flex-wrap">
                            {content.isPrivate && (
                                <span className="whitespace-nowrap text-[9px] sm:text-[10px] uppercase tracking-wider font-black text-amber-500 bg-amber-500/10 px-2 sm:px-3 py-1 rounded-lg flex items-center gap-1">
                                    <Lock size={10} /> Private
                                </span>
                            )}
                            {content.tags?.map(tag => (
                                <span key={tag} className="whitespace-nowrap text-[9px] sm:text-[10px] uppercase tracking-wider font-black text-accent-text bg-accent-light px-2 sm:px-3 py-1 rounded-lg">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex-none w-full sm:w-auto">
                        <Button
                            text="Open Source"
                            className="w-full sm:w-auto bg-accent-primary text-white rounded-xl py-2 px-6 font-bold text-sm"
                            onClick={() => window.open(content.url, '_blank')}
                        />
                    </div>
                </div>

                <div className="bg-bg-card rounded-[2rem] border border-border-theme shadow-sm overflow-hidden">
                    <div className="p-4 md:p-12">
                        <h1 className="text-3xl md:text-5xl font-black text-text-primary leading-tight mb-8">
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
                            <p className="text-text-secondary text-lg leading-relaxed whitespace-pre-line antialiased">
                                {content.summary}
                            </p>
                        </div>

                        <footer className="mt-16 pt-8 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                                Saved {new Date(content.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                {content.timeAgo && (
                                    <p className="text-xs text-text-muted ml-2">
                                        ({content.timeAgo})
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-6">
                                <button className="text-text-muted hover:text-red-500 text-[10px] font-bold uppercase tracking-widest transition-colors">Delete</button>
                                <button className="text-text-muted hover:text-indigo-600 text-[10px] font-bold uppercase tracking-widest transition-colors">Edit</button>
                            </div>

                            <button
                                className="text-text-muted hover:text-green-500 text-[10px] font-bold uppercase tracking-widest transition-colors"
                                onClick={handleWebSearch}
                            >
                                Web Search
                            </button>
                        </footer>
                    </div>
                </div>

                {relatedContent.length > 0 && (
                    <div className="mt-16">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-8 px-2">Related Discoveries</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedContent
                                ?.filter(item => item && item.to)
                                .map((item) => (
                                    <div
                                        key={item?.to?._id}
                                        onClick={() => navigate(`/content/${item?.to?._id}`)}
                                        className="group bg-bg-card rounded-2xl border border-border-theme p-6 hover:shadow-xl transition-all cursor-pointer"
                                    >
                                        <span
                                            className={`text-[9px] uppercase font-black px-2 py-1 rounded mb-4 inline-block ${item?.to?.type === "video"
                                                ? "bg-red-500/10 text-red-500"
                                                : "bg-emerald-500/10 text-emerald-500"
                                                }`}
                                        >
                                            {item?.to?.type}
                                        </span>

                                        <h4 className="font-bold text-text-primary group-hover:text-indigo-600 line-clamp-2 mb-2">
                                            {item?.to?.title}
                                        </h4>

                                        <p className="text-text-muted text-xs line-clamp-2">
                                            {item?.to?.text}
                                        </p>

                                        <p>
                                            {item.timeAgo && (
                                                <span className="text-xs text-text-muted">
                                                    Saved {item.to.timeAgo}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {results.length > 0 && (
                    <div className="mt-16">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-8 px-2">
                            Web Discoveries
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.map((item, i) => (
                                <div
                                    key={i}
                                    onClick={() => window.open(item.link, "_blank")}
                                    className="group bg-bg-card rounded-2xl border border-border-theme p-6 hover:shadow-xl transition-all cursor-pointer"
                                >
                                    {/* Type badge */}
                                    <span className="text-[9px] uppercase font-black px-2 py-1 rounded mb-4 inline-block bg-blue-500/10 text-blue-500">
                                        Web
                                    </span>

                                    {/* Title */}
                                    <h4 className="font-bold text-text-primary group-hover:text-indigo-600 line-clamp-2 mb-2">
                                        {item.title}
                                    </h4>

                                    {/* Snippet */}
                                    <p className="text-text-muted text-xs line-clamp-3">
                                        {item.snippet}
                                    </p>

                                    {/* Footer (optional domain) */}
                                    <p className="mt-3 text-[10px] text-text-muted truncate">
                                        {new URL(item.link).hostname}
                                    </p>
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