
'use strict';

const mongoose = require('mongoose');

mongoose.connect(process.env.DB)
    .then(() => {
        console.log('mongodb connected successfully')
    })
    .catch(() => {
        console.log('mongodb connection failed')
    });

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: { type: Array, default: [] }
});

const BookModel = mongoose.model("BookModel", bookSchema);

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res) {
      try {
        const books = await BookModel.find();
        res.json(books.map(book => ({
          _id: book._id,
          title: book.title,
          commentcount: book.comments.length
        })));
      } catch (err) {
        res.status(500).send(err.message);
      }
    })

    .post(async function (req, res) {
      const title = req.body.title;
      if (!title) {
        return res.send('missing required field title');
      }
      try {
        const newBook = new BookModel({ title });
        await newBook.save();
        res.json({ _id: newBook._id, title: newBook.title });
      } catch (err) {
        res.status(500).send(err.message);
      }
    })

    .delete(async function (req, res) {
      try {
        await BookModel.deleteMany();
        res.send('complete delete successful');
      } catch (err) {
        res.status(500).send(err.message);
      }
    });

  app.route('/api/books/:id')
    .get(async function (req, res) {
      const bookid = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(bookid)) {
        return res.send('no book exists');
      }
      try {
        const book = await BookModel.findById(bookid);
        if (!book) {
          return res.send('no book exists');
        }
        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments
        });
      } catch (err) {
        res.status(500).send(err.message);
      }
    })

    .post(async function (req, res) {
      const bookid = req.params.id;
      const comment = req.body.comment;
      if (!comment) {
        return res.send('missing required field comment');
      }
      if (!mongoose.Types.ObjectId.isValid(bookid)) {
        return res.send('no book exists');
      }
      try {
        const book = await BookModel.findById(bookid);
        if (!book) {
          return res.send('no book exists');
        }
        book.comments.push(comment);
        await book.save();
        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments
        });
      } catch (err) {
        res.status(500).send(err.message);
      }
    })

    .delete(async function (req, res) {
      const bookid = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(bookid)) {
        return res.send('no book exists');
      }
      try {
        const book = await BookModel.findByIdAndDelete(bookid);
        if (!book) {
          return res.send('no book exists');
        }
        res.send('delete successful');
      } catch (err) {
        res.status(500).send(err.message);
      }
    });

};