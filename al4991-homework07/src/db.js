const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
  question: {
    type: String,
    required: true
  },
  answers: [String]
});

mongoose.connect('mongodb://localhost/hw07', { useNewUrlParser: true });

module.exports = Post = mongoose.model("Questions", QuestionSchema);
