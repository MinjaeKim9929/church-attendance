import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import axios from 'axios';
import { ArrowLeft, Edit2, Trash2, Calendar, ChevronLeft, ChevronRight, CheckCircle, XCircle, Filter } from 'lucide-react';
import DeleteConfirmModal from '../../../../components/DeleteConfirmModal';
import AddStudentModal from '../../../../components/AddStudentModal';
import Toast from '../../../../components/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function StudentDetail() {
	const { id } = useParams();
	const navigate = useNavigate();

	const [student, setStudent] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [deleteModal, setDeleteModal] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [editModal, setEditModal] = useState(false);
	const [toast, setToast] = useState(null);

	// Attendance states
	const [attendanceRecords, setAttendanceRecords] = useState([]);
	const [isLoadingAttendance, setIsLoadingAttendance] = useState(true);
	const [attendanceError, setAttendanceError] = useState('');
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [dateFilter, setDateFilter] = useState('all'); // 'all', 'last30', 'last90', 'currentYear'
	const [classFilter, setClassFilter] = useState('all');
	const [availableClasses, setAvailableClasses] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const recordsPerPage = 10;

	useEffect(() => {
		fetchStudent();
		fetchAttendanceRecords();
	}, [id]);

	useEffect(() => {
		setCurrentPage(1); // Reset to first page when filters change
	}, [dateFilter, classFilter]);

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

	const handleEditClick = () => {
		setEditModal(true);
	};

	const handleEditSubmit = async (studentData) => {
		try {
			const response = await axios.put(`${API_URL}/students/${id}`, studentData, {
				withCredentials: true,
			});
			setStudent(response.data);
			setEditModal(false);
			setToast({
				message: '학생 정보가 성공적으로 수정되었습니다!',
				type: 'success',
			});
		} catch (err) {
			throw new Error(err.response?.data?.message || '학생 정보 수정에 실패했습니다');
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

	const fetchAttendanceRecords = async () => {
		try {
			setIsLoadingAttendance(true);
			setAttendanceError('');

			// Get current school year
			const yearResponse = await axios.get(`${API_URL}/class-config/current/year`, {
				withCredentials: true,
			});
			const currentSchoolYear = yearResponse.data.schoolYear;

			// Fetch attendance records for this student
			const response = await axios.get(`${API_URL}/attendance/student/${id}?schoolYear=${currentSchoolYear}`, {
				withCredentials: true,
			});

			setAttendanceRecords(response.data.attendanceRecords || []);

			// Extract unique classes from records
			const classes = [...new Set(response.data.attendanceRecords.map((record) => record.class))];
			setAvailableClasses(classes);
		} catch (err) {
			console.error('Error fetching attendance:', err);
			setAttendanceError(err.response?.data?.message || '출석 기록을 불러오는데 실패했습니다');
		} finally {
			setIsLoadingAttendance(false);
		}
	};

	// Filter attendance records based on selected filters
	const getFilteredRecords = () => {
		let filtered = [...attendanceRecords];

		// Date filter
		const now = new Date();
		if (dateFilter === 'last30') {
			const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
			filtered = filtered.filter((record) => new Date(record.date) >= thirtyDaysAgo);
		} else if (dateFilter === 'last90') {
			const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
			filtered = filtered.filter((record) => new Date(record.date) >= ninetyDaysAgo);
		} else if (dateFilter === 'currentYear') {
			const currentYear = now.getFullYear();
			filtered = filtered.filter((record) => new Date(record.date).getFullYear() === currentYear);
		}

		// Class filter
		if (classFilter !== 'all') {
			filtered = filtered.filter((record) => record.class === classFilter);
		}

		// Sort by date (newest first)
		filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

		return filtered;
	};

	// Calculate statistics
	const getAttendanceStats = () => {
		const filtered = getFilteredRecords();
		const totalRecords = filtered.length;
		const presentCount = filtered.filter((r) => r.status === 'Present').length;
		const absentCount = filtered.filter((r) => r.status === 'Absent').length;
		const presentRate = totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(1) : 0;

		return { totalRecords, presentCount, absentCount, presentRate };
	};

	// Get attendance for calendar view
	const getAttendanceForMonth = () => {
		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth();

		const monthRecords = attendanceRecords.filter((record) => {
			const recordDate = new Date(record.date);
			return recordDate.getFullYear() === year && recordDate.getMonth() === month;
		});

		// Group by date with detailed class information
		const byDate = {};
		monthRecords.forEach((record) => {
			const dateStr = new Date(record.date).toISOString().split('T')[0];
			if (!byDate[dateStr]) {
				byDate[dateStr] = { present: [], absent: [], records: [] };
			}
			byDate[dateStr].records.push(record);
			if (record.status === 'Present') {
				byDate[dateStr].present.push(record.class);
			} else {
				byDate[dateStr].absent.push(record.class);
			}
		});

		return byDate;
	};

	// Calendar helper functions
	const getDaysInMonth = (date) => {
		return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
	};

	const getFirstDayOfMonth = (date) => {
		return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
	};

	const previousMonth = () => {
		setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
	};

	const nextMonth = () => {
		setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
	};

	// Pagination
	const getPaginatedRecords = () => {
		const filtered = getFilteredRecords();
		const startIndex = (currentPage - 1) * recordsPerPage;
		const endIndex = startIndex + recordsPerPage;
		return filtered.slice(startIndex, endIndex);
	};

	const getTotalPages = () => {
		return Math.ceil(getFilteredRecords().length / recordsPerPage);
	};

	if (isLoading) {
		return (
			<div className="flex h-screen bg-gray-50 dark:bg-page-dark">
				<Sidebar />
				<main className="flex-1 overflow-y-auto">
					<div className="p-6 sm:p-8 lg:pl-12 pt-20 lg:pt-12 max-w-7xl mx-auto">
						<div className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
					<div className="p-6 sm:p-8 lg:pl-12 pt-20 lg:pt-12 max-w-7xl mx-auto">
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
		<>
			<div className="max-w-7xl mx-auto">
				{/* Back Button */}
					<div className="mb-6">
						<button
							onClick={() => navigate('/dashboard/students')}
							className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors hover:cursor-pointer"
						>
							<ArrowLeft className="w-5 h-5" />
							<span>학생 목록으로</span>
						</button>
					</div>

					{/* Toast Notification */}
					{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} duration={3000} />}

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
											onClick={handleEditClick}
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
										<p className="text-base text-gray-900">
											{student.nameDayMonth ? `${student.nameDayMonth}월` : '-'}
										</p>
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

							{/* Attendance History Section */}
							<div className="border-t border-gray-200 p-6">
								<h2 className="text-lg font-semibold text-gray-900 mb-6">출석 기록</h2>

								{/* Loading State */}
								{isLoadingAttendance && (
									<div className="flex items-center justify-center py-12">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
									</div>
								)}

								{/* Error State */}
								{attendanceError && !isLoadingAttendance && (
									<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
										<p className="text-red-600 text-sm">{attendanceError}</p>
									</div>
								)}

								{/* Content */}
								{!isLoadingAttendance && !attendanceError && (
									<>
										{/* Summary Statistics */}
										{(() => {
											const stats = getAttendanceStats();
											return (
												<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
													{/* Total Records */}
													<div className="flex flex-col gap-2 p-3 sm:p-4 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-lg border border-primary-200/50">
														<div className="flex items-center gap-2">
															<div className="flex-shrink-0 p-1.5 bg-white rounded-lg shadow-sm">
																<Calendar className="w-4 h-4 text-primary-600" />
															</div>
															<p className="text-xs text-gray-600">총 기록</p>
														</div>
														<p className="text-2xl font-bold text-gray-900">{stats.totalRecords}</p>
													</div>

													{/* Present Count */}
													<div className="flex flex-col gap-2 p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg border border-green-200/50">
														<div className="flex items-center gap-2">
															<div className="flex-shrink-0 p-1.5 bg-white rounded-lg shadow-sm">
																<CheckCircle className="w-4 h-4 text-green-600" />
															</div>
															<p className="text-xs text-gray-600">출석</p>
														</div>
														<p className="text-2xl font-bold text-gray-900">{stats.presentCount}</p>
													</div>

													{/* Absent Count */}
													<div className="flex flex-col gap-2 p-3 sm:p-4 bg-gradient-to-br from-red-50 to-red-100/50 rounded-lg border border-red-200/50">
														<div className="flex items-center gap-2">
															<div className="flex-shrink-0 p-1.5 bg-white rounded-lg shadow-sm">
																<XCircle className="w-4 h-4 text-red-600" />
															</div>
															<p className="text-xs text-gray-600">결석</p>
														</div>
														<p className="text-2xl font-bold text-gray-900">{stats.absentCount}</p>
													</div>

													{/* Attendance Rate */}
													<div className="flex flex-col gap-2 p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg border border-purple-200/50">
														<div className="flex items-center gap-2">
															<div className="flex-shrink-0 p-1.5 bg-white rounded-lg shadow-sm">
																<Filter className="w-4 h-4 text-purple-600" />
															</div>
															<p className="text-xs text-gray-600">출석률</p>
														</div>
														<p className="text-2xl font-bold text-gray-900">{stats.presentRate}%</p>
													</div>
												</div>
											);
										})()}

										{/* Filters */}
										<div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
											{/* Date Range Filter */}
											<div className="flex-1">
												<label className="block text-xs font-medium text-gray-700 mb-1">기간</label>
												<select
													value={dateFilter}
													onChange={(e) => setDateFilter(e.target.value)}
													className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 hover:cursor-pointer"
												>
													<option value="all">전체</option>
													<option value="last30">최근 30일</option>
													<option value="last90">최근 90일</option>
													<option value="currentYear">올해</option>
												</select>
											</div>

											{/* Class Filter */}
											<div className="flex-1">
												<label className="block text-xs font-medium text-gray-700 mb-1">반</label>
												<select
													value={classFilter}
													onChange={(e) => setClassFilter(e.target.value)}
													className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 hover:cursor-pointer"
												>
													<option value="all">전체 반</option>
													{availableClasses.map((className) => (
														<option key={className} value={className}>
															{className}
														</option>
													))}
												</select>
											</div>
										</div>

										{/* Calendar and Records Section - Side by Side */}
										<div className="flex flex-col lg:flex-row gap-6 mb-6">
											{/* Calendar View */}
											<div className="lg:flex-shrink-0">
												<div className="p-3 bg-gray-50 rounded-lg max-w-sm">
													<div className="flex items-center justify-between mb-2">
														<h3 className="text-xs font-semibold text-gray-900">월별 출석 현황</h3>
														<div className="flex items-center gap-1">
															<button
																onClick={previousMonth}
																className="p-1 hover:bg-gray-200 rounded transition-colors hover:cursor-pointer"
															>
																<ChevronLeft className="w-3 h-3 text-gray-600" />
															</button>
															<span className="text-xs font-medium text-gray-900 min-w-[90px] text-center">
																{currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
															</span>
															<button
																onClick={nextMonth}
																className="p-1 hover:bg-gray-200 rounded transition-colors hover:cursor-pointer"
															>
																<ChevronRight className="w-3 h-3 text-gray-600" />
															</button>
														</div>
													</div>

													{/* Calendar Grid */}
													<div className="bg-white rounded-lg p-2">
														{/* Day Headers */}
														<div className="grid grid-cols-7 gap-0.5 mb-1">
															{['일', '월', '화', '수', '목', '금', '토'].map((day) => (
																<div key={day} className="text-center text-[10px] font-medium text-gray-500 py-0.5">
																	{day}
																</div>
															))}
														</div>

														{/* Calendar Days */}
														<div className="grid grid-cols-7 gap-0.5">
															{(() => {
																const daysInMonth = getDaysInMonth(currentMonth);
																const firstDay = getFirstDayOfMonth(currentMonth);
																const attendanceByDate = getAttendanceForMonth();
																const days = [];

																// Empty cells for days before month starts
																for (let i = 0; i < firstDay; i++) {
																	days.push(
																		<div key={`empty-${i}`} className="aspect-square"></div>
																	);
																}

																// Days of the month
																for (let day = 1; day <= daysInMonth; day++) {
																	const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
																	const dayData = attendanceByDate[dateStr];
																	const hasAttendance = dayData && dayData.records.length > 0;
																	const allPresent = hasAttendance && dayData.absent.length === 0;
																	const allAbsent = hasAttendance && dayData.present.length === 0;

																	// Build tooltip content
																	let tooltipContent = '';
																	if (hasAttendance) {
																		if (dayData.present.length > 0) {
																			tooltipContent += `출석: ${dayData.present.join(', ')}`;
																		}
																		if (dayData.absent.length > 0) {
																			if (tooltipContent) tooltipContent += '\n';
																			tooltipContent += `결석: ${dayData.absent.join(', ')}`;
																		}
																	}

																	days.push(
																		<div
																			key={day}
																			title={tooltipContent}
																			className={`aspect-square flex items-center justify-center text-[10px] font-medium rounded transition-all hover:cursor-pointer ${
																				allPresent
																					? 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200'
																					: allAbsent
																					? 'bg-red-100 text-red-800 border border-red-300 hover:bg-red-200'
																					: hasAttendance
																					? 'bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200'
																					: 'text-gray-400 hover:bg-gray-100'
																			}`}
																		>
																			{day}
																		</div>
																	);
																}

																return days;
															})()}
														</div>

														{/* Legend with class details */}
														<div className="mt-2 pt-2 border-t border-gray-200">
															<div className="flex items-center justify-center gap-2 mb-1">
																<div className="flex items-center gap-1">
																	<div className="w-2 h-2 rounded bg-green-100 border border-green-300"></div>
																	<span className="text-[10px] text-gray-600">전체 출석</span>
																</div>
																<div className="flex items-center gap-1">
																	<div className="w-2 h-2 rounded bg-red-100 border border-red-300"></div>
																	<span className="text-[10px] text-gray-600">전체 결석</span>
																</div>
																<div className="flex items-center gap-1">
																	<div className="w-2 h-2 rounded bg-yellow-100 border border-yellow-300"></div>
																	<span className="text-[10px] text-gray-600">혼합</span>
																</div>
															</div>
															<p className="text-[9px] text-gray-500 text-center">날짜 위에 마우스를 올려 반별 출석 상태를 확인하세요</p>
														</div>
													</div>
												</div>
											</div>

											{/* Records Table */}
											<div className="flex-1">
												{getFilteredRecords().length === 0 ? (
													<div className="text-center py-12 bg-gray-50 rounded-lg">
														<p className="text-gray-500">출석 기록이 없습니다</p>
													</div>
												) : (
													<>
														{/* Desktop Table */}
														<div className="hidden sm:block overflow-x-auto">
															<table className="w-full">
																<thead className="bg-gray-50 border-b border-gray-200">
																	<tr>
																		<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
																			날짜
																		</th>
																		<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
																			반
																		</th>
																		<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
																			상태
																		</th>
																		<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
																			기록자
																		</th>
																	</tr>
																</thead>
																<tbody className="divide-y divide-gray-200">
																	{getPaginatedRecords().map((record, index) => (
																		<tr key={index} className="hover:bg-gray-50">
																			<td className="px-4 py-3 text-sm text-gray-900">
																				{new Date(record.date).toLocaleDateString('ko-KR', {
																					year: 'numeric',
																					month: 'long',
																					day: 'numeric',
																				})}
																			</td>
																			<td className="px-4 py-3 text-sm text-gray-900">{record.class}</td>
																			<td className="px-4 py-3">
																				<span
																					className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
																						record.status === 'Present'
																							? 'bg-green-100 text-green-800'
																							: 'bg-red-100 text-red-800'
																					}`}
																				>
																					{record.status === 'Present' ? (
																						<>
																							<CheckCircle className="w-3 h-3" />
																							출석
																						</>
																					) : (
																						<>
																							<XCircle className="w-3 h-3" />
																							결석
																						</>
																					)}
																				</span>
																			</td>
																			<td className="px-4 py-3 text-sm text-gray-600">
																				{record.recordedBy?.fullName || '-'}
																			</td>
																		</tr>
																	))}
																</tbody>
															</table>
														</div>

														{/* Mobile Card List */}
														<div className="sm:hidden space-y-3">
															{getPaginatedRecords().map((record, index) => (
																<div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
																	<div className="flex items-start justify-between mb-2">
																		<div>
																			<p className="text-sm font-medium text-gray-900">
																				{new Date(record.date).toLocaleDateString('ko-KR', {
																					year: 'numeric',
																					month: 'long',
																					day: 'numeric',
																				})}
																			</p>
																			<p className="text-xs text-gray-600 mt-0.5">{record.class}</p>
																		</div>
																		<span
																			className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
																				record.status === 'Present'
																					? 'bg-green-100 text-green-800'
																					: 'bg-red-100 text-red-800'
																			}`}
																		>
																			{record.status === 'Present' ? (
																				<>
																					<CheckCircle className="w-3 h-3" />
																					출석
																				</>
																			) : (
																				<>
																					<XCircle className="w-3 h-3" />
																					결석
																				</>
																			)}
																		</span>
																	</div>
																	<p className="text-xs text-gray-500">
																		기록자: {record.recordedBy?.fullName || '-'}
																	</p>
																</div>
															))}
														</div>

														{/* Pagination */}
														{getTotalPages() > 1 && (
															<div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
																<p className="text-sm text-gray-600">
																	{getFilteredRecords().length}개 중 {(currentPage - 1) * recordsPerPage + 1}-
																	{Math.min(currentPage * recordsPerPage, getFilteredRecords().length)}
																</p>
																<div className="flex items-center gap-2">
																	<button
																		onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
																		disabled={currentPage === 1}
																		className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
																	>
																		이전
																	</button>
																	<span className="text-sm text-gray-600">
																		{currentPage} / {getTotalPages()}
																	</span>
																	<button
																		onClick={() => setCurrentPage((prev) => Math.min(getTotalPages(), prev + 1))}
																		disabled={currentPage === getTotalPages()}
																		className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
																	>
																		다음
																	</button>
																</div>
															</div>
														)}
													</>
												)}
											</div>
										</div>
									</>
								)}
							</div>
						</div>
					)}
			</div>

			{/* Edit Student Modal */}
			{editModal && student && (
				<AddStudentModal student={student} onClose={() => setEditModal(false)} onSubmit={handleEditSubmit} />
			)}

			{/* Delete Confirmation Modal */}
			<DeleteConfirmModal
				isOpen={deleteModal}
				onClose={handleDeleteCancel}
				onConfirm={handleDeleteConfirm}
				title="학생 삭제"
				message={`${student?.fullName} 학생을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
				isDeleting={isDeleting}
			/>
		</>
	);
}
