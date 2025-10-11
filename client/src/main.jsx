import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Router from './routes';

import { AuthProvider } from './context/AuthProvider';

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<AuthProvider>
			<Router />
		</AuthProvider>
	</StrictMode>
);
