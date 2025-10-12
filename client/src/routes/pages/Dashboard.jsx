import { useNavigate } from 'react-router';
import { useAuth } from '../../context/useAuth';

export default function Dashboard() {
	const { logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			await logout();
			navigate('/');
		} catch (error) {
			console.error('Logout error:', error);
		}
	};

	return (
		<div>
			<button
				onClick={handleLogout}
				className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
			>
				Logout
			</button>
		</div>
	);
}
