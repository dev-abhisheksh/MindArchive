import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { fetchPrivateVaultContents, toggleVault, verifyPin } from '../api/vault.api';
import { addContentsToCollection, fetchCollections } from '../api/collection.api';
import { MoreVertical, FolderPlus, Loader2, ShieldOff, Lock, X } from 'lucide-react';
import Loader from '../components/ui/Loader';

const PrivateVault = () => {
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [collections, setCollections] = useState([]);
    const [activeMenu, setActiveMenu] = useState(null);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    const [isAdding, setIsAdding] = useState(null);

    // PIN verification modal state
    const [pinModal, setPinModal] = useState({ open: false, contentId: null });
    const [pin, setPin] = useState(["", "", "", ""]);
    const [pinError, setPinError] = useState("");
    const [pinLoading, setPinLoading] = useState(false);
    const pinRefs = useRef([]);

    const navigate = useNavigate();

    // Check session auth
    useEffect(() => {
        const verified = sessionStorage.getItem('vaultVerified');
        if (verified !== 'true') {
            navigate('/verify-pin', { replace: true });
        }
    }, [navigate]);

    // Fetch vault contents
    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await fetchPrivateVaultContents();
                setContents(res.data.contents || []);
            } catch (error) {
                console.error("Failed to fetch vault contents:", error);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const handleOpenMenu = async (e, contentId) => {
        e.stopPropagation();
        e.preventDefault();

        if (activeMenu === contentId) {
            setActiveMenu(null);
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        setMenuPos({
            top: rect.bottom + window.scrollY + 8,
            left: rect.right + window.scrollX - 224,
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
        } catch (error) {
            console.error(error);
        } finally {
            setIsAdding(null);
        }
    };

    // ── PIN Modal Logic ─────────────────────────────────
    const openPinModal = (e, contentId) => {
        e.stopPropagation();
        e.preventDefault();
        setActiveMenu(null);
        setPinModal({ open: true, contentId });
        setPin(["", "", "", ""]);
        setPinError("");
        setTimeout(() => pinRefs.current[0]?.focus(), 100);
    };

    const closePinModal = () => {
        setPinModal({ open: false, contentId: null });
        setPin(["", "", "", ""]);
        setPinError("");
    };

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
            // PIN correct — remove from vault
            await toggleVault(pinModal.contentId);
            setContents(prev => prev.filter(item => item._id !== pinModal.contentId));
            closePinModal();
        } catch (err) {
            setPinError(err.response?.data?.message || "Wrong PIN");
            setPin(["", "", "", ""]);
            pinRefs.current[0]?.focus();
        } finally {
            setPinLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 rounded-xl bg-accent-light">
                            <Lock size={20} className="text-accent-text" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
                            Private Vault
                        </h2>
                    </div>
                    <p className="text-text-muted mt-1 text-sm md:text-base">
                        {contents.length} protected {contents.length === 1 ? 'resource' : 'resources'}
                    </p>
                </div>
            </header>

            {contents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="p-4 rounded-2xl bg-accent-light mb-4">
                        <Lock size={32} className="text-accent-text" />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary mb-2">Your vault is empty</h3>
                    <p className="text-text-muted text-sm max-w-sm">
                        Move content to your private vault from the Dashboard using the menu on each card.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {contents.map((item) => (
                        <div
                            key={item._id}
                            onClick={() => navigate(`/content/${item._id}`)}
                            className="group bg-bg-card rounded-2xl border border-border-theme p-5 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98] md:hover:-translate-y-1 relative"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md ${
                                        item.type === 'video'
                                            ? 'bg-red-500/10 text-red-500'
                                            : item.type === 'image'
                                            ? 'bg-blue-500/10 text-blue-500'
                                            : 'bg-emerald-500/10 text-emerald-500'
                                    }`}>
                                        {item.type}
                                    </span>
                                    <Lock size={12} className="text-amber-500" />
                                </div>

                                <button
                                    onClick={(e) => handleOpenMenu(e, item._id)}
                                    className="p-1.5 hover:bg-bg-hover rounded-full transition-colors"
                                >
                                    <MoreVertical size={18} className="text-text-muted group-hover:text-text-secondary" />
                                </button>
                            </div>

                            <h3 className="text-lg font-bold leading-tight mb-2 text-text-primary group-hover:text-indigo-600 transition-colors line-clamp-2">
                                {item.title}
                            </h3>

                            <p className="text-text-secondary text-sm line-clamp-3 mb-4 leading-relaxed">
                                {item.summary}
                            </p>

                            <div className="flex flex-wrap gap-2 pt-4 border-t border-border-light">
                                {item.tags?.map((tag, idx) => (
                                    <span key={idx} className="text-[11px] font-bold text-accent-text uppercase">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <div className='absolute bottom-3 right-3 bg-bg-card px-2 py-0.5 rounded-full border border-border-theme text-xs text-text-muted hover:scale-105 transition-all'>
                                {item.timeAgo && (
                                    <p className="text-xs text-text-primary">
                                        {item.timeAgo}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Context menu via portal */}
            {activeMenu && createPortal(
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setActiveMenu(null)}
                    />
                    <div
                        style={{ top: menuPos.top, left: menuPos.left }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute z-50 w-56 bg-bg-card border border-border-theme rounded-xl shadow-xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2"
                    >
                        {/* Remove from vault — opens PIN modal */}
                        <button
                            type="button"
                            onClick={(e) => openPinModal(e, activeMenu)}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2 border-b border-border-light"
                        >
                            <ShieldOff size={14} />
                            Remove from Vault
                        </button>

                        <div className="px-4 py-2 text-[10px] font-bold text-text-muted uppercase border-b border-border-light flex items-center gap-2">
                            <FolderPlus size={12} /> Add to collection
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                            {collections.map(col => (
                                <button
                                    key={col._id}
                                    type="button"
                                    onClick={(e) => handleAddToCollection(e, activeMenu, col._id)}
                                    className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-accent-light hover:text-accent-text transition-colors flex justify-between items-center"
                                >
                                    <span className="truncate">{col.name}</span>
                                    {isAdding === activeMenu && <Loader2 size={12} className="animate-spin" />}
                                </button>
                            ))}
                            {collections.length === 0 && (
                                <div className="px-4 py-3 text-xs text-text-muted italic">No collections found</div>
                            )}
                        </div>
                    </div>
                </>,
                document.body
            )}

            {/* PIN Verification Modal */}
            {pinModal.open && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={closePinModal}>
                    <div
                        className="bg-bg-card border border-border-theme rounded-2xl shadow-2xl p-6 w-80 text-center animate-in fade-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-red-500/10">
                                    <ShieldOff size={16} className="text-red-500" />
                                </div>
                                <span className="font-bold text-text-primary text-sm">Confirm PIN</span>
                            </div>
                            <button onClick={closePinModal} className="p-1 hover:bg-bg-hover rounded-lg transition-colors">
                                <X size={16} className="text-text-muted" />
                            </button>
                        </div>

                        <p className="text-text-muted text-xs mb-5">
                            Enter your vault PIN to remove this content from the private vault.
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
                                        className="w-11 h-12 text-lg text-center font-bold border border-border-theme rounded-xl bg-bg-input text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary disabled:opacity-50 transition-all"
                                    />
                                ))}
                            </div>

                            {pinError && (
                                <p className="text-red-500 text-xs font-medium mb-3">❌ {pinError}</p>
                            )}

                            <button
                                type="submit"
                                disabled={pinLoading || pin.some(d => d === "")}
                                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {pinLoading ? (
                                    <><Loader2 size={14} className="animate-spin" /> Verifying...</>
                                ) : (
                                    <><ShieldOff size={14} /> Remove from Vault</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default PrivateVault;