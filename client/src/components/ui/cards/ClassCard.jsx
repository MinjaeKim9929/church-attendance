import { Users, ChevronRight } from 'lucide-react';

export default function ClassCard({ classInfo, onClick }) {
	return (
		<div
			onClick={onClick}
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
					<p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{classInfo.description}</p>
				</div>
			</div>
		</div>
	);
}
