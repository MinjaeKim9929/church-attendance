import Sidebar from '../../../components/Sidebar';

export default function Dashboard() {
	return (
		<div className="flex h-screen bg-gray-50">
			<Sidebar />
			<main className="flex-1 overflow-y-auto">
				<div className="p-6 sm:p-8 lg:pl-8 pt-16 lg:pt-6">
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">대시보드</h1>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{/* Dashboard content will go here */}
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
							<h2 className="text-lg font-semibold text-gray-900 mb-2">환영합니다</h2>
							<p className="text-gray-600">출석 관리 시스템 대시보드입니다</p>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
