import { useState } from 'react';
import { X } from 'lucide-react';

export default function AddStudentModal({ onClose, onSubmit, student = null }) {
	const isEditMode = !!student;
	const [formData, setFormData] = useState({
		fullName: student?.fullName || '',
		christianName: student?.christianName || '',
		nameDayMonth: student?.nameDayMonth || '',
		grade: student?.grade || '',
		gender: student?.gender || '',
		motherName: student?.motherName || '',
		motherContact: student?.motherContact || '',
		fatherName: student?.fatherName || '',
		fatherContact: student?.fatherContact || '',
	});
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [apiError, setApiError] = useState('');

	const grades = ['JK', 'SK', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
	const genders = ['남자', '여자'];
	const months = [
		{ value: '1', label: '1월' },
		{ value: '2', label: '2월' },
		{ value: '3', label: '3월' },
		{ value: '4', label: '4월' },
		{ value: '5', label: '5월' },
		{ value: '6', label: '6월' },
		{ value: '7', label: '7월' },
		{ value: '8', label: '8월' },
		{ value: '9', label: '9월' },
		{ value: '10', label: '10월' },
		{ value: '11', label: '11월' },
		{ value: '12', label: '12월' },
	];

	const validate = () => {
		const newErrors = {};

		if (!formData.fullName.trim()) {
			newErrors.fullName = '이름을 입력해주세요';
		}

		if (!formData.grade) {
			newErrors.grade = '학년을 선택해주세요';
		}

		if (!formData.gender) {
			newErrors.gender = '성별을 선택해주세요';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setApiError('');

		if (!validate()) {
			return;
		}

		setIsSubmitting(true);

		try {
			await onSubmit(formData);
			// Modal will be closed by parent component
		} catch (error) {
			setApiError(error.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleChange = (field, value) => {
		setFormData({ ...formData, [field]: value });
		// Clear error when user starts typing/selecting
		if (errors[field]) {
			setErrors({ ...errors, [field]: '' });
		}
		if (apiError) {
			setApiError('');
		}
	};

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			{/* Overlay */}
			<div className="fixed inset-0 backdrop-blur-sm bg-white/30 transition-opacity" onClick={onClose}></div>

			{/* Modal */}
			<div className="flex min-h-full items-center justify-center p-4">
				<div className="relative bg-white rounded-lg shadow-xl w-full max-w-md lg:max-w-3xl transform transition-all">
					{/* Header */}
					<div className="flex items-center justify-between p-6 border-b border-gray-200">
						<h2 className="text-xl font-semibold text-gray-900">{isEditMode ? '학생 정보 수정' : '새 학생 추가'}</h2>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
							aria-label="닫기"
						>
							<X className="w-6 h-6" />
						</button>
					</div>

					{/* Body */}
					<form onSubmit={handleSubmit} className="p-6">
						{/* API Error */}
						{apiError && (
							<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-sm text-red-600">{apiError}</p>
							</div>
						)}

						<div className="space-y-4">
							{/* Student Basic Info - Grid on large screens */}
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
								{/* Full Name */}
								<div>
									<label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
										이름 <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										id="fullName"
										value={formData.fullName}
										onChange={(e) => handleChange('fullName', e.target.value)}
										disabled={isSubmitting}
										className={`w-full px-4 py-2.5 border rounded-lg transition-all outline-none disabled:bg-gray-50 disabled:cursor-not-allowed ${
											errors.fullName
												? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent'
												: 'border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent'
										}`}
										placeholder="학생 이름을 입력하세요"
									/>
									{errors.fullName && <p className="mt-1.5 text-sm text-red-600">{errors.fullName}</p>}
								</div>

								{/* Christian Name */}
								<div>
									<label htmlFor="christianName" className="block text-sm font-medium text-gray-700 mb-1.5">
										세례명
									</label>
									<input
										type="text"
										id="christianName"
										value={formData.christianName}
										onChange={(e) => handleChange('christianName', e.target.value)}
										disabled={isSubmitting}
										className="w-full px-4 py-2.5 border border-gray-300 rounded-lg transition-all outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
										placeholder="세례명을 입력하세요 (선택사항)"
									/>
								</div>

								{/* Name Day Month */}
								<div>
									<label htmlFor="nameDayMonth" className="block text-sm font-medium text-gray-700 mb-1.5">
										축일 (월)
									</label>
									<select
										id="nameDayMonth"
										value={formData.nameDayMonth}
										onChange={(e) => handleChange('nameDayMonth', e.target.value)}
										disabled={isSubmitting}
										className="w-full px-4 py-2.5 border border-gray-300 rounded-lg transition-all outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
									>
										<option value="">축일 월 선택 (선택사항)</option>
										{months.map((month) => (
											<option key={month.value} value={month.value}>
												{month.label}
											</option>
										))}
									</select>
								</div>

								{/* Grade */}
								<div>
									<label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1.5">
										학년 <span className="text-red-500">*</span>
									</label>
									<select
										id="grade"
										value={formData.grade}
										onChange={(e) => handleChange('grade', e.target.value)}
										disabled={isSubmitting}
										className={`w-full px-4 py-2.5 border rounded-lg transition-all outline-none disabled:bg-gray-50 disabled:cursor-not-allowed ${
											errors.grade
												? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent'
												: 'border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent'
										}`}
									>
										<option value="">학년 선택</option>
										{grades.map((grade) => (
											<option key={grade} value={grade}>
												{grade}
											</option>
										))}
									</select>
									{errors.grade && <p className="mt-1.5 text-sm text-red-600">{errors.grade}</p>}
								</div>

								{/* Gender */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1.5">
										성별 <span className="text-red-500">*</span>
									</label>
									<div className="flex gap-3">
										{genders.map((gender) => (
											<label
												key={gender}
												className={`flex-1 flex items-center justify-center px-4 py-2.5 border rounded-lg cursor-pointer transition-all ${
													formData.gender === gender
														? 'border-primary-600 bg-primary-50 text-primary-700'
														: 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
												} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''} ${
													errors.gender ? 'border-red-500' : ''
												}`}
											>
												<input
													type="radio"
													name="gender"
													value={gender}
													checked={formData.gender === gender}
													onChange={(e) => handleChange('gender', e.target.value)}
													disabled={isSubmitting}
													className="sr-only"
												/>
												<span className="text-sm font-medium">{gender}</span>
											</label>
										))}
									</div>
									{errors.gender && <p className="mt-1.5 text-sm text-red-600">{errors.gender}</p>}
								</div>
							</div>

							{/* Parent Information Header */}
							<div className="pt-4 border-t border-gray-200">
								<h3 className="text-base font-semibold text-gray-900 mb-4">부모님 정보</h3>
							</div>

							{/* Parent Info - Grid on large screens */}
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
								{/* Mother Name */}
								<div>
									<label htmlFor="motherName" className="block text-sm font-medium text-gray-700 mb-1.5">
										어머니 성함
									</label>
									<input
										type="text"
										id="motherName"
										value={formData.motherName}
										onChange={(e) => handleChange('motherName', e.target.value)}
										disabled={isSubmitting}
										className="w-full px-4 py-2.5 border border-gray-300 rounded-lg transition-all outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
										placeholder="어머니 성함을 입력하세요 (선택사항)"
									/>
								</div>

								{/* Mother Contact */}
								<div>
									<label htmlFor="motherContact" className="block text-sm font-medium text-gray-700 mb-1.5">
										어머니 연락처
									</label>
									<input
										type="tel"
										id="motherContact"
										value={formData.motherContact}
										onChange={(e) => handleChange('motherContact', e.target.value)}
										disabled={isSubmitting}
										className="w-full px-4 py-2.5 border border-gray-300 rounded-lg transition-all outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
										placeholder="연락처를 입력하세요 (선택사항)"
									/>
								</div>

								{/* Father Name */}
								<div>
									<label htmlFor="fatherName" className="block text-sm font-medium text-gray-700 mb-1.5">
										아버지 성함
									</label>
									<input
										type="text"
										id="fatherName"
										value={formData.fatherName}
										onChange={(e) => handleChange('fatherName', e.target.value)}
										disabled={isSubmitting}
										className="w-full px-4 py-2.5 border border-gray-300 rounded-lg transition-all outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
										placeholder="아버지 성함을 입력하세요 (선택사항)"
									/>
								</div>

								{/* Father Contact */}
								<div>
									<label htmlFor="fatherContact" className="block text-sm font-medium text-gray-700 mb-1.5">
										아버지 연락처
									</label>
									<input
										type="tel"
										id="fatherContact"
										value={formData.fatherContact}
										onChange={(e) => handleChange('fatherContact', e.target.value)}
										disabled={isSubmitting}
										className="w-full px-4 py-2.5 border border-gray-300 rounded-lg transition-all outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
										placeholder="연락처를 입력하세요 (선택사항)"
									/>
								</div>
							</div>
						</div>

						{/* Footer */}
						<div className="flex gap-3 mt-6">
							<button
								type="button"
								onClick={onClose}
								disabled={isSubmitting}
								className="flex-1 px-4 py-2.5 bg-white text-gray-700 font-medium rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
							>
								취소
							</button>
							<button
								type="submit"
								disabled={isSubmitting}
								className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md disabled:bg-primary-400 disabled:cursor-not-allowed cursor-pointer"
							>
								{isEditMode ? (isSubmitting ? '수정 중...' : '수정 완료') : (isSubmitting ? '추가 중...' : '학생 추가')}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
