import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Users, CheckCircle, TrendingUp, XCircle, AlertTriangle, Search } from 'lucide-react';
import Toast from '../../../../components/ui/feedback/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const AT_RISK_THRESHOLD = 80;

export default function AttendanceStats() {
	const [schoolYear, setSchoolYear] = useState('');
	const [classes, setClasses] = useState([]);
	const [selectedClassName, setSelectedClassName] = useState('all');
	const [classStatsMap, setClassStatsMap] = useState({});
	const [classRecordsMap, setClassRecordsMap] = useState({});
	const [allStudents, setAllStudents] = useState([]);
	const [isLoadingInit, setIsLoadingInit] = useState(true);
	const [isLoadingDetails, setIsLoadingDetails] = useState(false);
	const [error, setError] = useState(null);
	const [toast, setToast] = useState(null);

	// Search section state
	const [searchClass, setSearchClass] = useState('all');
	const [searchPeriod, setSearchPeriod] = useState('all');
	const [searchStartDate, setSearchStartDate] = useState('');
	const [searchEndDate, setSearchEndDate] = useState('');
	const [searchStatus, setSearchStatus] = useState('all');

	// Phase 1: load school year + students + class config
	useEffect(() => {
		const init = async () => {
			try {
				setIsLoadingInit(true);
				setError(null);

				const [yearRes, studentsRes] = await Promise.all([
					axios.get(`${API_URL}/class-config/current/year`, { withCredentials: true }),
					axios.get(`${API_URL}/students`, { withCredentials: true }),
				]);

				const year = yearRes.data.schoolYear;
				setSchoolYear(year);
				setAllStudents(studentsRes.data);

				const configRes = await axios.get(`${API_URL}/class-config/${year}`, { withCredentials: true });
				setClasses(configRes.data.classes || []);
			} catch (err) {
				setError(err.response?.data?.message || '데이터를 불러오는데 실패했습니다');
			} finally {
				setIsLoadingInit(false);
			}
		};
		init();
	}, []);

	// Phase 2: load per-class stats + records when classes are ready
	useEffect(() => {
		if (classes.length === 0 || !schoolYear) return;

		const loadDetails = async () => {
			try {
				setIsLoadingDetails(true);

				// Fetch each class's records once; per-class stats (totals/rate) are
				// derived from those records below instead of a separate API call
				const results = await Promise.all(
					classes.map((cls) =>
						axios
							.get(`${API_URL}/attendance/class/${encodeURIComponent(cls.className)}`, {
								params: { schoolYear },
								withCredentials: true,
							})
							.then((r) => ({ className: cls.className, records: r.data.attendanceRecords || [] }))
							.catch(() => ({ className: cls.className, records: [] })),
					),
				);

				const statsMap = {};
				const recordsMap = {};
				results.forEach(({ className, records }) => {
					recordsMap[className] = records;

					const totalRecords = records.length;
					const presentCount = records.filter((r) => r.status === 'Present').length;
					const absentCount = records.filter((r) => r.status === 'Absent').length;
					const attendanceRate = totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(2) : '0';

					statsMap[className] = {
						totalRecords,
						presentCount,
						absentCount,
						attendanceRate: `${attendanceRate}%`,
					};
				});

				setClassStatsMap(statsMap);
				setClassRecordsMap(recordsMap);
			} catch {
				setToast({ type: 'error', message: '통계 데이터 로드 중 오류가 발생했습니다' });
			} finally {
				setIsLoadingDetails(false);
			}
		};

		loadDetails();
	}, [classes, schoolYear]);

	// Monthly trend computation
	const monthlyTrend = useMemo(() => {
		let records = [];
		if (selectedClassName === 'all') {
			// Merge all records, deduplicate by (studentId, date)
			const seen = new Set();
			Object.values(classRecordsMap).forEach((classRecords) => {
				classRecords.forEach((r) => {
					const dateStr = r.date?.substring(0, 10) || '';
					const key = `${r.studentId?._id || r.studentId}__${dateStr}`;
					if (!seen.has(key)) {
						seen.add(key);
						records.push({ ...r, _dateStr: dateStr });
					}
				});
			});
		} else {
			records = (classRecordsMap[selectedClassName] || []).map((r) => ({
				...r,
				_dateStr: r.date?.substring(0, 10) || '',
			}));
		}

		const monthMap = {};
		records.forEach((r) => {
			const month = r._dateStr.substring(0, 7);
			if (!month) return;
			if (!monthMap[month]) monthMap[month] = { present: 0, absent: 0 };
			if (r.status === 'Present') monthMap[month].present++;
			else monthMap[month].absent++;
		});

		return Object.entries(monthMap)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([month, { present, absent }]) => {
				const total = present + absent;
				const rate = total > 0 ? Math.round((present / total) * 100) : 0;
				const [, m] = month.split('-');
				return { month, label: `${parseInt(m)}월`, present, absent, total, rate };
			});
	}, [classRecordsMap, selectedClassName]);

	// At-risk students computation
	const atRiskStudents = useMemo(() => {
		let records = [];

		if (selectedClassName === 'all') {
			const seen = new Set();
			Object.values(classRecordsMap).forEach((classRecords) => {
				classRecords.forEach((r) => {
					const dateStr = r.date?.substring(0, 10) || '';
					const sid = r.studentId?._id || r.studentId;
					const key = `${sid}__${dateStr}`;
					if (!seen.has(key)) {
						seen.add(key);
						records.push(r);
					}
				});
			});
		} else {
			records = classRecordsMap[selectedClassName] || [];
		}

		// aggregate per student
		const studentMap = {};
		records.forEach((r) => {
			const sid = r.studentId?._id || r.studentId;
			if (!sid) return;
			if (!studentMap[sid]) {
				studentMap[sid] = {
					id: sid,
					name: r.studentId?.fullName || '알 수 없음',
					grade: r.studentId?.grade || '',
					present: 0,
					total: 0,
				};
			}
			studentMap[sid].total++;
			if (r.status === 'Present') studentMap[sid].present++;
		});

		return Object.values(studentMap)
			.map((s) => ({ ...s, rate: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0 }))
			.filter((s) => s.rate < AT_RISK_THRESHOLD)
			.sort((a, b) => a.rate - b.rate);
	}, [classRecordsMap, selectedClassName]);

	// Summary stats
	const summaryStats = useMemo(() => {
		if (selectedClassName === 'all') {
			let totalStudents = allStudents.length;
			let totalPresent = 0;
			let totalAbsent = 0;
			let totalRecords = 0;

			Object.values(classStatsMap).forEach((s) => {
				if (!s) return;
				totalPresent += s.presentCount || 0;
				totalAbsent += s.absentCount || 0;
				totalRecords += s.totalRecords || 0;
			});

			const rate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;
			return { totalStudents, totalPresent, totalAbsent, rate };
		} else {
			const stats = classStatsMap[selectedClassName];
			const cls = classes.find((c) => c.className === selectedClassName);
			let totalStudents = 0;
			if (cls) {
				if (cls.selectionMode === 'students' && cls.students?.length) {
					totalStudents = cls.students.length;
				} else if (cls.grades?.length) {
					totalStudents = allStudents.filter((s) => cls.grades.includes(s.grade)).length;
				}
			}
			if (!stats) return { totalStudents, totalPresent: 0, totalAbsent: 0, rate: 0 };
			const rate = parseFloat(stats.attendanceRate) || 0;
			return {
				totalStudents,
				totalPresent: stats.presentCount || 0,
				totalAbsent: stats.absentCount || 0,
				rate,
			};
		}
	}, [classStatsMap, selectedClassName, allStudents, classes]);

	// Search results computation
	const searchResults = useMemo(() => {
		// 1. Collect records by searchClass
		let records = [];
		if (searchClass === 'all') {
			const seen = new Set();
			Object.entries(classRecordsMap).forEach(([className, classRecords]) => {
				classRecords.forEach((r) => {
					const dateStr = r.date?.substring(0, 10) || '';
					const sid = r.studentId?._id || r.studentId;
					const key = `${sid}__${dateStr}`;
					if (!seen.has(key)) {
						seen.add(key);
						records.push({ ...r, _dateStr: dateStr, _className: className });
					}
				});
			});
		} else {
			records = (classRecordsMap[searchClass] || []).map((r) => ({
				...r,
				_dateStr: r.date?.substring(0, 10) || '',
				_className: searchClass,
			}));
		}

		// 2. Date range filter
		let startStr = '';
		let endStr = '';
		if (searchPeriod === 'thisMonth') {
			const now = new Date();
			const y = now.getFullYear();
			const m = String(now.getMonth() + 1).padStart(2, '0');
			const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
			startStr = `${y}-${m}-01`;
			endStr = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;
		} else if (searchPeriod === 'last3') {
			const now = new Date();
			const end = new Date(now);
			const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
			const pad = (n) => String(n).padStart(2, '0');
			startStr = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-01`;
			endStr = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;
		} else if (searchPeriod === 'custom') {
			startStr = searchStartDate;
			endStr = searchEndDate;
		}

		if (startStr || endStr) {
			records = records.filter((r) => {
				const d = r._dateStr;
				if (startStr && d < startStr) return false;
				if (endStr && d > endStr) return false;
				return true;
			});
		}

		// 3. Status filter
		if (searchStatus !== 'all') {
			records = records.filter((r) => r.status === searchStatus);
		}

		// 4. Group by student
		const studentMap = {};
		records.forEach((r) => {
			const sid = r.studentId?._id || r.studentId;
			if (!sid) return;
			if (!studentMap[sid]) {
				studentMap[sid] = {
					id: sid,
					name: r.studentId?.fullName || '알 수 없음',
					grade: r.studentId?.grade || '',
					className: r._className,
					matchCount: 0,
					presentCount: 0,
					absentCount: 0,
				};
			}
			studentMap[sid].matchCount++;
			if (r.status === 'Present') studentMap[sid].presentCount++;
			else studentMap[sid].absentCount++;
		});

		// 5. Sort by matchCount desc, then name asc
		return Object.values(studentMap)
			.map((s) => ({
				...s,
				rate: s.matchCount > 0 ? Math.round((s.presentCount / s.matchCount) * 100) : 0,
			}))
			.sort((a, b) => b.matchCount - a.matchCount || a.name.localeCompare(b.name));
	}, [classRecordsMap, searchClass, searchPeriod, searchStartDate, searchEndDate, searchStatus]);

	const getRateColor = (rate) => {
		if (rate >= 80) return 'bg-emerald-500';
		if (rate >= 60) return 'bg-amber-500';
		return 'bg-rose-500';
	};

	const getRateTextColor = (rate) => {
		if (rate >= 80) return 'text-emerald-600';
		if (rate >= 60) return 'text-amber-600';
		return 'text-rose-600';
	};

	if (isLoadingInit) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
				<p className="text-rose-500 font-medium">{error}</p>
			</div>
		);
	}

	return (
		<>
			{toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

			<div className="space-y-6">
				{/* Page Header */}
				<div className="flex items-center gap-3">
					<div>
						<div className="flex items-center gap-2">
							<h1 className="text-xl font-bold text-gray-900">출석 통계</h1>
							{schoolYear && (
								<span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
									{schoolYear.replace('_', '-')}
								</span>
							)}
						</div>
						<p className="text-sm text-gray-500 mt-0.5">반별 출석률 및 위험군 학생 현황</p>
					</div>
				</div>

				{/* Class Selector */}
				<div className="flex flex-wrap gap-2">
					<button
						onClick={() => setSelectedClassName('all')}
						className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:cursor-pointer ${
							selectedClassName === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
					>
						전체
					</button>
					{classes.map((cls) => (
						<button
							key={cls.className}
							onClick={() => setSelectedClassName(cls.className)}
							className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:cursor-pointer ${
								selectedClassName === cls.className
									? 'bg-primary-500 text-white'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}`}
						>
							{cls.className}
						</button>
					))}
				</div>

				{isLoadingDetails ? (
					<div className="flex items-center justify-center py-16">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
					</div>
				) : (
					<>
						{/* Attendance Search Section */}
						<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
							<div className="bg-gradient-to-br from-indigo-500 to-indigo-600 px-5 py-3">
								<div className="flex items-center gap-2">
									<Search className="w-4 h-4 text-white" />
									<h2 className="text-sm font-bold text-white">출석 조회</h2>
								</div>
							</div>

							<div className="p-5 space-y-4">
								{/* Filter: Class */}
								<div className="flex flex-wrap items-center gap-2">
									<span className="text-xs font-semibold text-gray-500 w-10">반</span>
									<button
										onClick={() => setSearchClass('all')}
										className={`px-3 py-1 rounded-full text-xs font-medium transition-colors hover:cursor-pointer ${searchClass === 'all' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
									>
										전체
									</button>
									{classes.map((cls) => (
										<button
											key={cls.className}
											onClick={() => setSearchClass(cls.className)}
											className={`px-3 py-1 rounded-full text-xs font-medium transition-colors hover:cursor-pointer ${searchClass === cls.className ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
										>
											{cls.className}
										</button>
									))}
								</div>

								{/* Filter: Period */}
								<div className="flex flex-wrap items-center gap-2">
									<span className="text-xs font-semibold text-gray-500 w-10">기간</span>
									{[
										{ value: 'all', label: '전체' },
										{ value: 'thisMonth', label: '이번 달' },
										{ value: 'last3', label: '지난 3개월' },
										{ value: 'custom', label: '직접 입력' },
									].map((opt) => (
										<button
											key={opt.value}
											onClick={() => setSearchPeriod(opt.value)}
											className={`px-3 py-1 rounded-full text-xs font-medium transition-colors hover:cursor-pointer ${searchPeriod === opt.value ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
										>
											{opt.label}
										</button>
									))}
									{searchPeriod === 'custom' && (
										<div className="flex items-center gap-1.5 mt-1 sm:mt-0">
											<input
												type="date"
												value={searchStartDate}
												onChange={(e) => setSearchStartDate(e.target.value)}
												className="border border-gray-300 rounded-lg px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
											/>
											<span className="text-xs text-gray-400">~</span>
											<input
												type="date"
												value={searchEndDate}
												onChange={(e) => setSearchEndDate(e.target.value)}
												className="border border-gray-300 rounded-lg px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
											/>
										</div>
									)}
								</div>

								{/* Filter: Status */}
								<div className="flex flex-wrap items-center gap-2">
									<span className="text-xs font-semibold text-gray-500 w-10">출석</span>
									{[
										{ value: 'all', label: '전체' },
										{ value: 'Present', label: '출석' },
										{ value: 'Absent', label: '결석' },
									].map((opt) => (
										<button
											key={opt.value}
											onClick={() => setSearchStatus(opt.value)}
											className={`px-3 py-1 rounded-full text-xs font-medium transition-colors hover:cursor-pointer ${searchStatus === opt.value ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
										>
											{opt.label}
										</button>
									))}
								</div>

								{/* Result count */}
								<p className="text-xs text-gray-500">
									결과: <span className="font-semibold text-gray-700">{searchResults.length}명</span> 검색됨
								</p>

								{/* Results */}
								{searchResults.length === 0 ? (
									<div className="py-8 text-center text-gray-400 text-sm">조건에 맞는 학생이 없습니다</div>
								) : (
									<>
										{/* Mobile: card list */}
										<div className="sm:hidden divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
											{searchResults.map((s) => (
												<div key={s.id} className="p-4 flex items-center justify-between">
													<div>
														<p className="text-sm font-semibold text-gray-900">{s.name}</p>
														<p className="text-xs text-gray-500">
															{s.grade ? `${s.grade}학년` : '—'} · {s.className}
														</p>
													</div>
													<div className="text-right">
														<span className={`text-base font-bold ${getRateTextColor(s.rate)}`}>{s.rate}%</span>
														<p className="text-xs text-gray-500">
															출석 {s.presentCount} / 결석 {s.absentCount}
														</p>
													</div>
												</div>
											))}
										</div>

										{/* Desktop: table */}
										<div className="hidden sm:block overflow-x-auto border border-gray-100 rounded-lg overflow-hidden">
											<table className="w-full text-sm">
												<thead className="bg-gray-50 border-b border-gray-200">
													<tr>
														<th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">이름</th>
														<th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">반</th>
														<th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600">출석</th>
														<th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600">결석</th>
														<th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600">출석률</th>
														<th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 min-w-[120px]"></th>
													</tr>
												</thead>
												<tbody className="divide-y divide-gray-100">
													{searchResults.map((s) => (
														<tr key={s.id} className="hover:bg-gray-50 transition-colors">
															<td className="px-4 py-2.5 font-medium text-gray-900">{s.name}</td>
															<td className="px-4 py-2.5 text-gray-600">{s.className}</td>
															<td className="px-4 py-2.5 text-center text-emerald-600 font-medium">{s.presentCount}</td>
															<td className="px-4 py-2.5 text-center text-rose-500 font-medium">{s.absentCount}</td>
															<td className={`px-4 py-2.5 text-right font-bold ${getRateTextColor(s.rate)}`}>
																{s.rate}%
															</td>
															<td className="px-4 py-2.5">
																<div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
																	<div
																		className={`h-2 rounded-full transition-all duration-700 ${getRateColor(s.rate)}`}
																		style={{ width: `${s.rate}%` }}
																	/>
																</div>
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</>
								)}
							</div>
						</div>

						{/* Summary Cards */}
						<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
							<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-primary-100 rounded-lg">
										<Users className="w-5 h-5 text-primary-600" />
									</div>
									<div>
										<p className="text-xs text-gray-500">총 학생수</p>
										<p className="text-2xl font-bold text-gray-900">{summaryStats.totalStudents}</p>
									</div>
								</div>
							</div>
							<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-emerald-100 rounded-lg">
										<CheckCircle className="w-5 h-5 text-emerald-600" />
									</div>
									<div>
										<p className="text-xs text-gray-500">총 출석 횟수</p>
										<p className="text-2xl font-bold text-gray-900">{summaryStats.totalPresent}</p>
									</div>
								</div>
							</div>
							<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-purple-100 rounded-lg">
										<TrendingUp className="w-5 h-5 text-purple-600" />
									</div>
									<div>
										<p className="text-xs text-gray-500">평균 출석률</p>
										<p className="text-2xl font-bold text-gray-900">{summaryStats.rate}%</p>
									</div>
								</div>
							</div>
							<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-rose-100 rounded-lg">
										<XCircle className="w-5 h-5 text-rose-600" />
									</div>
									<div>
										<p className="text-xs text-gray-500">총 결석 횟수</p>
										<p className="text-2xl font-bold text-gray-900">{summaryStats.totalAbsent}</p>
									</div>
								</div>
							</div>
						</div>

						{/* Class Comparison Bar Chart */}
						{selectedClassName === 'all' && classes.length > 0 && (
							<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
								<div className="bg-gradient-to-br from-primary-500 to-primary-600 px-5 py-3">
									<h2 className="text-sm font-bold text-white">반별 출석률 비교</h2>
								</div>
								<div className="p-5 space-y-4">
									{classes.map((cls) => {
										const stats = classStatsMap[cls.className];
										const rate = stats ? parseFloat(stats.attendanceRate) || 0 : 0;
										return (
											<div key={cls.className}>
												<div className="flex items-center justify-between mb-1">
													<span className="text-sm font-medium text-gray-700">{cls.className}</span>
													<span className={`text-sm font-bold ${getRateTextColor(rate)}`}>{rate}%</span>
												</div>
												<div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
													<div
														className={`h-4 rounded-full transition-all duration-700 ${getRateColor(rate)}`}
														style={{ width: `${rate}%` }}
													/>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						)}

						{/* Monthly Trend Bar Chart */}
						<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
							<div className="bg-gradient-to-br from-primary-500 to-primary-600 px-5 py-3">
								<h2 className="text-sm font-bold text-white">
									월별 출석 추이
									{selectedClassName !== 'all' && (
										<span className="ml-2 text-primary-200 font-normal">— {selectedClassName}</span>
									)}
								</h2>
							</div>
							<div className="p-5">
								{monthlyTrend.length === 0 ? (
									<p className="text-center text-gray-400 py-8 text-sm">출석 데이터가 없습니다</p>
								) : (
									<div className="flex items-end gap-2 h-[160px]">
										{monthlyTrend.map((m) => (
											<div key={m.month} className="flex-1 flex flex-col items-center gap-1 min-w-0">
												<span className={`text-xs font-semibold ${getRateTextColor(m.rate)}`}>{m.rate}%</span>
												<div
													className={`w-full rounded-t-md transition-all duration-700 ${getRateColor(m.rate)}`}
													style={{ height: `${Math.max((m.rate / 100) * 130, 4)}px` }}
												/>
												<span className="text-[10px] text-gray-500 truncate w-full text-center">{m.label}</span>
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						{/* At-Risk Students */}
						<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
							<div className="bg-gradient-to-br from-rose-500 to-rose-600 px-5 py-3">
								<div className="flex items-center gap-2">
									<AlertTriangle className="w-4 h-4 text-white" />
									<h2 className="text-sm font-bold text-white">위험군 학생 (출석률 {AT_RISK_THRESHOLD}% 미만)</h2>
								</div>
							</div>

							{atRiskStudents.length === 0 ? (
								<div className="p-8 text-center text-gray-400 text-sm">위험군 학생이 없습니다</div>
							) : (
								<>
									{/* Mobile: card list */}
									<div className="sm:hidden divide-y divide-gray-100">
										{atRiskStudents.map((s) => (
											<div key={s.id} className="p-4 flex items-center justify-between">
												<div>
													<p className="text-sm font-semibold text-gray-900">{s.name}</p>
													<p className="text-xs text-gray-500">{s.grade ? `${s.grade}학년` : '—'}</p>
												</div>
												<div className="text-right">
													<span className={`text-lg font-bold ${getRateTextColor(s.rate)}`}>{s.rate}%</span>
													<p className="text-xs text-gray-500">
														{s.present}/{s.total}
													</p>
												</div>
											</div>
										))}
									</div>

									{/* Desktop: table */}
									<div className="hidden sm:block overflow-x-auto">
										<table className="w-full text-sm">
											<thead className="bg-gray-50 border-b border-gray-200">
												<tr>
													<th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">이름</th>
													<th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">학년</th>
													<th className="px-5 py-3 text-center text-xs font-semibold text-gray-600">출석/전체</th>
													<th className="px-5 py-3 text-right text-xs font-semibold text-gray-600">출석률</th>
													<th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 min-w-[140px]"></th>
												</tr>
											</thead>
											<tbody className="divide-y divide-gray-100">
												{atRiskStudents.map((s) => (
													<tr key={s.id} className="hover:bg-gray-50 transition-colors">
														<td className="px-5 py-3 font-medium text-gray-900">{s.name}</td>
														<td className="px-5 py-3 text-gray-600">{s.grade ? `${s.grade}학년` : '—'}</td>
														<td className="px-5 py-3 text-center text-gray-600">
															{s.present} / {s.total}
														</td>
														<td className={`px-5 py-3 text-right font-bold ${getRateTextColor(s.rate)}`}>{s.rate}%</td>
														<td className="px-5 py-3">
															<div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
																<div
																	className={`h-2 rounded-full transition-all duration-700 ${getRateColor(s.rate)}`}
																	style={{ width: `${s.rate}%` }}
																/>
															</div>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</>
							)}
						</div>
					</>
				)}
			</div>
		</>
	);
}
