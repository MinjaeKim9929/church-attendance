import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Home, Users, Calendar, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/useAuth';

export default function Sidebar() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const location = useLocation();
	const { user, logout } = useAuth();

	const handleLogout = async () => {
		try {
			await logout();
		} catch (error) {
			console.error('Logout error:', error);
		}
	};

	const navigationItems = [
		{
			name: '대시보드',
			path: '/dashboard',
			icon: Home,
		},
		{
			name: '학생 관리',
			path: '/dashboard/students',
			icon: Users,
		},
		{
			name: '출석 관리',
			path: '/dashboard/attendance',
			icon: Calendar,
		},
		{
			name: '설정',
			path: '/dashboard/settings',
			icon: Settings,
		},
	];

	const isActive = (path) => {
		return location.pathname === path;
	};

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
	};

	return (
		<>
			{/* Mobile Menu Button */}
			<button
				onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
				className="lg:hidden fixed top-4 left-4 z-50 p-2 mb-4 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
				aria-label="메뉴 토글"
			>
				{isMobileMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
			</button>

			{/* Backdrop with blur for mobile */}
			{isMobileMenuOpen && (
				<div className="lg:hidden fixed inset-0 backdrop-blur-sm bg-white/30 z-30" onClick={closeMobileMenu} />
			)}

			{/* Sidebar */}
			<div
				className={`fixed lg:static inset-y-0 left-0 z-40 flex flex-col h-screen w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
					isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
				}`}
			>
				{/* Header */}
				<div className="flex items-center gap-3 p-6 pt-24 lg:pt-6 border-b border-gray-200">
					<div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
						<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
							/>
						</svg>
					</div>
					<div>
						<h1 className="text-lg font-semibold text-gray-900">출석 관리</h1>
						<p className="text-xs text-gray-500">시스템</p>
					</div>
				</div>

				{/* User Info */}
				{user && (
					<div className="p-4 border-b border-gray-200">
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
								<span className="text-sm font-medium text-blue-600">{user.fullName?.charAt(0).toUpperCase()}</span>
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
								<p className="text-xs text-gray-500 truncate">{user.email}</p>
							</div>
						</div>
					</div>
				)}

				{/* Navigation */}
				<nav className="flex-1 p-4 space-y-1 overflow-y-auto">
					{navigationItems.map((item) => {
						const Icon = item.icon;
						const active = isActive(item.path);

						return (
							<Link
								key={item.path}
								to={item.path}
								onClick={closeMobileMenu}
								className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
									active ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
								}`}
							>
								<Icon className="w-5 h-5" />
								<span className="font-medium text-sm">{item.name}</span>
							</Link>
						);
					})}
				</nav>

				{/* Logout Button */}
				<div className="p-4 border-t border-gray-200">
					<button
						onClick={() => {
							handleLogout();
							closeMobileMenu();
						}}
						className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 hover:cursor-pointer rounded-lg transition-colors"
					>
						<LogOut className="w-5 h-5" />
						<span className="font-medium text-sm">로그아웃</span>
					</button>
				</div>
			</div>
		</>
	);
}
