import { NavLink } from "react-router-dom";

export default function Sidebar() {

    const navLinkStyles = ({isActive}) => 
        `py-3 px-2 rounded transition-colors ${
            isActive
            ? "bg-accent-primary text-white font-medium"
            : "text-text-secondary hover:bg-bg-hover"
        }`

    return (
        <aside className="w-64 bg-bg-primary border-r border-border-theme h-[calc(100vh-64px)] p-4">
            <nav className="flex flex-col gap-2">

                <NavLink to="/" className={navLinkStyles}>
                    Dashboard
                </NavLink>

                <NavLink to="/graph" className={navLinkStyles}>
                    Knowledge Graph
                </NavLink>

                <NavLink to="/collections" className={navLinkStyles}>
                    Collections
                </NavLink>

            </nav>
        </aside>
    ); 
}