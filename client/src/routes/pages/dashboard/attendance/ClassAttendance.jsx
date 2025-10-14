import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import axios from 'axios';
import { ArrowLeft, Calendar, Check, X, Save, Users as UsersIcon } from 'lucide-react';
import Sidebar from '../../../../components/Sidebar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function ClassAttendance() {
	const { id } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const classInfo = location.state?.classInfo;

	const [students, setStudents] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
	const [attendance, setAttendance] = useState({});
	const [isSaving, setIsSaving] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);

	// Fetch students on mount
	useEffect(() => {
		fetchStudents();
	}, [id]);

	const fetchStudents = async () => {
		try {
			setIsLoading(true);
			setError('');
			const response = await axios.get(`${API_URL}/students`, {
				withCredentials: true,
			});

			// Filter students by class grades
			let filteredStudents = response.data;
			if (classInfo && classInfo.grades) {
				filteredStudents = response.data.filter((student) => classInfo.grades.includes(student.grade));
			}

			// Sort by grade then name
			const gradeOrder = ['JK', 'SK', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
			filteredStudents.sort((a, b) => {
				const gradeA = gradeOrder.indexOf(a.grade);
				const gradeB = gradeOrder.indexOf(b.grade);
				if (gradeA !== gradeB) {
					return gradeA - gradeB;
				}
				return a.fullName.localeCompare(b.fullName, 'ko');
			});

			setStudents(filteredStudents);

			// Initialize attendance state (default all present)
			const initialAttendance = {};
			filteredStudents.forEach((student) => {
				initialAttendance[student._id] = true; // true = present, false = absent
			});
			setAttendance(initialAttendance);
		} catch (err) {
			setError(err.response?.data?.message || '학생 목록을 불러오는데 실패했습니다');
		} finally {
			setIsLoading(false);
		}
	};

	const toggleAttendance = (studentId) => {
		setAttendance({
			...attendance,
			[studentId]: !attendance[studentId],
		});
	};

	const toggleAll = (isPresent) => {
		const newAttendance = {};
		students.forEach((student) => {
			newAttendance[student._id] = isPresent;
		});
		setAttendance(newAttendance);
	};

	const handleSave = async () => {
		setIsSaving(true);
		setSaveSuccess(false);
		try {
			// Prepare attendance data
			const attendanceData = {
				date: selectedDate,
				classId: id,
				className: classInfo?.name || '전체 학생',
				records: Object.entries(attendance).map(([studentId, isPresent]) => ({
					studentId,
					isPresent,
				})),
			};

			// TODO: Send to backend API
			console.log('Saving attendance:', attendanceData);

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			setSaveSuccess(true);
			setTimeout(() => setSaveSuccess(false), 3000);
		} catch (err) {
			setError(err.response?.data?.message || '출석 저장에 실패했습니다');
		} finally {
			setIsSaving(false);
		}
	};

	const presentCount = Object.values(attendance).filter((isPresent) => isPresent).length;
	const absentCount = students.length - presentCount;

	return (
		<div className="flex h-screen bg-gray-50">
			<Sidebar />
			<main className="flex-1 overflow-y-auto">
				<div className="p-4 sm:p-8 lg:pl-8 pt-20 lg:pt-6 max-w-7xl mx-auto">
					{/* Header */}
					<div className="mb-6">
						<button
							onClick={() => navigate('/dashboard/attendance')}
							className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4 transition-colors hover:cursor-pointer"
						>
							<ArrowLeft className="w-4 h-4" />
							<span className="text-sm font-medium">반 선택으로 돌아가기</span>
						</button>
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
							<div>
								<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
									{classInfo?.name || '전체 학생'} 출석 관리
								</h1>
								<p className="text-sm text-gray-600">
									{classInfo?.description && `${classInfo.description} • `}총 {students.length}명
								</p>
							</div>
							<div className="flex items-center gap-2">
								<button
									onClick={() => {
										const yesterday = new Date(selectedDate);
										yesterday.setDate(yesterday.getDate() - 1);
										setSelectedDate(yesterday.toISOString().split('T')[0]);
									}}
									className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:cursor-pointer transition-colors shadow-sm"
									title="이전 날"
								>
									<svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
									</svg>
								</button>
								<div className="relative">
									<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
									<input
										type="date"
										value={selectedDate}
										onChange={(e) => setSelectedDate(e.target.value)}
										className="pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm shadow-sm hover:cursor-pointer hover:border-gray-400 transition-colors w-[160px]"
									/>
								</div>
								<button
									onClick={() => {
										const tomorrow = new Date(selectedDate);
										tomorrow.setDate(tomorrow.getDate() + 1);
										setSelectedDate(tomorrow.toISOString().split('T')[0]);
									}}
									className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:cursor-pointer transition-colors shadow-sm"
									title="다음 날"
								>
									<svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</button>
								<button
									onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
									className="px-3 py-2.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 hover:cursor-pointer transition-colors text-xs font-semibold shadow-sm whitespace-nowrap"
									title="오늘"
								>
									오늘
								</button>
							</div>
						</div>
					</div>

					{/* Statistics Cards */}
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
						<div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
							<div className="flex items-center gap-3">
								<div className="p-2.5 bg-blue-50 rounded-lg">
									<UsersIcon className="w-5 h-5 text-blue-600" />
								</div>
								<div>
									<p className="text-xs sm:text-sm text-gray-600 font-medium">총 인원</p>
									<p className="text-xl sm:text-2xl font-bold text-gray-900">{students.length}</p>
								</div>
							</div>
						</div>
						<div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
							<div className="flex items-center gap-3">
								<div className="p-2.5 bg-emerald-50 rounded-lg">
									<Check className="w-5 h-5 text-emerald-600" />
								</div>
								<div>
									<p className="text-xs sm:text-sm text-gray-600 font-medium">출석</p>
									<p className="text-xl sm:text-2xl font-bold text-emerald-600">{presentCount}</p>
								</div>
							</div>
						</div>
						<div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
							<div className="flex items-center gap-3">
								<div className="p-2.5 bg-rose-50 rounded-lg">
									<X className="w-5 h-5 text-rose-600" />
								</div>
								<div>
									<p className="text-xs sm:text-sm text-gray-600 font-medium">결석</p>
									<p className="text-xl sm:text-2xl font-bold text-rose-600">{absentCount}</p>
								</div>
							</div>
						</div>
					</div>

					{/* Quick Actions */}
					<div className="flex flex-wrap gap-3 mb-6">
						<button
							onClick={() => toggleAll(true)}
							className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-all hover:cursor-pointer shadow-sm hover:shadow"
						>
							전체 출석
						</button>
						<button
							onClick={() => toggleAll(false)}
							className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg transition-all hover:cursor-pointer shadow-sm hover:shadow"
						>
							전체 결석
						</button>
					</div>

					{/* Loading State */}
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
						</div>
					) : (
						<>
							{/* Student List */}
							{students.length === 0 ? (
								<div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
									<p className="text-gray-500">이 반에 등록된 학생이 없습니다.</p>
								</div>
							) : (
								<div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
									<div className="overflow-x-auto">
										<table className="w-full">
											<thead className="bg-gray-50 border-b border-gray-200">
												<tr>
													<th className="w-16 px-4 sm:px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
														#
													</th>
													<th className="px-4 sm:px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
														이름
													</th>
													<th className="w-20 sm:w-24 px-4 sm:px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
														학년
													</th>
													<th className="w-32 sm:w-40 px-4 sm:px-6 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
														출석
													</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-gray-100">
												{students.map((student, index) => (
													<tr key={student._id} className="hover:bg-gray-50 transition-colors">
														<td className="px-4 sm:px-6 py-4 whitespace-nowrap">
															<span className="text-sm text-gray-500 font-medium">{index + 1}</span>
														</td>
														<td className="px-4 sm:px-6 py-4 whitespace-nowrap">
															<div className="flex flex-col">
																<span className="text-sm font-semibold text-gray-900">{student.fullName}</span>
																{student.christianName && (
																	<span className="text-xs text-gray-500 mt-0.5">{student.christianName}</span>
																)}
															</div>
														</td>
														<td className="px-4 sm:px-6 py-4 whitespace-nowrap">
															<span className="text-sm font-medium text-gray-700">{student.grade}</span>
														</td>
														<td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
															<div className="flex items-center justify-center gap-2">
																<button
																	onClick={() => setAttendance({ ...attendance, [student._id]: true })}
																	className={`inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold text-xs transition-all hover:cursor-pointer ${
																		attendance[student._id]
																			? 'bg-emerald-500 text-white shadow-md hover:bg-emerald-600'
																			: 'bg-white text-gray-500 border border-gray-300 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300'
																	}`}
																	title="출석"
																>
																	<Check className="w-4 h-4" />
																</button>
																<button
																	onClick={() => setAttendance({ ...attendance, [student._id]: false })}
																	className={`inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold text-xs transition-all hover:cursor-pointer ${
																		!attendance[student._id]
																			? 'bg-rose-500 text-white shadow-md hover:bg-rose-600'
																			: 'bg-white text-gray-500 border border-gray-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300'
																	}`}
																	title="결석"
																>
																	<X className="w-4 h-4" />
																</button>
															</div>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							)}

							{/* Save Button */}
							{students.length > 0 && (
								<div className="sticky bottom-0 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pt-6 pb-4">
									<button
										onClick={handleSave}
										disabled={isSaving}
										className="w-full sm:w-auto min-w-[140px] px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer flex items-center justify-center gap-2"
									>
										{isSaving ? (
											<>
												<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
												<span>저장 중...</span>
											</>
										) : (
											<>
												<Save className="w-5 h-5" />
												<span>출석 저장</span>
											</>
										)}
									</button>
								</div>
							)}
						</>
					)}
				</div>
			</main>
		</div>
	);
}
