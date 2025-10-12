import { createBrowserRouter, RouterProvider } from 'react-router';
import ProtectedLayout from './pages/layouts/ProtectedLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
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
