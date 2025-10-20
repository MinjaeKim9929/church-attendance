import { useContext } from 'react';
import { Link } from 'react-router';
import { AuthContext } from '../../context/AuthContext';

export default function Home() {
	const { user, isLoading } = useContext(AuthContext);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
			<div className="w-full max-w-md">
				<div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 border border-gray-100">
					{/* Header */}
					<div className="text-center mb-6 sm:mb-8">
						<div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary-600 rounded-full mb-3 sm:mb-4">
							<svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
								/>
							</svg>
						</div>
						<h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Attendance Management</h1>
						{user ? (
							<p className="text-gray-600 text-xs sm:text-sm">Welcome back, {user.fullName}!</p>
						) : (
							<p className="text-gray-600 text-xs sm:text-sm">Get started with your account</p>
						)}
					</div>

					{/* Content */}
					{user ? (
						<div className="space-y-4">
							<Link
								to="/dashboard"
								className="block w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 sm:py-2.5 text-sm sm:text-base rounded-lg transition-colors shadow-sm hover:shadow-md text-center"
							>
								Go to Dashboard
							</Link>
						</div>
					) : (
						<div className="space-y-4">
							<Link
								to="/signup"
								className="block w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 sm:py-2.5 text-sm sm:text-base rounded-lg transition-colors shadow-sm hover:shadow-md text-center"
							>
								Sign Up
							</Link>
							<Link
								to="/login"
								className="block w-full bg-white text-primary-600 font-medium py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-colors shadow-sm hover:shadow-md text-center"
							>
								Log In
							</Link>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
