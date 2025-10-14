import { createBrowserRouter, RouterProvider } from 'react-router';
import ProtectedLayout from './pages/layouts/ProtectedLayout';
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
				element: <Dashboard />,
			},
			{
				path: '/dashboard/students',
				element: <Students />,
			},
			{
				path: '/dashboard/students/:id',
				element: <StudentDetail />,
			},
			{
				path: '/dashboard/attendance',
				element: <Attendance />,
			},
			{
				path: '/dashboard/attendance/:id',
				element: <ClassAttendance />,
			},
			{
				path: '/dashboard/settings',
				element: <Settings />,
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
