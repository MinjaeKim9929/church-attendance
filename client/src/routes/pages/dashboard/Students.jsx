import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { Plus, Search, ArrowUpDown } from 'lucide-react';
import AddStudentModal from '../../../components/AddStudentModal';
import Sidebar from '../../../components/Sidebar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function Students() {
	const navigate = useNavigate();
	const [students, setStudents] = useState([]);
	const [filteredStudents, setFilteredStudents] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [sortBy, setSortBy] = useState('grade');
	const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

	// Grade order for sorting
	const gradeOrder = ['JK', 'SK', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

	// Fetch students on component mount
	useEffect(() => {
		fetchStudents();
	}, []);

	// Assign permanent numbers to all students based on grade + name
	const studentsWithNumbers = students.map((student, index, array) => {
		// Sort all students by grade then name to assign permanent numbers
		const sortedForNumbering = [...array].sort((a, b) => {
			const gradeA = gradeOrder.indexOf(a.grade);
			const gradeB = gradeOrder.indexOf(b.grade);
			if (gradeA !== gradeB) {
				return gradeA - gradeB;
			}
			return a.fullName.localeCompare(b.fullName, 'ko');
		});
		// Find this student's position in the sorted array
		const permanentNumber = sortedForNumbering.findIndex((s) => s._id === student._id) + 1;
		return { ...student, permanentNumber };
	});

	// Sort and filter students based on search term and sort option
	useEffect(() => {
		let filtered = studentsWithNumbers;

		// Apply search filter
		if (searchTerm.trim() !== '') {
			filtered = studentsWithNumbers.filter(
				(student) =>
					student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
					student.christianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
					student.grade.toLowerCase() === searchTerm.toLowerCase()
			);
		}

		// Apply sorting
		const sorted = [...filtered].sort((a, b) => {
			let comparison = 0;

			if (sortBy === 'grade') {
				// Sort by grade first, then by name
				const gradeA = gradeOrder.indexOf(a.grade);
				const gradeB = gradeOrder.indexOf(b.grade);
				if (gradeA !== gradeB) {
					comparison = gradeA - gradeB;
				} else {
					comparison = a.fullName.localeCompare(b.fullName, 'ko');
				}
			} else if (sortBy === 'name') {
				// Sort by name only (alphabetical)
				comparison = a.fullName.localeCompare(b.fullName, 'ko');
			} else if (sortBy === 'number') {
				// Sort by permanent number
				comparison = a.permanentNumber - b.permanentNumber;
			}

			return sortOrder === 'asc' ? comparison : -comparison;
		});

		setFilteredStudents(sorted);
	}, [searchTerm, students, sortBy, sortOrder]);

	const fetchStudents = async () => {
		try {
			setIsLoading(true);
			setError('');
			const response = await axios.get(`${API_URL}/students`, {
				withCredentials: true,
			});
			setStudents(response.data);
			setFilteredStudents(response.data);
		} catch (err) {
			setError(err.response?.data?.message || '학생 목록을 불러오는데 실패했습니다');
		} finally {
			setIsLoading(false);
		}
	};

	const handleAddStudent = async (studentData) => {
		try {
			const response = await axios.post(`${API_URL}/students`, studentData, {
				withCredentials: true,
			});
			setStudents([response.data, ...students]);
			setIsModalOpen(false);
		} catch (err) {
			throw new Error(err.response?.data?.message || '학생 추가에 실패했습니다');
		}
	};

	const handleSort = (column) => {
		if (sortBy === column) {
			// Toggle sort order if clicking the same column
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			// Set new sort column and reset to ascending
			setSortBy(column);
			setSortOrder('asc');
		}
	};

	return (
		<div className="flex h-screen bg-gray-50">
			<Sidebar />
			<main className="flex-1 overflow-y-auto">
				<div className="p-6 sm:p-8 lg:pl-8 pt-20 lg:pt-6">
					{/* Header */}
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
						<div>
							<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">학생 관리</h1>
						</div>
						<button
							onClick={() => setIsModalOpen(true)}
							className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md cursor-pointer"
						>
							<Plus className="w-5 h-5" />
							<span>학생 추가</span>
						</button>
					</div>

					{/* Search Bar */}
					<div className="mb-6">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
							<input
								type="text"
								placeholder="이름 또는 학년으로 검색..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
							/>
						</div>
					</div>

					{/* Error Message */}
					{error && (
						<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
							<p className="text-sm text-red-600">{error}</p>
						</div>
					)}

					{/* Loading State */}
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
						</div>
					) : (
						<>
							{/* Students Count */}
							<div className="mb-4 ml-1">
								<p className="text-sm text-gray-600">
									총 {filteredStudents.length}명의 학생
									{searchTerm && ` - "${searchTerm}" 검색 결과`}
								</p>
							</div>

							{/* Students List */}
							{filteredStudents.length === 0 ? (
								<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
									<p className="text-gray-500 mb-4">
										{searchTerm ? '검색 결과가 없습니다.' : '등록된 학생이 없습니다.'}
									</p>
									{!searchTerm && (
										<button
											onClick={() => setIsModalOpen(true)}
											className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
										>
											<Plus className="w-5 h-5" />
											<span>첫 번째 학생 추가하기</span>
										</button>
									)}
								</div>
							) : (
								<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
									<div className="overflow-x-auto">
										<table className="w-full table-fixed">
											<thead className="bg-gray-50 border-b border-gray-200">
												<tr>
													<th
														onClick={() => handleSort('number')}
														className="w-16 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
													>
														<div className="flex items-center gap-1">
															<span>#</span>
															{sortBy === 'number' && (
																<ArrowUpDown className={`w-3 h-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
															)}
														</div>
													</th>
													<th
														onClick={() => handleSort('name')}
														className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
													>
														<div className="flex items-center gap-1">
															<span>이름 / 세례명</span>
															{sortBy === 'name' && (
																<ArrowUpDown className={`w-3 h-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
															)}
														</div>
													</th>
													<th
														onClick={() => handleSort('grade')}
														className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
													>
														<div className="flex items-center gap-1">
															<span>학년</span>
															{sortBy === 'grade' && (
																<ArrowUpDown className={`w-3 h-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
															)}
														</div>
													</th>
													<th
														onClick={() => handleSort('nameDay')}
														className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
													>
														<div className="flex items-center gap-1">
															<span>축일 (월)</span>
															{sortBy === 'nameDay' && (
																<ArrowUpDown className={`w-3 h-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
															)}
														</div>
													</th>
													<th className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														성별
													</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-gray-200">
												{filteredStudents.map((student, index) => (
													<tr
														key={student._id}
														onClick={() => navigate(`/dashboard/students/${student._id}`)}
														className="hover:bg-gray-50 transition-colors cursor-pointer"
													>
														<td className="px-6 py-3.5 whitespace-nowrap">
															<div className="text-sm text-gray-500">{index + 1}</div>
														</td>
														<td className="px-6 py-3.5 whitespace-nowrap">
															<div className="text-sm font-medium text-gray-900">
																{student.fullName} {student.christianName}
															</div>
														</td>
														<td className="px-6 py-3.5 whitespace-nowrap">
															<div className="text-sm text-gray-700">{student.grade}</div>
														</td>
														<td className="px-6 py-3.5 whitespace-nowrap">
															<div className="text-sm font-medium text-gray-900">
																{student.nameDayMonth ? student.nameDayMonth : '-'}
															</div>
														</td>
														<td className="px-6 py-3.5 whitespace-nowrap">
															<div className="text-sm text-gray-700">{student.gender}</div>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							)}
						</>
					)}
				</div>
			</main>

			{/* Add Student Modal */}
			{isModalOpen && <AddStudentModal onClose={() => setIsModalOpen(false)} onSubmit={handleAddStudent} />}
		</div>
	);
}
