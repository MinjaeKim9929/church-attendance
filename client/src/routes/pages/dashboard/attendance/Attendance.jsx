import { useNavigate } from 'react-router';
import { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import ClassCard from '../../../../components/ui/cards/ClassCard';
import { Users, Loader2, AlertCircle } from 'lucide-react';

const CLASS_ORDER_KEY = 'attendance-class-order';

const colorPalette = [
	{
		color: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
		iconColor: 'bg-pink-100 text-pink-600',
	},
	{
		color: 'bg-primary-50 border-primary-200 hover:bg-primary-100',
		iconColor: 'bg-primary-100 text-primary-600',
	},
	{
		color: 'bg-green-50 border-green-200 hover:bg-green-100',
		iconColor: 'bg-green-100 text-green-600',
	},
	{
		color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
		iconColor: 'bg-purple-100 text-purple-600',
	},
	{
		color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
		iconColor: 'bg-orange-100 text-orange-600',
	},
	{
		color: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100',
		iconColor: 'bg-cyan-100 text-cyan-600',
	},
];

export default function Attendance() {
	const navigate = useNavigate();
	const [classes, setClasses] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const [draggingId, setDraggingId] = useState(null);
	const [overIndex, setOverIndex] = useState(null);
	const draggingIdRef = useRef(null);
	const overIndexRef = useRef(null);

	useEffect(() => {
		const fetchClasses = async () => {
			try {
				setIsLoading(true);
				setError(null);

				const response = await axios.get('/class-config/current/year');
				const currentSchoolYear = response.data.schoolYear;

				const configResponse = await axios.get(`/class-config/${currentSchoolYear}`);
				const classConfig = configResponse.data;

				const transformedClasses = [
					{
						id: 'all',
						name: '전체 학생',
						grades: ['JK', 'SK', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
						description: '모든 학년',
						color: 'bg-gray-50 border-gray-300 hover:bg-gray-100',
						iconColor: 'bg-gray-100 text-gray-700',
						isAll: true,
					},
					...(classConfig.classes || []).map((cls, index) => ({
						id: cls._id || `class-${index}`,
						name: cls.className,
						selectionMode: cls.selectionMode || 'grades',
						grades: cls.grades || [],
						students: cls.students || [],
						description:
							cls.selectionMode === 'students'
								? `${cls.students?.length || 0}명의 학생`
								: cls.grades.join(', ') + '학년',
						color: colorPalette[index % colorPalette.length].color,
						iconColor: colorPalette[index % colorPalette.length].iconColor,
					})),
				];

				const savedOrder = localStorage.getItem(CLASS_ORDER_KEY);
				if (savedOrder) {
					try {
						const orderIds = JSON.parse(savedOrder);
						const ordered = [...transformedClasses].sort((a, b) => {
							const ai = orderIds.indexOf(a.id);
							const bi = orderIds.indexOf(b.id);
							if (ai === -1 && bi === -1) return 0;
							if (ai === -1) return 1;
							if (bi === -1) return -1;
							return ai - bi;
						});
						setClasses(ordered);
					} catch {
						setClasses(transformedClasses);
					}
				} else {
					setClasses(transformedClasses);
				}
			} catch (err) {
				console.error('Error fetching classes:', err);
				setError(err.response?.data?.message || '반 정보를 불러오는데 실패했습니다.');
			} finally {
				setIsLoading(false);
			}
		};

		fetchClasses();
	}, []);

	// Live preview order while dragging
	const displayClasses = useMemo(() => {
		if (!draggingId || overIndex === null) return classes;
		const fromIdx = classes.findIndex((c) => c.id === draggingId);
		if (fromIdx === overIndex) return classes;
		const next = [...classes];
		const [moved] = next.splice(fromIdx, 1);
		next.splice(overIndex, 0, moved);
		return next;
	}, [classes, draggingId, overIndex]);

	const handleDragStart = (e, id) => {
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/plain', id);

		// Custom ghost image: looks "lifted" so it's clearly separate from the grid
		const el = e.currentTarget;
		const rect = el.getBoundingClientRect();
		const ghost = el.cloneNode(true);
		ghost.style.cssText = `
			position: fixed;
			top: -9999px;
			left: -9999px;
			width: ${rect.width}px;
			transform: rotate(2deg) scale(0.95);
			box-shadow: 0 20px 40px rgba(0,0,0,0.18);
			border-radius: 16px;
			pointer-events: none;
		`;
		document.body.appendChild(ghost);
		e.dataTransfer.setDragImage(ghost, rect.width / 2, rect.height / 2);
		requestAnimationFrame(() => document.body.removeChild(ghost));

		draggingIdRef.current = id;
		setDraggingId(id);
	};

	const handleDragOver = (e, index) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
		if (index === overIndexRef.current) return;
		overIndexRef.current = index;
		setOverIndex(index);
	};

	const handleDrop = (e) => {
		e.preventDefault();
		const id = draggingIdRef.current;
		const toIdx = overIndexRef.current;
		if (id && toIdx !== null) {
			const fromIdx = classes.findIndex((c) => c.id === id);
			if (fromIdx !== toIdx) {
				const next = [...classes];
				const [moved] = next.splice(fromIdx, 1);
				next.splice(toIdx, 0, moved);
				localStorage.setItem(CLASS_ORDER_KEY, JSON.stringify(next.map((c) => c.id)));
				setClasses(next);
			}
		}
		draggingIdRef.current = null;
		overIndexRef.current = null;
		setDraggingId(null);
		setOverIndex(null);
	};

	const handleDragEnd = () => {
		draggingIdRef.current = null;
		overIndexRef.current = null;
		setDraggingId(null);
		setOverIndex(null);
	};

	const handleClassClick = (classInfo) => {
		navigate(`/dashboard/attendance/${classInfo.id}`, {
			state: { classInfo },
		});
	};

	return (
		<>
			<div className="max-w-7xl mx-auto">
				<div className="mb-6">
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">출석 관리</h1>
				</div>

				{isLoading && (
					<div className="flex flex-col items-center justify-center py-20">
						<Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
						<p className="text-gray-600 text-lg">반 정보를 불러오는 중...</p>
					</div>
				)}

				{error && !isLoading && (
					<div className="flex flex-col items-center justify-center py-20">
						<div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md w-full">
							<div className="flex items-center justify-center mb-4">
								<AlertCircle className="w-12 h-12 text-red-600" />
							</div>
							<h3 className="text-xl font-bold text-red-900 text-center mb-2">오류가 발생했습니다</h3>
							<p className="text-red-700 text-center">{error}</p>
							<button
								onClick={() => window.location.reload()}
								className="mt-6 w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
							>
								다시 시도
							</button>
						</div>
					</div>
				)}

				{!isLoading && !error && classes.length === 0 && (
					<div className="flex flex-col items-center justify-center py-20">
						<div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-8 max-w-md w-full">
							<div className="flex items-center justify-center mb-4">
								<Users className="w-12 h-12 text-gray-400" />
							</div>
							<h3 className="text-xl font-bold text-gray-900 text-center mb-2">등록된 반이 없습니다</h3>
							<p className="text-gray-600 text-center">먼저 설정에서 반을 추가해주세요.</p>
						</div>
					</div>
				)}

				{!isLoading && !error && classes.length > 0 && (
					<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-5">
						{displayClasses.map((classInfo, index) => (
							<div
								key={classInfo.id}
								draggable
								onDragStart={(e) => handleDragStart(e, classInfo.id)}
								onDragOver={(e) => handleDragOver(e, index)}
								onDrop={handleDrop}
								onDragEnd={handleDragEnd}
								className="cursor-grab active:cursor-grabbing"
							>
								<ClassCard
									classInfo={classInfo}
									onClick={() => handleClassClick(classInfo)}
									isDragging={draggingId === classInfo.id}
									isDragActive={!!draggingId}
								/>
							</div>
						))}
					</div>
				)}
			</div>
		</>
	);
}
