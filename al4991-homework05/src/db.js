const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');

mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);

const Review = new mongoose.Schema({
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    name: String,
    text: {
        type: String,
        required: true
    },
});

const Book = new mongoose.Schema({
   title: {
       type: String,
       required: true
   },
   author: {
       type: String,
       required: true
   },
   isbn: {
       type: String,
       required: true
   },
   reviews: [Review]
});


Book.plugin(URLSlugs(`title author`));

let book = mongoose.model("Book", Book);
let review = mongoose.model("Review", Review);

mongoose.connect('mongodb://localhost/hw05');

