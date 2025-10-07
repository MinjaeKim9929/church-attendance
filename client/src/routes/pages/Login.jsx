import { useState } from 'react';

export default function Login() {
	const [form, setForm] = useState({ email: '', password: '' });

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = async (e) => {
		e.preventDefault();
	};

	return <></>;
}
