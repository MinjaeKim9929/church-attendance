import { createBrowserRouter, RouterProvider } from 'react-router';
import ProtectedLayout from './pages/layouts/ProtectedLayout';
import DashboardLayout from './pages/layouts/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/dashboard/Dashboard';
import Students from './pages/dashboard/students/Students';
import StudentDetail from './pages/dashboard/students/StudentDetail';
import Attendance from './pages/dashboard/attendance/Attendance';
import ClassAttendance from './pages/dashboard/attendance/ClassAttendance';
import Settings from './pages/dashboard/settings/Settings';
import NotFound from './pages/NotFound';

const router = createBrowserRouter([
	{
		path: '/',
		element: <Home />,
	},
	{
		path: '/login',
		element: <Login />,
	},
	{
		path: '/signup',
		element: <Signup />,
	},
	{
		element: <ProtectedLayout />,
		children: [
			{
				path: '/dashboard',
				element: <DashboardLayout />,
				children: [
					{
						index: true,
						element: <Dashboard />,
					},
					{
						path: 'students',
						element: <Students />,
					},
					{
						path: 'students/:id',
						element: <StudentDetail />,
					},
					{
						path: 'attendance',
						element: <Attendance />,
					},
					{
						path: 'attendance/:id',
						element: <ClassAttendance />,
					},
					{
						path: 'settings',
						element: <Settings />,
					},
				],
			},
		],
	},
	{
		path: '*',
		element: <NotFound />,
	},
]);

export default function Router() {
	return <RouterProvider router={router} />;
}
