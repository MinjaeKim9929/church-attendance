import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/useAuth';
import Toast from '../../components/Toast';

export default function SignUpPage() {
	const { user, signup, isLoading: authLoading, error: authError, clearError } = useAuth();
	const navigate = useNavigate();

	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [errors, setErrors] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
	const [touched, setTouched] = useState({ fullName: false, email: false, password: false, confirmPassword: false });
	const [toast, setToast] = useState(null);

	const validateEmail = (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	// Redirect to dashboard if user is already logged in
	useEffect(() => {
		if (!authLoading && user) {
			navigate('/dashboard');
		}
	}, [user, authLoading, navigate]);

	const validateField = (fieldName, value) => {
		let error = '';

		switch (fieldName) {
			case 'fullName':
				if (!value.trim()) {
					error = 'Full name is required';
				}
				break;
			case 'email':
				if (!value.trim()) {
					error = 'Email address is required';
				} else if (!validateEmail(value)) {
					error = 'Please enter a valid email address';
				}
				break;
			case 'password':
				if (!value) {
					error = 'Password is required';
				} else if (value.length < 8) {
					error = 'Password must be at least 8 characters long';
				}
				break;
			case 'confirmPassword':
				if (!value) {
					error = 'Please confirm your password';
				} else if (password && value !== password) {
					error = 'Passwords do not match';
				}
				break;
		}

		return error;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		clearError();

		const newErrors = {
			fullName: validateField('fullName', fullName),
			email: validateField('email', email),
			password: validateField('password', password),
			confirmPassword: validateField('confirmPassword', confirmPassword),
		};

		setErrors(newErrors);
		setTouched({ fullName: true, email: true, password: true, confirmPassword: true });

		// If there are no errors, proceed with signup
		if (!newErrors.fullName && !newErrors.email && !newErrors.password && !newErrors.confirmPassword) {
			try {
				await signup({ fullName, email, password });
				setToast({
					message: '회원가입 성공! 대시보드로 이동합니다.',
					type: 'success',
				});
				setTimeout(() => navigate('/dashboard'), 500);
			} catch (error) {
				console.error('Signup error:', error);
				setToast({
					message: error.message || '회원가입에 실패했습니다.',
					type: 'error',
				});
			}
		}
	};

	const handleBlur = (fieldName, value) => {
		setTouched({ ...touched, [fieldName]: true });
		// Validate all rules on blur (including format and length validation)
		const error = validateField(fieldName, value);
		setErrors({ ...errors, [fieldName]: error });
	};

	const handleFullNameChange = (e) => {
		setFullName(e.target.value);
		// Clear error when user starts typing
		if (errors.fullName) {
			setErrors({ ...errors, fullName: '' });
		}
		if (authError) {
			clearError();
		}
	};

	const handleEmailChange = (e) => {
		setEmail(e.target.value);
		// Clear error when user starts typing
		if (errors.email) {
			setErrors({ ...errors, email: '' });
		}
		if (authError) {
			clearError();
		}
	};

	const handlePasswordChange = (e) => {
		setPassword(e.target.value);
		// Clear error when user starts typing
		if (errors.password) {
			setErrors({ ...errors, password: '' });
		}
		// Clear confirm password error if it exists
		if (errors.confirmPassword) {
			setErrors((prev) => ({ ...prev, confirmPassword: '' }));
		}
		if (authError) {
			clearError();
		}
	};

	const handleConfirmPasswordChange = (e) => {
		setConfirmPassword(e.target.value);
		// Clear error when user starts typing
		if (errors.confirmPassword) {
			setErrors({ ...errors, confirmPassword: '' });
		}
		if (authError) {
			clearError();
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
			<div className="w-full max-w-md">
				<div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 border border-gray-100">
					{/* Header */}
					<div className="text-center mb-3 sm:mb-5">
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
						<h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Create Account</h1>
					</div>

					{/* Toast Notification */}
					{toast && (
						<Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} duration={3000} />
					)}

					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
						<div>
							<label htmlFor="fullName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
								Full Name
							</label>
							<input
								type="text"
								id="fullName"
								value={fullName}
								onChange={handleFullNameChange}
								onBlur={() => handleBlur('fullName', fullName)}
								disabled={authLoading}
								className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg transition-all outline-none disabled:bg-gray-50 disabled:cursor-not-allowed ${
									errors.fullName && touched.fullName
										? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent'
										: 'border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent'
								}`}
								placeholder="John Doe"
							/>
							{errors.fullName && touched.fullName && (
								<p className="mt-1.5 text-xs sm:text-sm text-red-600">{errors.fullName}</p>
							)}
						</div>

						<div>
							<label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
								Email Address
							</label>
							<input
								type="email"
								id="email"
								value={email}
								onChange={handleEmailChange}
								onBlur={() => handleBlur('email', email)}
								disabled={authLoading}
								className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg transition-all outline-none disabled:bg-gray-50 disabled:cursor-not-allowed ${
									errors.email && touched.email
										? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent'
										: 'border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent'
								}`}
								placeholder="your.email@example.com"
							/>
							{errors.email && touched.email && (
								<p className="mt-1.5 text-xs sm:text-sm text-red-600">{errors.email}</p>
							)}
						</div>

						<div>
							<label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
								Password
							</label>
							<input
								type="password"
								id="password"
								value={password}
								onChange={handlePasswordChange}
								onBlur={() => handleBlur('password', password)}
								disabled={authLoading}
								className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 sm:pr-12 text-sm sm:text-base border rounded-lg transition-all outline-none disabled:bg-gray-50 disabled:cursor-not-allowed ${
									errors.password && touched.password
										? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent'
										: 'border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent'
								}`}
								placeholder="Create a password"
							/>
							{errors.password && touched.password && (
								<p className="mt-1.5 text-xs sm:text-sm text-red-600">{errors.password}</p>
							)}
						</div>

						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
							>
								Confirm Password
							</label>
							<input
								type="password"
								id="confirmPassword"
								value={confirmPassword}
								onChange={handleConfirmPasswordChange}
								onBlur={() => handleBlur('confirmPassword', confirmPassword)}
								disabled={authLoading}
								className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 sm:pr-12 text-sm sm:text-base border rounded-lg transition-all outline-none disabled:bg-gray-50 disabled:cursor-not-allowed ${
									errors.confirmPassword && touched.confirmPassword
										? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent'
										: 'border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent'
								}`}
								placeholder="Re-enter your password"
							/>
							{errors.confirmPassword && touched.confirmPassword && (
								<p className="mt-1.5 text-xs sm:text-sm text-red-600">{errors.confirmPassword}</p>
							)}
						</div>

						<button
							type="submit"
							disabled={authLoading}
							className="w-full bg-primary-600 hover:bg-primary-700 hover:cursor-pointer text-white font-medium py-2 sm:py-2.5 text-sm sm:text-base rounded-lg transition-colors shadow-sm hover:shadow-md mt-2 disabled:bg-primary-400 disabled:cursor-not-allowed"
						>
							{authLoading ? 'Creating Account...' : 'Create Account'}
						</button>
					</form>

					{/* Footer */}
					<div className="mt-5 sm:mt-6 text-center">
						<p className="text-xs sm:text-sm text-gray-600">
							Already have an account?{' '}
							<a
								href="/login"
								className="text-primary-600 hover:text-primary-700 hover:underline font-medium transition-colors"
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
