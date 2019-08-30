const mongoose = require('mongoose');
const sanitize = require('mongo-sanitize');
const Book = mongoose.model('Book');
const Review = mongoose.model('Review');

function getIndex(req, res) {
    console.log('yeet');
    res.redirect('/books');
}

function getBooks(req, res) {
    if (req.query['filterBy']){
        Book.find({[sanitize(req.query['filterBy'])]: sanitize(req.query["filterBody"])}, function(err, books, count) {
            res.render('books', {books})
        });
    } else {
        Book.find(function(err, books, count) {
            res.render('books', {books});
        });
    }
}
//
//
// db.books.insert({
//     title : "Dune",
//     author : "Frank Herbert",
//     isbn : "1234567890"
// })
// db.books.insert({
//     title : "Neuromancer",
//     author : "William Gibson",
//     isbn : "2222233333"
// })
// db.books.insert({
//     title : "Cryptonomicon",
//     author : "Neal Stephenson",
//     isbn : "3322445567"
// })
// db.books.insert({
//     title : "The Handmaid's Tale",
//     author : "Margaret Atwood",
//     isbn : "6785436789"
// })
// db.books.insert({
//     title : "Snow Crash",
//     author : "Neal Stephenson",
//     isbn : "1234567882"
// })
// db.books.insert({
//     "title" : "Quicksilver",
//     "author" : "Neal Stephenson",
//     "isbn" : "2345678901"
// });

function getBooksNew(req, res) {
    res.render('newBook');
}

function postBooksNew(req, res) {
    if (sanitize(req.body['title']) && sanitize(req.body['author']) && sanitize(req.body['isbn'])) {
        new Book({
            'title': sanitize(req.body['title']),
            'author': sanitize(req.body['author']),
            'isbn': sanitize(req.body['isbn'])
        }).save(function (err, book, count) {
            res.redirect('/books');
        });
    } else {
        res.render('newbook', {err: true});
    }
}

function getDetails(req, res) {
    Book.find({slug: sanitize(req.params.slug)}, function(err, books, count) {
        if (err) {res.status(404).send('Not found');}
        else if (!books[0]) { res.status(404).send('Not found');}
        else {
            // let parsedData = books[0];
            // console.log(parsedData['reviews'])
            // console.log(parsedData['reviews'].length)
            // for (let i = 0; i < parsedData['reviews'].length; i++){
            //     const stars =
            //     parsedData['reviews'][i]['rating'] = (new Array(0 + parsedData['reviews'][i]['rating']).join('*'));
            // }
            // console.log(parsedData['reviews'])

            res.render('details', {
                books: books[0],
                noReview: (books[0]['reviews'].length === 0)
            });
        }
    });

}

function postDetails(req, res) {
    Book.findOneAndUpdate(
        {slug: sanitize(req.params.slug)},
        {
            $push: {
                reviews: {
                    rating: sanitize(req.body['rating']),
                    name: sanitize(req.body['name']),
                    text: sanitize(req.body['text'])
                }
            }
        },
        function(err, books, count) {
            res.redirect(`/books/${sanitize(req.params.slug)}`);
    });
}

module.exports = {
    getIndex, getBooks, getBooksNew, postBooksNew, getDetails, postDetails
};