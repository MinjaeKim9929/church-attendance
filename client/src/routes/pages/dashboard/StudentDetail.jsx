import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import axios from 'axios';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import Sidebar from '../../../components/Sidebar';
import DeleteConfirmModal from '../../../components/DeleteConfirmModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function StudentDetail() {
	const { id } = useParams();
	const navigate = useNavigate();

	const [student, setStudent] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [deleteModal, setDeleteModal] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		fetchStudent();
	}, [id]);

	const fetchStudent = async () => {
		try {
			setIsLoading(true);
			setError('');
			const response = await axios.get(`${API_URL}/students/${id}`, {
				withCredentials: true,
			});
			setStudent(response.data);
		} catch (err) {
			setError(err.response?.data?.message || '학생 정보를 불러오는데 실패했습니다');
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteClick = () => {
		setDeleteModal(true);
	};

	const handleDeleteConfirm = async () => {
		setIsDeleting(true);
		try {
			await axios.delete(`${API_URL}/students/${id}`, {
				withCredentials: true,
			});
			navigate('/dashboard/students');
		} catch (err) {
			setError(err.response?.data?.message || '학생 삭제에 실패했습니다');
			setDeleteModal(false);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleDeleteCancel = () => {
		if (!isDeleting) {
			setDeleteModal(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex h-screen bg-gray-50">
				<Sidebar />
				<main className="flex-1 overflow-y-auto">
					<div className="p-6 sm:p-8 lg:pl-8 pt-16 lg:pt-6">
						<div className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
						</div>
					</div>
				</main>
			</div>
		);
	}

	if (error && !student) {
		return (
			<div className="flex h-screen bg-gray-50">
				<Sidebar />
				<main className="flex-1 overflow-y-auto">
					<div className="p-6 sm:p-8 lg:pl-8 pt-16 lg:pt-6">
						<div className="mb-6">
							<button
								onClick={() => navigate('/dashboard/students')}
								className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
							>
								<ArrowLeft className="w-5 h-5" />
								<span>돌아가기</span>
							</button>
						</div>
						<div className="bg-red-50 border border-red-200 rounded-lg p-6">
							<p className="text-red-600">{error}</p>
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
				<div className="p-6 sm:p-8 lg:pl-8 pt-16 lg:pt-6">
					{/* Back Button */}
					<div className="mb-6">
						<button
							onClick={() => navigate('/dashboard/students')}
							className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
						>
							<ArrowLeft className="w-5 h-5" />
							<span>학생 목록으로</span>
						</button>
					</div>

					{/* Error Message */}
					{error && (
						<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
							<p className="text-sm text-red-600">{error}</p>
						</div>
					)}

					{/* Student Info Card */}
					{student && (
						<div className="bg-white rounded-lg shadow-sm border border-gray-200">
							{/* Header */}
							<div className="border-b border-gray-200 p-6">
								<div className="flex items-start justify-between">
									<div>
										<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{student.fullName}</h1>
									</div>
									<div className="flex items-center gap-2">
										<button
											onClick={() => {
												/* TODO: Edit functionality */
											}}
											className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
										>
											<Edit2 className="w-4 h-4" />
											<span>수정</span>
										</button>
										<button
											onClick={handleDeleteClick}
											className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
										>
											<Trash2 className="w-4 h-4" />
											<span>삭제</span>
										</button>
									</div>
								</div>
							</div>

							{/* Details */}
							<div className="p-6">
								<h2 className="text-lg font-semibold text-gray-900 mb-4">학생 정보</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label className="block text-sm font-medium text-gray-500 mb-1">이름</label>
										<p className="text-base text-gray-900">{student.fullName}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-500 mb-1">세례명</label>
										<p className="text-base text-gray-900">{student.christianName || '-'}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-500 mb-1">축일 (월)</label>
										<p className="text-base text-gray-900">{student.nameDayMonth ? `${student.nameDayMonth}월` : '-'}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-500 mb-1">학년</label>
										<p className="text-base text-gray-900">{student.grade}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-500 mb-1">성별</label>
										<p className="text-base text-gray-900">{student.gender}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-500 mb-1">등록일</label>
										<p className="text-base text-gray-900">
											{new Date(student.createdAt).toLocaleDateString('ko-KR', {
												year: 'numeric',
												month: 'long',
												day: 'numeric',
											})}
										</p>
									</div>
								</div>
							</div>

							{/* Parent Information */}
							<div className="border-t border-gray-200 p-6">
								<h2 className="text-lg font-semibold text-gray-900 mb-4">부모님 정보</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label className="block text-sm font-medium text-gray-500 mb-1">어머니 성함</label>
										<p className="text-base text-gray-900">{student.motherName || '-'}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-500 mb-1">어머니 연락처</label>
										<p className="text-base text-gray-900">{student.motherContact || '-'}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-500 mb-1">아버지 성함</label>
										<p className="text-base text-gray-900">{student.fatherName || '-'}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-500 mb-1">아버지 연락처</label>
										<p className="text-base text-gray-900">{student.fatherContact || '-'}</p>
									</div>
								</div>
							</div>

							{/* Attendance History Section (Placeholder) */}
							<div className="border-t border-gray-200 p-6">
								<h2 className="text-lg font-semibold text-gray-900 mb-4">출석 기록</h2>
								<div className="text-center py-12 bg-gray-50 rounded-lg">
									<p className="text-gray-500">출석 기록이 없습니다</p>
								</div>
							</div>
						</div>
					)}
				</div>
			</main>

			{/* Delete Confirmation Modal */}
			<DeleteConfirmModal
				isOpen={deleteModal}
				onClose={handleDeleteCancel}
				onConfirm={handleDeleteConfirm}
				title="학생 삭제"
				message={`${student?.fullName} 학생을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
				isDeleting={isDeleting}
			/>
		</div>
	);
}
