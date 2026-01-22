import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    Baby,
    ClipboardList,
    FileText,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Utensils,
    Target,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { User } from '@/types/models';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    active?: boolean;
    children?: NavItem[];
}

const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Parents', href: '/parents', icon: <Users className="h-5 w-5" /> },
    { label: 'Children', href: '/children', icon: <Baby className="h-5 w-5" /> },
    {
        label: 'PMT',
        href: '/pmt',
        icon: <ClipboardList className="h-5 w-5" />,
        children: [
            { label: 'Programs', href: '/pmt/programs', icon: <Target className="h-4 w-4" /> },
            { label: 'Laporan', href: '/pmt/reports', icon: <BarChart3 className="h-4 w-4" /> },
        ],
    },
    { label: 'ASQ-3 Screenings', href: '/screenings', icon: <FileText className="h-5 w-5" /> },
    { label: 'Reports', href: '/reports', icon: <BarChart3 className="h-5 w-5" /> },
    { label: 'Kelola Makanan', href: '/foods', icon: <Utensils className="h-5 w-5" /> },
];

const bottomNavItems: NavItem[] = [
    { label: 'Settings', href: '/settings', icon: <Settings className="h-5 w-5" /> },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage<{ auth: { user: User | null } }>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState<string[]>(() => {
        // Auto-expand PMT menu if on PMT pages
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/pmt')) {
            return ['/pmt'];
        }
        return [];
    });
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sidebarCollapsed') === 'true';
        }
        return false;
    });

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
    }, [sidebarCollapsed]);

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const toggleMenu = (href: string) => {
        setExpandedMenus((prev) =>
            prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
        );
    };

    const isMenuExpanded = (href: string) => expandedMenus.includes(href);

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 transform bg-sidebar transition-all duration-300 ease-in-out lg:translate-x-0",
                    sidebarCollapsed ? "lg:w-[72px]" : "w-64",
                    sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Logo & Collapse Toggle */}
                    <div className="flex h-16 items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                            <Link href="/dashboard" className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                                    <Baby className="h-5 w-5" />
                                </div>
                                {(!sidebarCollapsed || sidebarOpen) && (
                                    <span className="text-lg font-bold text-foreground tracking-tight">JagoanBunda</span>
                                )}
                            </Link>
                        </div>
                        <div className="flex items-center gap-1">
                            {/* Desktop collapse toggle */}
                            <button
                                className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sidebar-accent transition-colors"
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            >
                                <ChevronLeft className={cn(
                                    "h-4 w-4 text-muted-foreground transition-transform duration-300",
                                    sidebarCollapsed && "rotate-180"
                                )} />
                            </button>
                            {/* Mobile close button */}
                            <button
                                className="lg:hidden"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 p-4">
                        {navItems.map((item) => {
                            // Check if item has children (expandable menu)
                            if (item.children && item.children.length > 0) {
                                const isExpanded = isMenuExpanded(item.href);
                                const isChildActive = item.children.some(child => currentPath === child.href || currentPath.startsWith(child.href + '/'));
                                const isParentActive = currentPath === item.href || isChildActive;

                                return (
                                    <div key={item.href}>
                                        <button
                                            onClick={() => toggleMenu(item.href)}
                                            className={cn(
                                                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                                sidebarCollapsed && !sidebarOpen && "lg:justify-center lg:px-2",
                                                isParentActive
                                                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                                            )}
                                            title={sidebarCollapsed ? item.label : undefined}
                                        >
                                            {item.icon}
                                            {(!sidebarCollapsed || sidebarOpen) && (
                                                <>
                                                    <span className="flex-1 text-left">{item.label}</span>
                                                    <ChevronRight className={cn(
                                                        "h-4 w-4 transition-transform duration-200",
                                                        isExpanded && "rotate-90"
                                                    )} />
                                                </>
                                            )}
                                        </button>
                                        {/* Submenu */}
                                        {isExpanded && (!sidebarCollapsed || sidebarOpen) && (
                                            <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                                                {item.children.map((child) => (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        className={cn(
                                                            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                                                            currentPath === child.href || currentPath.startsWith(child.href + '/')
                                                                ? "bg-primary/10 text-primary font-medium"
                                                                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                                                        )}
                                                    >
                                                        {child.icon}
                                                        {child.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            // Regular nav item (no children)
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        sidebarCollapsed && !sidebarOpen && "lg:justify-center lg:px-2",
                                        currentPath.startsWith(item.href)
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                            : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                                    )}
                                    title={sidebarCollapsed ? item.label : undefined}
                                >
                                    {item.icon}
                                    {(!sidebarCollapsed || sidebarOpen) && item.label}
                                </Link>
                            );
                        })}
                    </nav>


                    {/* Bottom nav items */}
                    <div className="p-4 space-y-1">
                        {bottomNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    sidebarCollapsed && !sidebarOpen && "lg:justify-center lg:px-2",
                                    currentPath.startsWith(item.href)
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                                title={sidebarCollapsed ? item.label : undefined}
                            >
                                {item.icon}
                                {(!sidebarCollapsed || sidebarOpen) && item.label}
                            </Link>
                        ))}
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className={cn(
                                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors",
                                sidebarCollapsed && !sidebarOpen && "lg:justify-center lg:px-2"
                            )}
                            title={sidebarCollapsed ? 'Logout' : undefined}
                        >
                            <LogOut className="h-5 w-5" />
                            {(!sidebarCollapsed || sidebarOpen) && 'Logout'}
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className={cn(
                "transition-all duration-300",
                sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64"
            )}>
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 bg-background/80 backdrop-blur-md px-4 lg:px-8">
                    <button
                        className="lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div className="flex-1">
                        {/* Title or Breadcrumbs could go here */}
                    </div>

                    <div className="ml-auto flex items-center gap-4">
                        {/* Notifications */}
                        <Button variant="ghost" size="icon" className="relative hover:bg-secondary/50">
                            <Bell className="h-5 w-5 text-muted-foreground" />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
                        </Button>

                        {/* User menu */}
                        <div className="relative">
                            <button
                                className="flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-3 shadow-sm hover:bg-secondary/50 transition-colors"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                            >
                                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                                    {auth?.user?.full_name?.charAt(0) || 'A'}
                                </div>
                                <span className="hidden sm:block text-sm font-medium ml-1">
                                    Account
                                </span>
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 rounded-md border bg-card shadow-lg">
                                    <div className="p-2">
                                        <Link
                                            href="/profile"
                                            className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
                                        >
                                            Profile
                                        </Link>
                                        <Link
                                            href="/settings"
                                            className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
                                        >
                                            Settings
                                        </Link>
                                        <hr className="my-2" />
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            className="block w-full text-left rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                                        >
                                            Logout
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-6">
                    {children}
                </main>
            </div>

            {/* Mobile bottom navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card lg:hidden">
                <div className="flex items-center justify-around h-16">
                    <Link
                        href="/dashboard"
                        className={cn(
                            "flex flex-col items-center gap-1 px-3 py-2",
                            currentPath === '/dashboard' ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        <LayoutDashboard className="h-5 w-5" />
                        <span className="text-xs">Home</span>
                    </Link>
                    <Link
                        href="/parents"
                        className={cn(
                            "flex flex-col items-center gap-1 px-3 py-2",
                            currentPath.startsWith('/parents') ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        <Users className="h-5 w-5" />
                        <span className="text-xs">Parents</span>
                    </Link>
                    <Link
                        href="/children"
                        className={cn(
                            "flex flex-col items-center gap-1 px-3 py-2 -mt-4",
                            currentPath.startsWith('/children') ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                            <Baby className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <span className="text-xs mt-1">Children</span>
                    </Link>
                    <Link
                        href="/pmt"
                        className={cn(
                            "flex flex-col items-center gap-1 px-3 py-2",
                            currentPath.startsWith('/pmt') ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        <ClipboardList className="h-5 w-5" />
                        <span className="text-xs">Programs</span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="text-xs">More</span>
                    </button>
                </div>
            </nav>

            {/* Add padding for mobile nav */}
            <div className="h-16 lg:hidden" />
        </div>
    );
}
