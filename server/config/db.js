const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI); // No need for deprecated options
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

// Event listeners for mongoose connection
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

module.exports = connectDB;
