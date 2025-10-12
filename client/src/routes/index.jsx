import { createBrowserRouter, RouterProvider } from 'react-router';
import ProtectedLayout from './pages/layouts/ProtectedLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/dashboard/Dashboard';
import Students from './pages/dashboard/Students';
import StudentDetail from './pages/dashboard/StudentDetail';
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
