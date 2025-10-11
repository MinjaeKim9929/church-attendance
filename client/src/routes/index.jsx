import { createBrowserRouter, RouterProvider } from 'react-router';
import ProtectedLayout from './layouts/ProtectedLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';

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
	// {
	// 	element: <ProtectedLayout />,
	// 	children: [
	// 		{
	// 			path: '/dashboard',
	// 			element: <Dashboard />,
	// 		},
	// 	],
	// },
]);

export default function Router() {
	return <RouterProvider router={router} />;
}
