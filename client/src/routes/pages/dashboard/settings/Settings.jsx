import Sidebar from '../../../../components/Sidebar';

export default function Settings() {
	return (
		<div className="flex h-screen bg-gray-50">
			<Sidebar />
			<main className="flex-1 overflow-y-auto">
				<div className="p-6 sm:p-8 lg:pl-8 pt-20 lg:pt-7">
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">설정</h1>
				</div>
			</main>
		</div>
	);
}
