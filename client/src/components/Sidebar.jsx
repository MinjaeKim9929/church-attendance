import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Home, Users, Calendar, Settings, LogOut, Menu, X, Sun, Moon, Monitor, Globe } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function Sidebar() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const location = useLocation();
	const { user, logout } = useAuth();
	const [preferences, setPreferences] = useState(null);

	useEffect(() => {
		const fetchPreferences = async () => {
			try {
				const response = await axios.get(`${API_URL}/auth/settings`, {
					withCredentials: true,
				});
				if (response.data.preferences) {
					setPreferences(response.data.preferences);
				}
			} catch (error) {
				console.error('Failed to fetch preferences:', error);
				// Set default values on error
				setPreferences({
					theme: 'light',
					language: 'ko',
				});
			}
		};

		if (user) {
			fetchPreferences();
		}
	}, [user]);

	const handleLogout = async () => {
		try {
			await logout();
		} catch (error) {
			console.error('Logout error:', error);
		}
	};

	const updatePreference = async (key, value) => {
		if (!preferences) return;

		try {
			const updatedPreferences = { ...preferences, [key]: value };
			setPreferences(updatedPreferences);

			await axios.put(
				`${API_URL}/auth/settings`,
				{
					preferences: updatedPreferences,
				},
				{
					withCredentials: true,
				}
			);
		} catch (error) {
			console.error('Failed to update preference:', error);
			// Revert on error
			setPreferences(preferences);
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
						<h1 className="text-lg font-semibold text-gray-900">런던 성 김대건 성당</h1>
						<p className="text-xs text-gray-500">주일학교 2025-26</p>
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

				{/* Preferences */}
				{preferences && (
					<div className="px-4 py-3 border-t border-gray-200">
						<div className="flex items-center justify-between gap-3">
							{/* Theme Selector */}
							<div className="flex items-center gap-1.5">
								<button
									onClick={() => updatePreference('theme', 'light')}
									className={`flex items-center justify-center p-1.5 rounded transition-all hover:cursor-pointer ${
										preferences.theme === 'light'
											? 'bg-blue-600 text-white'
											: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
									}`}
									title="라이트 모드 (Light Mode)"
								>
									<Sun className="w-3.5 h-3.5" />
								</button>
								<button
									onClick={() => updatePreference('theme', 'dark')}
									className={`flex items-center justify-center p-1.5 rounded transition-all hover:cursor-pointer ${
										preferences.theme === 'dark'
											? 'bg-blue-600 text-white'
											: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
									}`}
									title="다크 모드 (Dark Mode)"
								>
									<Moon className="w-3.5 h-3.5" />
								</button>
								<button
									onClick={() => updatePreference('theme', 'auto')}
									className={`flex items-center justify-center p-1.5 rounded transition-all hover:cursor-pointer ${
										preferences.theme === 'auto'
											? 'bg-blue-600 text-white'
											: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
									}`}
									title="자동 (시스템 설정에 따름)"
								>
									<Monitor className="w-3.5 h-3.5" />
								</button>
							</div>

							{/* Divider */}
							<div className="h-6 w-px bg-gray-300"></div>

							{/* Language Selector */}
							<div className="flex items-center gap-1.5">
								<button
									onClick={() => updatePreference('language', 'ko')}
									className={`px-2 py-1 rounded text-xs font-medium transition-all hover:cursor-pointer ${
										preferences.language === 'ko'
											? 'bg-blue-600 text-white'
											: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
									}`}
									title="한국어 (Korean)"
								>
									KO
								</button>
								<button
									onClick={() => updatePreference('language', 'en')}
									className={`px-2 py-1 rounded text-xs font-medium transition-all hover:cursor-pointer ${
										preferences.language === 'en'
											? 'bg-blue-600 text-white'
											: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
									}`}
									title="영어 (English)"
								>
									EN
								</button>
							</div>
						</div>
					</div>
				)}

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
