import { useState } from 'react';
import { EyeClosed, Eye } from 'lucide-react';

export default function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log('Login attempt: ', { email, password });
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
			<div className="w-full max-w-md">
				<div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 border border-gray-100">
					{/* Header */}
					<div className="text-center mb-6 sm:mb-8">
						<div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 rounded-full mb-3 sm:mb-4">
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
						<p className="text-gray-600 text-xs sm:text-sm">Sign in to access your account</p>
					</div>

					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
						<div>
							<label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
								Email Address
							</label>
							<input
								type="email"
								id="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
								placeholder="your.email@example.com"
								required
							/>
						</div>

						<div>
							<label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
								Password
							</label>
							<div className="relative">
								<input
									type={showPassword ? 'text' : 'password'}
									id="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 sm:pr-12 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
									placeholder="Enter your password"
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
									aria-label={showPassword ? 'Hide password' : 'Show password'}
								>
									{showPassword ? (
										<EyeClosed className="w-4 h-4 sm:w-5 sm:h-5" />
									) : (
										<Eye className="w-4 h-4 sm:w-5 sm:h-5" />
									)}
								</button>
							</div>
						</div>

						<div className="flex items-center justify-between text-xs sm:text-sm">
							<label className="flex items-center cursor-pointer">
								<input
									type="checkbox"
									className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
								/>
								<span className="ml-1.5 sm:ml-2 text-gray-600">Remember me</span>
							</label>
						</div>

						<button
							type="submit"
							className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 sm:py-2.5 text-sm sm:text-base rounded-lg transition-colors shadow-sm hover:shadow-md hover:cursor-pointer"
						>
							Sign In
						</button>
					</form>

					{/* Footer */}
					<div className="mt-5 sm:mt-6 text-center">
						<p className="text-xs sm:text-sm text-gray-600">
							Don't have an account?{' '}
							<a
								href="/signup"
								className="text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
							>
								Sign up
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
