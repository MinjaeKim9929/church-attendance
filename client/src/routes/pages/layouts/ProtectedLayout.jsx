import { Outlet, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { useAuth } from '../../../context/useAuth';

export default function ProtectedLayout() {
	const { user, isLoading } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoading && !user) {
			navigate('/login');
		}
	}, [isLoading, user, navigate]);

	if (isLoading) return <div>Loading...</div>;

	return <Outlet />;
}
