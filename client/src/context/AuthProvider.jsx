import { useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
if (!API_URL.endsWith('/api')) {
	API_URL = API_URL.replace(/\/+$/, '');
	API_URL = API_URL + '/api';
}
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

// Set up axios interceptor to add Authorization header
axios.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	// Auto-login
	useEffect(() => {
		const fetchUser = async () => {
			try {
				const res = await axios.get('/auth/me');
				setUser(res.data);
			} catch (err) {
				console.error(err.message);
				setUser(null);
			} finally {
				setIsLoading(false);
			}
		};

		fetchUser();
	}, []);

	// Signup function
	const signup = async (userData) => {
		setError(null);
		setIsLoading(true);

		try {
			const response = await axios.post('/auth/signup', userData);
			const data = response.data;

			// Store token and user data
			if (data.token) {
				localStorage.setItem('token', data.token);
			}
			setUser(data);
			localStorage.setItem('user', JSON.stringify(data));

			return data;
		} catch (err) {
			const errorMsg = err.response?.data?.message || 'Signup failed. Please try again.';
			setError(errorMsg);
			throw new Error(errorMsg);
		} finally {
			setIsLoading(false);
		}
	};

	// Login function
	const login = async (credentials) => {
		setError(null);
		setIsLoading(true);

		try {
			const response = await axios.post('/auth/login', credentials);
			const data = response.data;

			// Store token and user data
			if (data.token) {
				localStorage.setItem('token', data.token);
			}
			setUser(data);
			localStorage.setItem('user', JSON.stringify(data));

			return data;
		} catch (err) {
			const errorMsg = err.response?.data?.message || 'Login failed. Please try again.';
			setError(errorMsg);
			throw new Error(errorMsg);
		} finally {
			setIsLoading(false);
		}
	};

	// Logout function
	const logout = async () => {
		try {
			await axios.post('/auth/logout');

			setUser(null);
			localStorage.removeItem('token');
			localStorage.removeItem('user');
			sessionStorage.removeItem('user');
		} catch (err) {
			console.error('Logout error:', err);
			setUser(null);
			localStorage.removeItem('token');
			localStorage.removeItem('user');
			sessionStorage.removeItem('user');
		}
	};

	const clearError = () => {
		setError(null);
	};

	const value = {
		user,
		isLoading,
		error,
		signup,
		login,
		logout,
		clearError,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
