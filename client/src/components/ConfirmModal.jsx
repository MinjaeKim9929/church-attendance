import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = '확인', cancelText = '취소', confirmButtonClass = 'bg-red-600 hover:bg-red-700' }) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
				<div className="flex items-start gap-4 mb-6">
					<div className="p-3 bg-amber-100 rounded-full">
						<AlertTriangle className="w-6 h-6 text-amber-600" />
					</div>
					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
						<p className="text-sm text-gray-600">{message}</p>
					</div>
				</div>
				<div className="flex gap-3">
					<button
						onClick={onClose}
						className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors hover:cursor-pointer"
					>
						{cancelText}
					</button>
					<button
						onClick={() => {
							onConfirm();
							onClose();
						}}
						className={`flex-1 px-4 py-2.5 text-white font-medium rounded-lg transition-colors hover:cursor-pointer ${confirmButtonClass}`}
					>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	);
}
