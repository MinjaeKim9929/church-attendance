import { useState, useEffect } from 'react';
import { useBlocker } from 'react-router';
import axios from 'axios';
import { Save, Plus, Trash2, AlertTriangle } from 'lucide-react';
import Sidebar from '../../../../components/Sidebar';
import Toast from '../../../../components/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const AVAILABLE_GRADES = ['JK', 'SK', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export default function Settings() {
	const [schoolYear, setSchoolYear] = useState('');
	const [classes, setClasses] = useState([]);
	const [originalClasses, setOriginalClasses] = useState([]);
	const [userSettings, setUserSettings] = useState({
		fullName: '',
		email: '',
		phone: '',
		preferences: {
			theme: 'light',
			language: 'ko',
		},
	});
	const [originalUserSettings, setOriginalUserSettings] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [toast, setToast] = useState(null);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [showNavigationModal, setShowNavigationModal] = useState(false);
	const [blockedNavigation, setBlockedNavigation] = useState(null);

	// Block navigation if there are unsaved changes
	const blocker = useBlocker(
		({ currentLocation, nextLocation }) => hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
	);

	useEffect(() => {
		if (blocker.state === 'blocked') {
			setShowNavigationModal(true);
			setBlockedNavigation(blocker);
		}
	}, [blocker]);

	useEffect(() => {
		fetchSettings();

		// Listen for preference updates from Sidebar
		const handlePreferencesUpdate = (event) => {
			if (event.detail) {
				setUserSettings((prev) => ({
					...prev,
					preferences: event.detail,
				}));
			}
		};

		window.addEventListener('preferencesUpdated', handlePreferencesUpdate);
		return () => {
			window.removeEventListener('preferencesUpdated', handlePreferencesUpdate);
		};
	}, []);

	useEffect(() => {
		// Check if there are unsaved changes
		const classesChanged = JSON.stringify(classes) !== JSON.stringify(originalClasses);
		const userSettingsChanged = JSON.stringify(userSettings) !== JSON.stringify(originalUserSettings);
		setHasUnsavedChanges(classesChanged || userSettingsChanged);
	}, [classes, originalClasses, userSettings, originalUserSettings]);

	const fetchSettings = async () => {
		try {
			setIsLoading(true);

			// Get user settings
			const userResponse = await axios.get(`${API_URL}/auth/settings`, {
				withCredentials: true,
			});
			const userData = {
				fullName: userResponse.data.fullName,
				email: userResponse.data.email,
				phone: userResponse.data.phone || '',
				preferences: userResponse.data.preferences,
			};
			setUserSettings(userData);
			setOriginalUserSettings(JSON.parse(JSON.stringify(userData)));

			// Get current school year
			const yearResponse = await axios.get(`${API_URL}/class-config/current/year`, {
				withCredentials: true,
			});
			setSchoolYear(yearResponse.data.schoolYear);

			// Get class configuration
			try {
				const configResponse = await axios.get(`${API_URL}/class-config/current`, {
					withCredentials: true,
				});
				setClasses(configResponse.data.classes);
				setOriginalClasses(JSON.parse(JSON.stringify(configResponse.data.classes)));
			} catch (configErr) {
				if (configErr.response?.status === 404) {
					// No configuration exists yet, start with empty
					setClasses([]);
					setOriginalClasses([]);
				} else {
					throw configErr;
				}
			}
		} catch (err) {
			setToast({
				message: err.response?.data?.message || '설정을 불러오는데 실패했습니다',
				type: 'error',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleAddClass = () => {
		const newClass = {
			className: '',
			grades: [],
		};
		setClasses([...classes, newClass]);
	};

	const handleRemoveClass = (index) => {
		const updatedClasses = classes.filter((_, i) => i !== index);
		setClasses(updatedClasses);
	};

	const handleClassNameChange = (index, value) => {
		const updatedClasses = [...classes];
		updatedClasses[index].className = value;
		setClasses(updatedClasses);
	};

	const handleGradeToggle = (classIndex, grade) => {
		const updatedClasses = [...classes];
		const gradeIndex = updatedClasses[classIndex].grades.indexOf(grade);

		if (gradeIndex > -1) {
			// Remove grade
			updatedClasses[classIndex].grades.splice(gradeIndex, 1);
		} else {
			// Add grade
			updatedClasses[classIndex].grades.push(grade);
		}

		setClasses(updatedClasses);
	};

	const handleSave = async () => {
		// Validation for class configuration
		for (const classInfo of classes) {
			if (!classInfo.className.trim()) {
				setToast({
					message: '반 이름을 입력해주세요',
					type: 'error',
				});
				return;
			}
			if (classInfo.grades.length === 0) {
				setToast({
					message: '각 반에 최소 하나의 학년을 선택해주세요',
					type: 'error',
				});
				return;
			}
		}

		// Validation for user settings
		if (!userSettings.fullName.trim()) {
			setToast({
				message: '이름을 입력해주세요',
				type: 'error',
			});
			return;
		}

		setIsSaving(true);
		try {
			// Save user settings
			await axios.put(
				`${API_URL}/auth/settings`,
				{
					fullName: userSettings.fullName,
					phone: userSettings.phone,
					preferences: userSettings.preferences,
				},
				{
					withCredentials: true,
				}
			);

			// Dispatch event to notify Sidebar of saved preferences
			window.dispatchEvent(
				new CustomEvent('preferencesUpdated', {
					detail: userSettings.preferences,
				})
			);

			// Save class configuration
			if (classes.length > 0) {
				await axios.post(
					`${API_URL}/class-config`,
					{
						schoolYear,
						classes,
					},
					{
						withCredentials: true,
					}
				);
			}

			setOriginalClasses(JSON.parse(JSON.stringify(classes)));
			setOriginalUserSettings(JSON.parse(JSON.stringify(userSettings)));
			setToast({
				message: '설정이 성공적으로 저장되었습니다!',
				type: 'success',
			});
		} catch (err) {
			setToast({
				message: err.response?.data?.message || '설정 저장에 실패했습니다',
				type: 'error',
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handleDiscardChanges = () => {
		setClasses(JSON.parse(JSON.stringify(originalClasses)));
		setUserSettings(JSON.parse(JSON.stringify(originalUserSettings)));
		setShowNavigationModal(false);
		if (blockedNavigation) {
			blockedNavigation.proceed();
		}
	};

	const handleCancelNavigation = () => {
		setShowNavigationModal(false);
		if (blockedNavigation) {
			blockedNavigation.reset();
		}
	};

	if (isLoading) {
		return (
			<div className="flex h-screen bg-gray-50">
				<Sidebar />
				<main className="flex-1 overflow-y-auto">
					<div className="p-6 sm:p-8 lg:pl-8 pt-20 lg:pt-7">
						<div className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
						</div>
					</div>
				</main>
			</div>
		);
	}

	return (
		<div className="flex h-screen bg-gray-50">
			<Sidebar />
			<main className="flex-1 overflow-y-auto">
				<div className="p-6 sm:p-8 lg:pl-12 pt-20 lg:pt-12 lg:pr-12 max-w-7xl mx-auto">
					{/* Header */}
					<div className="mb-6">
						<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">설정</h1>
						<p className="text-sm text-gray-600">
							학년도: <span className="font-semibold">{schoolYear}</span>
						</p>
					</div>

					{/* Toast Notification */}
					{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} duration={3000} />}

					{/* User Settings */}
					<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-6">사용자 설정</h2>

						<div className="space-y-6">
							{/* Full Name */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
								<input
									type="text"
									value={userSettings.fullName}
									onChange={(e) => setUserSettings({ ...userSettings, fullName: e.target.value })}
									placeholder="이름을 입력하세요"
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
								/>
							</div>

							{/* Email (Read-only) */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
								<input
									type="email"
									value={userSettings.email}
									disabled
									className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
								/>
								<p className="text-xs text-gray-500 mt-1">이메일은 변경할 수 없습니다</p>
							</div>

							{/* Phone */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									전화번호
								</label>
								<input
									type="tel"
									value={userSettings.phone}
									onChange={(e) => setUserSettings({ ...userSettings, phone: e.target.value })}
									placeholder="전화번호를 입력하세요"
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
								/>
							</div>

							{/* Theme */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									테마
								</label>
								<div className="grid grid-cols-3 gap-3">
									<button
										type="button"
										onClick={() => {
											const updatedSettings = {
												...userSettings,
												preferences: { ...userSettings.preferences, theme: 'light' },
											};
											setUserSettings(updatedSettings);
											// Dispatch event to notify Sidebar
											window.dispatchEvent(
												new CustomEvent('preferencesUpdated', {
													detail: updatedSettings.preferences,
												})
											);
										}}
										className={`px-4 py-3 rounded-lg font-medium text-sm transition-all border-2 hover:cursor-pointer ${
											userSettings.preferences.theme === 'light'
												? 'bg-primary-500 text-white border-primary-500 shadow-md'
												: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
										}`}
									>
										라이트
									</button>
									<button
										type="button"
										onClick={() => {
											const updatedSettings = {
												...userSettings,
												preferences: { ...userSettings.preferences, theme: 'dark' },
											};
											setUserSettings(updatedSettings);
											// Dispatch event to notify Sidebar
											window.dispatchEvent(
												new CustomEvent('preferencesUpdated', {
													detail: updatedSettings.preferences,
												})
											);
										}}
										className={`px-4 py-3 rounded-lg font-medium text-sm transition-all border-2 hover:cursor-pointer ${
											userSettings.preferences.theme === 'dark'
												? 'bg-primary-500 text-white border-primary-500 shadow-md'
												: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
										}`}
									>
										다크
									</button>
									<button
										type="button"
										onClick={() => {
											const updatedSettings = {
												...userSettings,
												preferences: { ...userSettings.preferences, theme: 'auto' },
											};
											setUserSettings(updatedSettings);
											// Dispatch event to notify Sidebar
											window.dispatchEvent(
												new CustomEvent('preferencesUpdated', {
													detail: updatedSettings.preferences,
												})
											);
										}}
										className={`px-4 py-3 rounded-lg font-medium text-sm transition-all border-2 hover:cursor-pointer ${
											userSettings.preferences.theme === 'auto'
												? 'bg-primary-500 text-white border-primary-500 shadow-md'
												: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
										}`}
									>
										자동
									</button>
								</div>
							</div>

							{/* Language */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									언어
								</label>
								<div className="grid grid-cols-2 gap-3">
									<button
										type="button"
										onClick={() => {
											const updatedSettings = {
												...userSettings,
												preferences: { ...userSettings.preferences, language: 'ko' },
											};
											setUserSettings(updatedSettings);
											// Dispatch event to notify Sidebar
											window.dispatchEvent(
												new CustomEvent('preferencesUpdated', {
													detail: updatedSettings.preferences,
												})
											);
										}}
										className={`px-4 py-3 rounded-lg font-medium text-sm transition-all border-2 hover:cursor-pointer ${
											userSettings.preferences.language === 'ko'
												? 'bg-primary-500 text-white border-primary-500 shadow-md'
												: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
										}`}
									>
										한국어
									</button>
									<button
										type="button"
										onClick={() => {
											const updatedSettings = {
												...userSettings,
												preferences: { ...userSettings.preferences, language: 'en' },
											};
											setUserSettings(updatedSettings);
											// Dispatch event to notify Sidebar
											window.dispatchEvent(
												new CustomEvent('preferencesUpdated', {
													detail: updatedSettings.preferences,
												})
											);
										}}
										className={`px-4 py-3 rounded-lg font-medium text-sm transition-all border-2 hover:cursor-pointer ${
											userSettings.preferences.language === 'en'
												? 'bg-primary-500 text-white border-primary-500 shadow-md'
												: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
										}`}
									>
										English
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* Class Configuration */}
					<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-semibold text-gray-900">반 설정</h2>
							<button
								onClick={handleAddClass}
								className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors hover:cursor-pointer"
							>
								<Plus className="w-4 h-4" />
								<span>반 추가</span>
							</button>
						</div>

						{classes.length === 0 ? (
							<div className="text-center py-12 bg-gray-50 rounded-lg">
								<p className="text-gray-500 mb-4">설정된 반이 없습니다</p>
								<button
									onClick={handleAddClass}
									className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors hover:cursor-pointer"
								>
									<Plus className="w-4 h-4" />
									<span>첫 번째 반 추가하기</span>
								</button>
							</div>
						) : (
							<div className="space-y-6">
								{classes.map((classInfo, index) => (
									<div
										key={index}
										className="border border-gray-200 rounded-lg p-4 bg-gray-50"
									>
										<div className="flex items-start justify-between mb-4">
											<div className="flex-1">
												<label className="block text-sm font-medium text-gray-700 mb-2">
													반 이름
												</label>
												<input
													type="text"
													value={classInfo.className}
													onChange={(e) => handleClassNameChange(index, e.target.value)}
													placeholder="예: 유치부, 초등부, 고등부"
													className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
												/>
											</div>
											<button
												onClick={() => handleRemoveClass(index)}
												className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors hover:cursor-pointer"
												title="삭제"
											>
												<Trash2 className="w-5 h-5" />
											</button>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												학년 선택
											</label>
											<div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
												{AVAILABLE_GRADES.map((grade) => (
													<button
														key={grade}
														onClick={() => handleGradeToggle(index, grade)}
														className={`px-3 py-2 rounded-lg font-medium text-sm transition-all hover:cursor-pointer ${
															classInfo.grades.includes(grade)
																? 'bg-primary-500 text-white shadow-md hover:bg-primary-600'
																: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
														}`}
													>
														{grade}
													</button>
												))}
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Save Button */}
					<div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 shadow-sm p-6">
						<div>
							{hasUnsavedChanges && (
								<p className="text-sm text-amber-600 font-medium">
									저장되지 않은 변경사항이 있습니다
								</p>
							)}
						</div>
						<button
							onClick={handleSave}
							disabled={isSaving || !hasUnsavedChanges}
							className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
						>
							{isSaving ? (
								<>
									<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
									<span>저장 중...</span>
								</>
							) : (
								<>
									<Save className="w-5 h-5" />
									<span>저장</span>
								</>
							)}
						</button>
					</div>
				</div>
			</main>

			{/* Navigation Confirmation Modal */}
			{showNavigationModal && (
				<div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
						<div className="flex items-start gap-4 mb-6">
							<div className="p-3 bg-amber-100 rounded-full">
								<AlertTriangle className="w-6 h-6 text-amber-600" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-900 mb-2">
									저장되지 않은 변경사항
								</h3>
								<p className="text-sm text-gray-600">
									변경사항을 저장하지 않고 페이지를 나가시겠습니까? 저장하지 않은 내용은 모두 사라집니다.
								</p>
							</div>
						</div>
						<div className="flex gap-3">
							<button
								onClick={handleCancelNavigation}
								className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors hover:cursor-pointer"
							>
								취소
							</button>
							<button
								onClick={handleDiscardChanges}
								className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors hover:cursor-pointer"
							>
								나가기
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
