import { Link } from 'react-router';

export default function NotFound() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
			<div className="w-full max-w-md">
				<div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 border border-gray-100">
					{/* Header */}
					<div className="text-center mb-6 sm:mb-8">
						<div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-red-600 rounded-full mb-3 sm:mb-4">
							<svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
						</div>
						<h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">404</h1>
						<h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
						<p className="text-gray-600 text-xs sm:text-sm">
							The page you're looking for doesn't exist or has been moved.
						</p>
					</div>

					{/* Actions */}
					<div className="space-y-3">
						<Link
							to="/dashboard"
							className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 sm:py-2.5 text-sm sm:text-base rounded-lg transition-colors shadow-sm hover:shadow-md text-center"
						>
							Go to Home
						</Link>
						<button
							onClick={() => window.history.back()}
							className="block w-full bg-white text-gray-700 font-medium py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md text-center cursor-pointer"
						>
							Go Back
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
