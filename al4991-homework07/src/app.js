 const express = require("express");
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const Question = require('./db');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));

app.post('/questions/', (req, res) => {
   if (req.body["title"]) {
      new Question({
         'question': req.body["title"],
         'answers': []
      }).save(function(err) {
         if (err) {
            res.json({"error": "The question was not successfully added."});
         } else {
            res.json(req.body);
         }
      });
   }
});

app.post('/questions/:id/answers/', (req, res) => {
   Question.findByIdAndUpdate(req.params["id"], {"$push": {answers: req.body["answer"]}}, {"new": true},
       (err, docs) => {
            if (err) {
               res.json({"error": "The answer was not successfully added."});
            } else {
               res.json({"message": "Change was successful", "docs": docs});
            }
       }
   );

});

app.get('/questions/', (req, res) => {
   Question.find(function(err, questions, count) {
      if (err) return err;
      res.json(questions);
   })
});

const port = process.env.PORT || 3000;

app.listen(port, () => {console.log(`Server is listening on ${port}`)});
