import { useState } from 'react';
import { X } from 'lucide-react';

export default function AddStudentModal({ onClose, onSubmit }) {
	const [formData, setFormData] = useState({
		fullName: '',
		grade: '',
		gender: '',
	});
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [apiError, setApiError] = useState('');

	const grades = ['JK', 'SK', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
	const genders = ['남자', '여자'];

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
			<div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

			{/* Modal */}
			<div className="flex min-h-full items-center justify-center p-4">
				<div className="relative bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
					{/* Header */}
					<div className="flex items-center justify-between p-6 border-b border-gray-200">
						<h2 className="text-xl font-semibold text-gray-900">새 학생 추가</h2>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600 transition-colors"
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
							{/* Full Name */}
							<div>
								<label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
									이름
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
											: 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									}`}
									placeholder="학생 이름을 입력하세요"
								/>
								{errors.fullName && <p className="mt-1.5 text-sm text-red-600">{errors.fullName}</p>}
							</div>

							{/* Grade */}
							<div>
								<label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1.5">
									학년
								</label>
								<select
									id="grade"
									value={formData.grade}
									onChange={(e) => handleChange('grade', e.target.value)}
									disabled={isSubmitting}
									className={`w-full px-4 py-2.5 border rounded-lg transition-all outline-none disabled:bg-gray-50 disabled:cursor-not-allowed ${
										errors.grade
											? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent'
											: 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
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
								<label className="block text-sm font-medium text-gray-700 mb-2">성별</label>
								<div className="flex gap-4">
									{genders.map((gender) => (
										<label key={gender} className="flex items-center cursor-pointer">
											<input
												type="radio"
												name="gender"
												value={gender}
												checked={formData.gender === gender}
												onChange={(e) => handleChange('gender', e.target.value)}
												disabled={isSubmitting}
												className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-50"
											/>
											<span className="ml-2 text-sm text-gray-700">{gender}</span>
										</label>
									))}
								</div>
								{errors.gender && <p className="mt-1.5 text-sm text-red-600">{errors.gender}</p>}
							</div>
						</div>

						{/* Footer */}
						<div className="flex gap-3 mt-6">
							<button
								type="button"
								onClick={onClose}
								disabled={isSubmitting}
								className="flex-1 px-4 py-2.5 bg-white text-gray-700 font-medium rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								취소
							</button>
							<button
								type="submit"
								disabled={isSubmitting}
								className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md disabled:bg-blue-400 disabled:cursor-not-allowed"
							>
								{isSubmitting ? '추가 중...' : '학생 추가'}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
