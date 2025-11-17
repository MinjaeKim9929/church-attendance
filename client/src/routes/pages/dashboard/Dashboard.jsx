import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Check, TrendingUp, ChevronDown, ExternalLink } from 'lucide-react';
import { useAuth } from '../../../context/useAuth';
import { useNavigate } from 'react-router';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Helper function to get local date string in YYYY-MM-DD format
const getLocalDateString = (date = new Date()) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

export default function Dashboard() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [assignedClasses, setAssignedClasses] = useState([]);
	const [selectedClassIndex, setSelectedClassIndex] = useState(0);
	const [students, setStudents] = useState([]);
	const [todayAttendance, setTodayAttendance] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [monthlyAttendance, setMonthlyAttendance] = useState([]);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

	useEffect(() => {
		fetchAssignedClasses();
	}, [user]);

	useEffect(() => {
		if (assignedClasses.length > 0) {
			fetchClassStats();
			fetchMonthlyAttendance();
		}
	}, [assignedClasses, selectedClassIndex, currentMonth, selectedDate]);

	const fetchAssignedClasses = async () => {
		if (!user) return;

		try {
			setIsLoading(true);

			// Fetch class configuration
			const classResponse = await axios.get(`${API_URL}/class-config/current`, {
				withCredentials: true,
			});

			// Get all classes (not filtered by teacher)
			const allClasses = classResponse.data.classes || [];

			// Add "All" option at the beginning
			const classesWithAll = [
				{
					_id: 'all',
					className: '전체',
					selectionMode: 'all',
					grades: [],
					students: [],
				},
				...allClasses,
			];

			setAssignedClasses(classesWithAll);
		} catch (err) {
			console.error('Error fetching classes:', err);
			setAssignedClasses([]);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchClassStats = async () => {
		if (assignedClasses.length === 0) return;

		const selectedClass = assignedClasses[selectedClassIndex];
		if (!selectedClass) return;

		try {
			// Fetch all students
			const studentsResponse = await axios.get(`${API_URL}/students`, {
				withCredentials: true,
			});

			// Filter students by class configuration
			let classStudents = studentsResponse.data;
			if (selectedClass._id === 'all') {
				// For "All" option, show all students
				classStudents = studentsResponse.data;
			} else if (selectedClass.selectionMode === 'students' && selectedClass.students) {
				classStudents = studentsResponse.data.filter((student) => selectedClass.students.includes(student._id));
			} else if (selectedClass.grades) {
				classStudents = studentsResponse.data.filter((student) => selectedClass.grades.includes(student.grade));
			}

			setStudents(classStudents);

			// Fetch attendance for selected date
			const dateStr = getLocalDateString(selectedDate);
			try {
				const attendanceResponse = await axios.get(`${API_URL}/attendance/date/${dateStr}`, {
					withCredentials: true,
				});

				// Filter attendance based on selected class
				let classAttendance;
				if (selectedClass._id === 'all') {
					// For "All" option, show all attendance records
					classAttendance = attendanceResponse.data.attendanceRecords;
				} else {
					// Filter attendance for this class only
					classAttendance = attendanceResponse.data.attendanceRecords.filter(
						(record) => record.class === selectedClass.className
					);
				}

				setTodayAttendance(classAttendance);
			} catch (err) {
				// If no attendance for today, set empty array
				if (err.response?.status === 404 || err.response?.status === 500) {
					setTodayAttendance([]);
				} else {
					throw err;
				}
			}
		} catch (err) {
			console.error('Error fetching class stats:', err);
		}
	};

	const fetchMonthlyAttendance = async () => {
		if (assignedClasses.length === 0) return;

		const selectedClass = assignedClasses[selectedClassIndex];
		if (!selectedClass) return;

		try {
			const year = currentMonth.getFullYear();
			const month = currentMonth.getMonth();

			// Get first and last day of the month
			const firstDay = new Date(year, month, 1);
			const lastDay = new Date(year, month + 1, 0);

			// Fetch attendance for each day in the month
			const attendancePromises = [];
			for (let day = firstDay; day <= lastDay; day.setDate(day.getDate() + 1)) {
				const dateStr = getLocalDateString(new Date(day));
				attendancePromises.push(
					axios
						.get(`${API_URL}/attendance/date/${dateStr}`, {
							withCredentials: true,
						})
						.then((response) => ({
							date: dateStr,
							records:
								selectedClass._id === 'all'
									? response.data.attendanceRecords
									: response.data.attendanceRecords.filter((record) => record.class === selectedClass.className),
						}))
						.catch(() => ({ date: dateStr, records: [] }))
				);
			}

			const attendanceData = await Promise.all(attendancePromises);
			setMonthlyAttendance(attendanceData);
		} catch (err) {
			console.error('Error fetching monthly attendance:', err);
		}
	};

	// Calendar helper functions
	const changeMonth = (increment) => {
		const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + increment, 1);
		setCurrentMonth(newMonth);
	};

	const getDaysInMonth = (date) => {
		const year = date.getFullYear();
		const month = date.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const daysInMonth = lastDay.getDate();
		const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

		return { daysInMonth, startingDayOfWeek };
	};

	// Calculate stats
	const selectedClass = assignedClasses[selectedClassIndex];
	const totalStudents = students.length;
	const presentToday = todayAttendance.filter((record) => record.status === 'Present').length;
	const attendanceRate = totalStudents > 0 ? ((presentToday / totalStudents) * 100).toFixed(1) : 0;

	const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
	const monthName = currentMonth.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });

	return (
		<>
			{/* Loading State */}
			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
				</div>
			) : assignedClasses.length === 0 ? (
				<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
					<p className="text-gray-500">담당하는 반이 없습니다.</p>
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
					{/* Class Stats Card - Left Half */}
					<div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden h-fit">
						{/* Header with gradient background */}
						<div className="bg-gradient-to-br from-primary-500 to-primary-600 px-4 py-3">
							<div className="flex items-center justify-between">
								{/* Class name with dropdown (if multiple classes) */}
								{assignedClasses.length > 1 ? (
									<div className="relative">
										<button
											onClick={() => setIsDropdownOpen(!isDropdownOpen)}
											className="flex items-center gap-2 text-base font-bold text-white hover:text-primary-100 transition-colors hover:cursor-pointer"
										>
											<span>{selectedClass?.className}</span>
											<ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
										</button>

										{/* Dropdown Menu */}
										{isDropdownOpen && (
											<div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[200px]">
												{assignedClasses.map((cls, index) => (
													<button
														key={index}
														onClick={() => {
															setSelectedClassIndex(index);
															setIsDropdownOpen(false);
														}}
														className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors hover:cursor-pointer ${
															selectedClassIndex === index
																? 'bg-primary-50 text-primary-700 font-semibold'
																: 'text-gray-700'
														}`}
													>
														{cls.className}
													</button>
												))}
											</div>
										)}
									</div>
								) : (
									<h2 className="text-base font-bold text-white">{selectedClass?.className}</h2>
								)}
							</div>
						</div>

						<div className="p-3 sm:p-4">
							<div className="space-y-6">
								{/* Stats Section */}
								<div>
									<div className="grid grid-cols-3 gap-2 sm:gap-3 mt-2">
										{/* Total Students */}
										<div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 p-2 sm:p-3 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-lg border border-primary-200/50">
											<div className="flex-shrink-0 p-1.5 sm:p-2 bg-white rounded-lg shadow-sm">
												<Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
											</div>
											<div className="flex-1 text-center sm:text-left">
												<p className="text-[10px] sm:text-xs text-gray-600">총 학생</p>
												<p className="text-lg sm:text-2xl font-bold text-gray-900">{totalStudents}</p>
											</div>
										</div>

										{/* Today's Attendance */}
										<div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 p-2 sm:p-3 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg border border-emerald-200/50">
											<div className="flex-shrink-0 p-1.5 sm:p-2 bg-white rounded-lg shadow-sm">
												<Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
											</div>
											<div className="flex-1 text-center sm:text-left">
												<p className="text-[10px] sm:text-xs text-gray-600">출석</p>
												<p className="text-lg sm:text-2xl font-bold text-gray-900">{presentToday}</p>
											</div>
										</div>

										{/* Attendance Rate */}
										<div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 p-2 sm:p-3 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg border border-purple-200/50">
											<div className="flex-shrink-0 p-1.5 sm:p-2 bg-white rounded-lg shadow-sm">
												<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
											</div>
											<div className="flex-1 text-center sm:text-left">
												<p className="text-[10px] sm:text-xs text-gray-600">출석률</p>
												<p className="text-lg sm:text-2xl font-bold text-gray-900">{attendanceRate}%</p>
											</div>
										</div>
									</div>
								</div>

								{/* Calendar Section */}
								<div className="w-full sm:max-w-md sm:mx-auto">
									<div className="flex items-center justify-between mb-3 px-1">
										<button
											onClick={() => changeMonth(-1)}
											className="p-1.5 hover:bg-primary-50 text-gray-600 hover:text-primary-600 rounded transition-all hover:cursor-pointer"
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
											</svg>
										</button>
										<div className="flex items-center gap-2 relative">
											<button
												onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
												className="text-sm font-bold text-gray-900 hover:text-primary-600 transition-colors hover:cursor-pointer"
											>
												{monthName}
											</button>
											<button
												onClick={() => {
													const today = new Date();
													setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
													setSelectedDate(today);
												}}
												className="px-2 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors hover:cursor-pointer"
											>
												오늘
											</button>

											{/* Month/Year Picker Popup */}
											{isMonthPickerOpen && (
												<div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10 w-64">
													{/* Year Selector */}
													<div className="mb-4">
														<label className="block text-xs font-semibold text-gray-600 mb-2">년도</label>
														<div className="flex items-center gap-2">
															<button
																onClick={() =>
																	setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1))
																}
																className="p-1 hover:bg-gray-100 rounded hover:cursor-pointer"
															>
																<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={2}
																		d="M15 19l-7-7 7-7"
																	/>
																</svg>
															</button>
															<span className="flex-1 text-center font-semibold text-gray-900">
																{currentMonth.getFullYear()}년
															</span>
															<button
																onClick={() =>
																	setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1))
																}
																className="p-1 hover:bg-gray-100 rounded hover:cursor-pointer"
															>
																<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
																</svg>
															</button>
														</div>
													</div>

													{/* Month Selector */}
													<div>
														<label className="block text-xs font-semibold text-gray-600 mb-2">월</label>
														<div className="grid grid-cols-3 gap-2">
															{Array.from({ length: 12 }, (_, i) => (
																<button
																	key={i}
																	onClick={() => {
																		setCurrentMonth(new Date(currentMonth.getFullYear(), i, 1));
																		setIsMonthPickerOpen(false);
																	}}
																	className={`py-2 px-3 rounded text-sm font-medium transition-colors hover:cursor-pointer ${
																		currentMonth.getMonth() === i
																			? 'bg-primary-500 text-white'
																			: 'bg-gray-50 text-gray-700 hover:bg-gray-100'
																	}`}
																>
																	{i + 1}월
																</button>
															))}
														</div>
													</div>

													{/* Close button */}
													<button
														onClick={() => setIsMonthPickerOpen(false)}
														className="mt-4 w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors hover:cursor-pointer"
													>
														닫기
													</button>
												</div>
											)}
										</div>
										<button
											onClick={() => changeMonth(1)}
											className="p-1.5 hover:bg-primary-50 text-gray-600 hover:text-primary-600 rounded transition-all hover:cursor-pointer"
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
											</svg>
										</button>
									</div>

									{/* Calendar Grid */}
									<div className="bg-gray-50 rounded-lg p-1.5 sm:p-2 border border-gray-200">
										<div className="grid grid-cols-7 gap-0.5 sm:gap-1">
											{/* Day Headers */}
											{['일', '월', '화', '수', '목', '금', '토'].map((day) => (
												<div
													key={day}
													className="text-center text-[10px] sm:text-xs font-semibold text-gray-500 py-0.5 sm:py-1"
												>
													{day}
												</div>
											))}

											{/* Empty cells for days before month starts */}
											{Array.from({ length: startingDayOfWeek }).map((_, i) => (
												<div key={`empty-${i}`} className="aspect-square"></div>
											))}

											{/* Calendar Days */}
											{Array.from({ length: daysInMonth }).map((_, i) => {
												const day = i + 1;
												const isToday =
													new Date().getDate() === day &&
													new Date().getMonth() === currentMonth.getMonth() &&
													new Date().getFullYear() === currentMonth.getFullYear();
												const isSelected =
													selectedDate.getDate() === day &&
													selectedDate.getMonth() === currentMonth.getMonth() &&
													selectedDate.getFullYear() === currentMonth.getFullYear();

												return (
													<button
														key={day}
														onClick={() =>
															setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))
														}
														className={`aspect-square flex items-center justify-center text-[10px] sm:text-xs font-medium rounded transition-all hover:cursor-pointer ${
															isSelected
																? 'ring-2 ring-primary-600 ring-offset-1 bg-primary-500 text-white font-bold shadow hover:bg-primary-600'
																: isToday
																? 'bg-primary-300 text-white font-bold hover:bg-primary-400'
																: 'text-gray-600 hover:bg-gray-200'
														}`}
													>
														{day}
													</button>
												);
											})}
										</div>
									</div>

									{/* Link to Attendance Page */}
									<button
										onClick={() => {
											const classInfo = {
												id: selectedClass._id,
												name: selectedClass.className,
												selectionMode: selectedClass.selectionMode,
												grades: selectedClass.grades,
												students: selectedClass.students,
												description:
													selectedClass.selectionMode === 'students'
														? `${selectedClass.students?.length || 0}명의 학생`
														: selectedClass.grades.join(', ') + '학년',
											};
											navigate(`/dashboard/attendance/${selectedClass._id}`, {
												state: {
													classInfo,
													selectedDate: getLocalDateString(selectedDate),
												},
											});
										}}
										className="w-full mt-6 mb-1 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 hover:cursor-pointer"
									>
										<ExternalLink className="w-4 h-4" />
										출석 관리 페이지로 이동
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* Right Half - Monthly Attendance Summary */}
					<div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden h-fit">
						{/* Header */}
						<div className="bg-gradient-to-br from-primary-500 to-primary-600 px-4 py-3">
							<h2 className="text-base font-bold text-white">월별 출석 현황</h2>
						</div>

						<div className="p-3 sm:p-4">
							{/* Monthly Stats */}
							<div className="space-y-3">
								{monthlyAttendance.length > 0 ? (
									<>
										{/* Summary Stats */}
										<div className="grid grid-cols-2 gap-3">
											<div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-200/50 p-3">
												<p className="text-xs text-gray-600 mb-1">총 출석일</p>
												<p className="text-2xl font-bold text-gray-900">
													{monthlyAttendance.filter((day) => day.records.length > 0).length}일
												</p>
											</div>
											<div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg border border-emerald-200/50 p-3">
												<p className="text-xs text-gray-600 mb-1">평균 출석률</p>
												<p className="text-2xl font-bold text-gray-900">
													{(() => {
														const daysWithRecords = monthlyAttendance.filter((day) => day.records.length > 0);
														if (daysWithRecords.length === 0 || totalStudents === 0) return '0.0';
														const avgAttendance =
															daysWithRecords.reduce((sum, day) => {
																const presentCount = day.records.filter((r) => r.status === 'Present').length;
																return sum + (presentCount / totalStudents) * 100;
															}, 0) / daysWithRecords.length;
														return avgAttendance.toFixed(1);
													})()}
													%
												</p>
											</div>
										</div>

										{/* Daily Breakdown */}
										<div className="mt-4">
											<h3 className="text-sm font-semibold text-gray-700 mb-2">일별 출석 기록</h3>
											<div className="max-h-96 overflow-y-auto space-y-2">
												{monthlyAttendance
													.filter((day) => day.records.length > 0)
													.map((day) => {
														const presentCount = day.records.filter((r) => r.status === 'Present').length;
														const rate = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0;
														return (
															<div
																key={day.date}
																className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200"
															>
																<div>
																	<p className="text-sm font-medium text-gray-900">
																		{new Date(day.date + 'T00:00:00').toLocaleDateString('ko-KR', {
																			month: 'long',
																			day: 'numeric',
																			weekday: 'short',
																		})}
																	</p>
																</div>
																<div className="text-right">
																	<p className="text-sm font-bold text-gray-900">{presentCount}명</p>
																	<p className="text-xs text-gray-500">{rate}%</p>
																</div>
															</div>
														);
													})}
											</div>
										</div>
									</>
								) : (
									<div className="text-center py-8 text-gray-500">
										<p>이번 달 출석 기록이 없습니다.</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
