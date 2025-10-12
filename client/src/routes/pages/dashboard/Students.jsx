import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { Plus, Search } from 'lucide-react';
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

	// Fetch students on component mount
	useEffect(() => {
		fetchStudents();
	}, []);

	// Filter students based on search term
	useEffect(() => {
		if (searchTerm.trim() === '') {
			setFilteredStudents(students);
		} else {
			const filtered = students.filter(
				(student) =>
					student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
					student.grade.toLowerCase().includes(searchTerm.toLowerCase())
			);
			setFilteredStudents(filtered);
		}
	}, [searchTerm, students]);

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

	return (
		<div className="flex h-screen bg-gray-50">
			<Sidebar />
			<main className="flex-1 overflow-y-auto">
				<div className="p-6 sm:p-8 lg:pl-8 pt-16 lg:pt-6">
					{/* Header */}
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
						<div>
							<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">학생 관리</h1>
						</div>
						<button
							onClick={() => setIsModalOpen(true)}
							className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
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
													<th className="w-1/2 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														이름
													</th>
													<th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														학년
													</th>
													<th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														성별
													</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-gray-200">
												{filteredStudents.map((student) => (
													<tr
														key={student._id}
														onClick={() => navigate(`/dashboard/students/${student._id}`)}
														className="hover:bg-gray-50 transition-colors cursor-pointer"
													>
														<td className="px-6 py-3.5 whitespace-nowrap">
															<div className="text-sm font-medium text-gray-900">{student.fullName}</div>
														</td>
														<td className="px-6 py-3.5 whitespace-nowrap">
															<div className="text-sm text-gray-700">{student.grade}</div>
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
