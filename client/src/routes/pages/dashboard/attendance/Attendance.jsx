import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import axios from 'axios';
import ClassCard from '../../../../components/ClassCard';
import { Users, Loader2, AlertCircle } from 'lucide-react';

// Color palette for class cards
const colorPalette = [
	{
		color: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
		iconColor: 'bg-pink-100 text-pink-600',
	},
	{
		color: 'bg-primary-50 border-primary-200 hover:bg-primary-100',
		iconColor: 'bg-primary-100 text-primary-600',
	},
	{
		color: 'bg-green-50 border-green-200 hover:bg-green-100',
		iconColor: 'bg-green-100 text-green-600',
	},
	{
		color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
		iconColor: 'bg-purple-100 text-purple-600',
	},
	{
		color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
		iconColor: 'bg-orange-100 text-orange-600',
	},
	{
		color: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100',
		iconColor: 'bg-cyan-100 text-cyan-600',
	},
];

export default function Attendance() {
	const navigate = useNavigate();
	const [classes, setClasses] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchClasses = async () => {
			try {
				setIsLoading(true);
				setError(null);

				// Fetch current school year's class configuration
				const response = await axios.get('/class-config/current/year');
				const currentSchoolYear = response.data.schoolYear;

				// Fetch class configuration for current school year
				const configResponse = await axios.get(`/class-config/${currentSchoolYear}`);
				const classConfig = configResponse.data;

				// Transform backend classes to frontend format
				const transformedClasses = [
					// Add "All Students" class first
					{
						id: 'all',
						name: '전체 학생',
						grades: ['JK', 'SK', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
						description: '모든 학년',
						color: 'bg-gray-50 border-gray-300 hover:bg-gray-100',
						iconColor: 'bg-gray-100 text-gray-700',
						isAll: true,
					},
					// Add classes from database
					...(classConfig.classes || []).map((cls, index) => ({
						id: cls._id || `class-${index}`,
						name: cls.className,
						selectionMode: cls.selectionMode || 'grades',
						grades: cls.grades || [],
						students: cls.students || [],
						description: cls.selectionMode === 'students' ? `${cls.students?.length || 0}명의 학생` : cls.grades.join(', ') + '학년',
						color: colorPalette[index % colorPalette.length].color,
						iconColor: colorPalette[index % colorPalette.length].iconColor,
					})),
				];

				setClasses(transformedClasses);
			} catch (err) {
				console.error('Error fetching classes:', err);
				setError(err.response?.data?.message || '반 정보를 불러오는데 실패했습니다.');
			} finally {
				setIsLoading(false);
			}
		};

		fetchClasses();
	}, []);

	const handleClassClick = (classInfo) => {
		navigate(`/dashboard/attendance/${classInfo.id}`, {
			state: { classInfo },
		});
	};

	return (
		<>
			<div className="max-w-7xl mx-auto">
				{/* Header */}
					<div className="mb-6">
						<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">출석 관리</h1>
					</div>

					{/* Loading State */}
					{isLoading && (
						<div className="flex flex-col items-center justify-center py-20">
							<Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
							<p className="text-gray-600 text-lg">반 정보를 불러오는 중...</p>
						</div>
					)}

					{/* Error State */}
					{error && !isLoading && (
						<div className="flex flex-col items-center justify-center py-20">
							<div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md w-full">
								<div className="flex items-center justify-center mb-4">
									<AlertCircle className="w-12 h-12 text-red-600" />
								</div>
								<h3 className="text-xl font-bold text-red-900 text-center mb-2">오류가 발생했습니다</h3>
								<p className="text-red-700 text-center">{error}</p>
								<button
									onClick={() => window.location.reload()}
									className="mt-6 w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
								>
									다시 시도
								</button>
							</div>
						</div>
					)}

					{/* Empty State */}
					{!isLoading && !error && classes.length === 0 && (
						<div className="flex flex-col items-center justify-center py-20">
							<div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-8 max-w-md w-full">
								<div className="flex items-center justify-center mb-4">
									<Users className="w-12 h-12 text-gray-400" />
								</div>
								<h3 className="text-xl font-bold text-gray-900 text-center mb-2">등록된 반이 없습니다</h3>
								<p className="text-gray-600 text-center">먼저 설정에서 반을 추가해주세요.</p>
							</div>
						</div>
					)}

					{/* Class Cards Grid */}
					{!isLoading && !error && classes.length > 0 && (
						<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-5">
							{classes.map((classInfo) => (
								<ClassCard key={classInfo.id} classInfo={classInfo} onClick={() => handleClassClick(classInfo)} />
							))}
						</div>
					)}
			</div>
		</>
	);
}
