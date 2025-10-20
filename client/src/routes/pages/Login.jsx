import { useState, useEffect } from 'react';
import { EyeClosed, Eye } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useNavigate } from 'react-router';
import Toast from '../../components/Toast';

export default function Login() {
	const { user, login, isLoading: authLoading, error: authError, clearError } = useAuth();
	const navigate = useNavigate();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);
	const [errors, setErrors] = useState({ email: '', password: '' });
	const [toast, setToast] = useState(null);

	const validateEmail = (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	useEffect(() => {
		const savedEmail = localStorage.getItem('rememberedEmail');
		if (savedEmail) setEmail(savedEmail);
	}, []);

	// Redirect to dashboard if user is already logged in
	useEffect(() => {
		if (!authLoading && user) {
			navigate('/dashboard');
		}
	}, [user, authLoading, navigate]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		clearError();

		const newErrors = { email: '', password: '' };

		// Check if email is empty
		if (!email.trim()) {
			newErrors.email = '이메일 주소를 입력해주세요';
		}
		// Check if email format is valid
		else if (!validateEmail(email)) {
			newErrors.email = '올바른 이메일 주소를 입력해주세요';
		}

		// Check if password is empty
		if (!password) {
			newErrors.password = '비밀번호를 입력해주세요';
		}

		if (rememberMe) {
			localStorage.setItem('rememberedEmail', email);
		} else {
			localStorage.removeItem('rememberedEmail');
		}

		setErrors(newErrors);

		// If there are no errors, proceed with login
		if (!newErrors.email && !newErrors.password) {
			console.log('Login attempt: ', { email, password });
			try {
				await login({ email, password, rememberMe });
				setToast({
					message: '로그인 성공! 대시보드로 이동합니다.',
					type: 'success',
				});
				setTimeout(() => navigate('/dashboard'), 500);
			} catch (error) {
				console.error('Login error:', error);
				setToast({
					message: error.message || '로그인에 실패했습니다.',
					type: 'error',
				});
			}
		}
	};

	// Clear error when user starts typing
	const handleEmailChange = (e) => {
		setEmail(e.target.value);
		if (errors.email) {
			setErrors({ ...errors, email: '' });
		}
		if (authError) {
			clearError();
		}
	};

	const handlePasswordChange = (e) => {
		setPassword(e.target.value);
		if (errors.password) {
			setErrors({ ...errors, password: '' });
		}
		if (authError) {
			clearError();
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary-100 via-white to-primary-200 flex items-center justify-center p-4 sm:p-6 lg:p-8">
			<div className="w-full max-w-md">
				<div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 border border-gray-100">
					{/* Header */}
					<div className="text-center mb-6 sm:mb-8">
						<div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary-500 rounded-full mb-3 sm:mb-4">
							<svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
								/>
							</svg>
						</div>
						<h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">출석 관리 시스템</h1>
						<p className="text-gray-600 text-xs sm:text-sm">로그인하여 계정에 접속하세요</p>
					</div>

					{/* Toast Notification */}
					{toast && (
						<Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} duration={3000} />
					)}

					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
						<div>
							<label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
								이메일 주소
							</label>
							<input
								type="email"
								id="email"
								value={email}
								onChange={handleEmailChange}
								disabled={authLoading}
								className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg transition-all outline-none disabled:bg-gray-50 disabled:cursor-not-allowed ${
									errors.email
										? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent'
										: 'border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent'
								}`}
								placeholder="your.email@example.com"
							/>
							{errors.email && <p className="mt-1.5 text-xs sm:text-sm text-red-600">{errors.email}</p>}
						</div>

						<div>
							<label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
								비밀번호
							</label>
							<div className="relative">
								<input
									type={showPassword ? 'text' : 'password'}
									id="password"
									value={password}
									onChange={handlePasswordChange}
									disabled={authLoading}
									className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 sm:pr-12 text-sm sm:text-base border rounded-lg transition-all outline-none disabled:bg-gray-50 disabled:cursor-not-allowed ${
										errors.password
											? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent'
											: 'border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent'
									}`}
									placeholder="비밀번호를 입력하세요"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									disabled={authLoading}
									className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1 disabled:opacity-50"
									aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
								>
									{showPassword ? (
										<EyeClosed className="w-4 h-4 sm:w-5 sm:h-5" />
									) : (
										<Eye className="w-4 h-4 sm:w-5 sm:h-5" />
									)}
								</button>
							</div>
							{errors.password && <p className="mt-1.5 text-xs sm:text-sm text-red-600">{errors.password}</p>}
						</div>

						<div className="flex items-center justify-between text-xs sm:text-sm">
							<label className="flex items-center cursor-pointer">
								<input
									type="checkbox"
									checked={rememberMe}
									onChange={(e) => setRememberMe(e.target.checked)}
									className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
									disabled={authLoading}
								/>
								<span className="ml-1.5 sm:ml-2 text-gray-600">로그인 상태 유지</span>
							</label>
						</div>

						<button
							type="submit"
							disabled={authLoading}
							className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 sm:py-2.5 text-sm sm:text-base rounded-lg transition-colors shadow-sm hover:shadow-md hover:cursor-pointer disabled:bg-primary-400 disabled:cursor-not-allowed"
						>
							로그인
						</button>
					</form>

					{/* Footer */}
					<div className="mt-5 sm:mt-6 text-center">
						<p className="text-xs sm:text-sm text-gray-600">
							계정이 없으신가요?{' '}
							<a
								href="/signup"
								className="text-primary-600 hover:text-primary-700 hover:underline font-medium transition-colors"
							>
								회원가입
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
