import { useState } from 'react';

export default function SignUpPage() {
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log('Sign up attempt:', { fullName, email, password, confirmPassword });
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
					{/* Header */}
					<div className="text-center mb-8">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
							<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
								/>
							</svg>
						</div>
						<h1 className="text-2xl font-semibold text-gray-900 mb-2">Create Account</h1>
					</div>

					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
								Full Name
							</label>
							<input
								type="text"
								id="fullName"
								value={fullName}
								onChange={(e) => setFullName(e.target.value)}
								className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
								placeholder="John Doe"
								required
							/>
						</div>

						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
								Email Address
							</label>
							<input
								type="email"
								id="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
								placeholder="your.email@example.com"
								required
							/>
						</div>

						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
								Password
							</label>
							<input
								type="text"
								id="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
								placeholder="Create a password"
								required
							/>
						</div>

						<div>
							<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
								Confirm Password
							</label>
							<input
								type="password"
								id="confirmPassword"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
								placeholder="Re-enter your password"
								required
							/>
						</div>

						<button
							type="submit"
							className="w-full bg-blue-600 hover:bg-blue-700 hover:cursor-pointer text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm hover:shadow-md mt-2"
						>
							Create Account
						</button>
					</form>

					{/* Footer */}
					<div className="mt-6 text-center">
						<p className="text-sm text-gray-600">
							Already have an account?{' '}
							<a
								href="/login"
								className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
							>
								Sign in
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
