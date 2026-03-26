import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Library, Share2, Lock } from 'lucide-react';

export default function BottomNavigation() {

    const navItems = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/collections', label: 'Collections', icon: Library },
        { path: '/graph', label: 'Explore', icon: Share2 },
        { path: '/verify-pin', label: 'Vault', icon: Lock }
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-primary border-t border-border-theme z-[60] pb-safe shadow-[0_-4px_25px_rgba(0,0,0,0.06)] transition-colors duration-300">
            <nav className="flex items-end justify-around h-16 px-2">
                {navItems.map((item, index) => {
                    const Icon = item.icon;
                    
                    return (
                        <NavLink
                            key={index}
                            to={item.path}
                            className={({ isActive }) => `
                                flex flex-col items-center justify-center w-[72px] h-full gap-1.5 transition-colors duration-200 pb-1
                                ${isActive ? 'text-accent-primary' : 'text-text-muted hover:text-text-secondary'}
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    <div className={`transform transition-all duration-300 ease-out ${isActive ? 'scale-110 -translate-y-1' : 'scale-100 active:scale-95'}`}>
                                        <Icon size={22} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
                                    </div>
                                    <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                                        {item.label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
}
