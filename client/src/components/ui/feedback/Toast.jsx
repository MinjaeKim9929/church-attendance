import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
	useEffect(() => {
		if (duration > 0) {
			const timer = setTimeout(() => {
				onClose();
			}, duration);

			return () => clearTimeout(timer);
		}
	}, [duration, onClose]);

	const types = {
		success: {
			bg: 'bg-emerald-50',
			border: 'border-emerald-200',
			text: 'text-emerald-700',
			icon: CheckCircle,
			iconColor: 'text-emerald-600',
		},
		error: {
			bg: 'bg-rose-50',
			border: 'border-rose-200',
			text: 'text-rose-700',
			icon: XCircle,
			iconColor: 'text-rose-600',
		},
		warning: {
			bg: 'bg-amber-50',
			border: 'border-amber-200',
			text: 'text-amber-700',
			icon: AlertCircle,
			iconColor: 'text-amber-600',
		},
		info: {
			bg: 'bg-primary-50',
			border: 'border-primary-200',
			text: 'text-primary-700',
			icon: AlertCircle,
			iconColor: 'text-primary-600',
		},
	};

	const config = types[type] || types.success;
	const Icon = config.icon;

	return (
		<div className="fixed bottom-4 right-4 z-50 animate-slide-in-bottom">
			<div
				className={`${config.bg} ${config.border} border rounded-lg shadow-lg p-4 pr-10 max-w-md min-w-[300px] relative`}
			>
				<div className="flex items-start gap-3">
					<Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
					<p className={`${config.text} text-sm font-medium flex-1`}>{message}</p>
				</div>
				<button
					onClick={onClose}
					className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors hover:cursor-pointer"
					aria-label="닫기"
				>
					<X className="w-4 h-4" />
				</button>
			</div>
		</div>
	);
}
