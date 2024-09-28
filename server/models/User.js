const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  savedGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  createdGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  upcomingSessions: [{
    title: { type: String, required: true },
    date: { type: Date, required: true }
  }]
});

// Hash password before saving the user
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare input password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
