const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const checkAttendance = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URL);
		console.log('✅ Connected to MongoDB\n');

		const collections = await mongoose.connection.db.listCollections().toArray();
		console.log('📁 All collections in database:');
		collections.forEach((col) => console.log('   -', col.name));

		// Check if attendances_25_26 exists and has data
		const attendanceColl = mongoose.connection.db.collection('attendances_25_26');
		const count = await attendanceColl.countDocuments();
		console.log('\n📊 Attendance records in attendances_25_26:', count);

		if (count > 0) {
			const samples = await attendanceColl.find().limit(5).toArray();
			console.log('\n📝 Sample records:');
			samples.forEach((record, i) => {
				console.log(`\nRecord ${i + 1}:`);
				console.log('  Date:', new Date(record.date).toISOString().split('T')[0]);
				console.log('  Class:', record.class);
				console.log('  Status:', record.status);
				console.log('  Student ID:', record.studentId);
			});
		} else {
			console.log('\n⚠️  No attendance records found.');
			console.log('💡 Tip: Try saving attendance from the frontend UI');
		}

		process.exit(0);
	} catch (error) {
		console.error('❌ Error:', error.message);
		process.exit(1);
	}
};

checkAttendance();
