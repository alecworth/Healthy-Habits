const mongoose = require('mongoose');

const HabitCompletionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    completedCount: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('HabitCompletion', HabitCompletionSchema);