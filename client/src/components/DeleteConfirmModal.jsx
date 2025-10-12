import { X, AlertTriangle } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message, isDeleting }) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			{/* Overlay */}
			<div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

			{/* Modal */}
			<div className="flex min-h-full items-center justify-center p-4">
				<div className="relative bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
					{/* Header */}
					<div className="flex items-center justify-between p-6 border-b border-gray-200">
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
								<AlertTriangle className="w-5 h-5 text-red-600" />
							</div>
							<h2 className="text-xl font-semibold text-gray-900">{title || '삭제 확인'}</h2>
						</div>
						<button
							onClick={onClose}
							disabled={isDeleting}
							className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 cursor-pointer"
							aria-label="닫기"
						>
							<X className="w-6 h-6" />
						</button>
					</div>

					{/* Body */}
					<div className="p-6">
						<p className="text-gray-600">{message || '정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'}</p>
					</div>

					{/* Footer */}
					<div className="flex gap-3 px-6 pb-6">
						<button
							type="button"
							onClick={onClose}
							disabled={isDeleting}
							className="flex-1 px-4 py-2.5 bg-white text-gray-700 font-medium rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
						>
							취소
						</button>
						<button
							type="button"
							onClick={onConfirm}
							disabled={isDeleting}
							className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md disabled:bg-red-400 disabled:cursor-not-allowed cursor-pointer"
						>
							{isDeleting ? '삭제 중...' : '삭제'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
