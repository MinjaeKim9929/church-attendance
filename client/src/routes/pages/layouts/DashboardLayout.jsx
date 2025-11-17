import { Outlet } from 'react-router';
import Sidebar from '../../../components/Sidebar';

export default function DashboardLayout() {
	return (
		<div className="flex h-screen bg-gray-50">
			<Sidebar />
			<main className="flex-1 overflow-y-auto">
				<div className="p-4 sm:p-6 lg:p-8 lg:pl-12 lg:pr-12 pt-16 sm:pt-20 lg:pt-12">
					<Outlet />
				</div>
			</main>
		</div>
	);
}
