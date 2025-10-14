import { useNavigate } from 'react-router';
import Sidebar from '../../../../components/Sidebar';
import { Users, ChevronRight } from 'lucide-react';

export default function Attendance() {
	const navigate = useNavigate();

	const classes = [
		{
			id: 'all',
			name: '전체 학생',
			grades: ['JK', 'SK', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
			color: 'bg-gray-50 border-gray-300 hover:bg-gray-100',
			iconColor: 'bg-gray-100 text-gray-700',
			isAll: true,
		},
		{
			id: 'jk-gr1',
			name: '유치부',
			grades: ['JK', 'SK', '1'],
			description: 'JK, SK, 1학년',
			color: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
			iconColor: 'bg-pink-100 text-pink-600',
		},
		{
			id: 'gr2-gr4',
			name: '2 - 4학년',
			grades: ['2', '3', '4'],
			color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
			iconColor: 'bg-blue-100 text-blue-600',
		},
		{
			id: 'gr5-gr6',
			name: '5 - 6학년',
			grades: ['5', '6'],
			color: 'bg-green-50 border-green-200 hover:bg-green-100',
			iconColor: 'bg-green-100 text-green-600',
		},
		{
			id: 'gr7-gr8',
			name: '7 - 8학년',
			grades: ['7', '8'],
			color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
			iconColor: 'bg-purple-100 text-purple-600',
		},
		{
			id: 'highschool',
			name: '고등부',
			grades: ['9', '10', '11', '12'],
			description: '9-12학년',
			color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
			iconColor: 'bg-orange-100 text-orange-600',
		},
	];

	const handleClassClick = (classInfo) => {
		navigate(`/dashboard/attendance/${classInfo.id}`, {
			state: { classInfo },
		});
	};

	return (
		<div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
			<Sidebar />
			<main className="flex-1 overflow-y-auto">
				<div className="p-4 sm:p-8 lg:pl-8 pt-20 lg:pt-6 max-w-7xl mx-auto">
					{/* Header */}
					<div className="mb-6 sm:mb-10">
						<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">출석 관리</h1>
						<p className="text-sm sm:text-base lg:text-lg text-gray-600">반을 선택하여 출석을 관리하세요</p>
					</div>

					{/* Class Cards Grid */}
					<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-5">
						{classes.map((classInfo) => (
							<div
								key={classInfo.id}
								onClick={() => handleClassClick(classInfo)}
								className={`${classInfo.color} border-2 rounded-xl sm:rounded-2xl p-4 sm:p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-1 group relative overflow-hidden active:scale-95`}
							>
								{/* Decorative background element */}
								<div className="absolute -right-6 -top-6 sm:-right-8 sm:-top-8 w-20 h-20 sm:w-32 sm:h-32 rounded-full opacity-10 bg-gradient-to-br from-white to-transparent group-hover:scale-110 transition-transform duration-300"></div>

								<div className="relative z-10">
									<div className="flex items-center justify-between mb-3 sm:mb-6">
										<div
											className={`${classInfo.iconColor} p-2 sm:p-4 rounded-lg sm:rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300`}
										>
											<Users className="w-4 h-4 sm:w-7 sm:h-7" />
										</div>
										<ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition-all duration-300" />
									</div>
									<div className="min-h-[50px] sm:min-h-[60px] flex flex-col justify-center">
										<h3 className="text-base sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-gray-900 transition-colors leading-tight">
											{classInfo.name}
										</h3>
										{classInfo.description && (
											<p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{classInfo.description}</p>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</main>
		</div>
	);
}
