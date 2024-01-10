var express = require("express"); 
var app = express();
var path = require("path");
var HTTP_PORT = process.env.PORT || 8080;

//import mongoose module
const mongoose = require('mongoose');
var Schema = mongoose.Schema;
 
app.use(express.static(__dirname + "/public"));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));

const {check, validationResult} = require('express-validator');

//set up MongoDB connection
let dbConnection = mongoose.createConnection(`mongodb+srv://Aishwaryamongodb:49lp5nPyAiY09HOv@web-desg-dev-pg8020.puwuilr.mongodb.net/democollection`, {useNewUrlParser: true, useUnifiedTopology: true});

//declare the model representation for document
let bookSchema = undefined;
let favBookSchema = undefined;
let bookModel = undefined;
let favBookModel = undefined;
let bookData = undefined;
let favBookData = undefined;
let selectedFavBook = undefined;

dbConnection.on('error', (err) => {console.log(`Cannot connect to database ${err}`);});
dbConnection.on('open', () => {
    console.log("Database connection successfully established")

    //initialize model representation for document/record if the connect to db is established
    bookSchema = new Schema({
        "author": String,
        "book_title": String,
        "genre": String,
        "image": String
    });

    favBookSchema = new Schema({
        "bookid": String,
        "author": String,
        "book_title": String,
        "genre": String,
        "image": String
    });

    //register schema for collection and to receive model instance
    bookModel = dbConnection.model("books_collection",bookSchema);
    favBookModel = dbConnection.model("fav_collection",favBookSchema);
});

const onHTTPStart = () => {
    console.log(`Express HTTP server listening on port ${HTTP_PORT}`);
    console.log(`open http://localhost:${HTTP_PORT} on the browser`);
}


app.get("/", function(request, response){

        bookModel.find().count((error, totalbooks) => {
            console.log(`there are ${totalbooks} records in the collection.`);
        });

        bookModel.find({}).exec(function(error, bookList){
            if (error !== null){
                console.log(`Could not retrieve all the records from database : ${error}`);
            }
            bookData = bookList;
            response.render('catalog', {books: bookList})
        });
});

app.get("/favourite", function(request, response){

        favBookModel.find().count((error, totalbooks) => {
            console.log(`there are ${totalbooks} records in the collection.`);
        });

        favBookModel.find({}).exec(function(error, bookList){
            if (error !== null){
                console.log(`Could not retrieve all the records from database : ${error}`);
            }
            favBookData = bookList;
            response.render('favourite', {favBooks: bookList})
        });
});


app.post('/clicked/:favObj', (req, res) => {
    debugger;
    let fbook = req.params.favObj;
    console.log("------request------",fbook);
    if(fbook != null){
        for (var book of bookData) {
            if (book._id.toString() === fbook.toString()) {
                var data = {
                    bookid: book._id,
                    author: book.author,
                    book_title: book.book_title,
                    genre: book.genre,
                    image: book.image
                };
            
                let myFavBook = new favBookModel(data);

                    //save the document to collection
                    myFavBook.save((err) => {
                    if (err){
                        console.log(`Cannot insert document to collection : ${err}`);
                    }else{
                        console.log(`Insert document successfully saved in the database`);
                    }
                });
            }
        }
    }
     res.sendStatus(201);
  });

  app.get("/edit/:docID", function(request, response){
    //if (request.session.userLoggedIn){
        console.log(`trying to edit document with ID ${request.params.docID} from orders_collections`);

        favBookModel.findOne({_id: request.params.docID}).exec(function(err, bookDoc){
            if (bookDoc){
                //successfully received the document with given ID
                selectedFavBook = bookData;
                console.log(`document to edit : ${bookDoc}`);
                response.render('edit', {book: bookDoc});
            }else{
                console.log(`unable to find the document with given ID : ${err}`);
                response.send("unable to find the document with given ID");
            }
        });
    // }else{
    //     response.redirect('/login');
    // }
});

app.post('/edit/:docID', [
    check('title', 'Book Title is required').notEmpty(),
    check('author', 'Book Author is required').notEmpty(),
    check('genre', 'Please Select Book\'s Genre ').notEmpty()
], function(request, response){

    const errors = validationResult(request);
    console.log(errors);

    if(!errors.isEmpty()){

        favBookModel.findOne({_id: request.params.docID}).exec(function(err, bookDoc){
            if (bookDoc){
                response.render('edit', {book: bookDoc, errors: errors.array()});
            }else{
                console.log(`unable to find the document with given ID : ${err}`);
                response.send("unable to find the document with given ID");
            }
        });
    }else{
        console.log(`request.body received : ${request.body}`);

        var title = request.body.title;
        var author = request.body.author;
        var genre = request.body.genre;
        var bimg = request.body.bimg;

        if (bimg !== undefined) {
            var imgPath = 'images/' + bimg;

            var data = {
                bookid: selectedFavBook.bookid,
                author: author,
                book_title: title,
                genre: genre,
                image: imgPath
            };
    
            console.log(`pageData : ${data}`);
    
            //update the document in database
            favBookModel.findOne({_id: request.params.docID}).exec(function(err, bookDoc){
                if (bookDoc){
                    
                    bookDoc.bookid = selectedFavBook.bookid;
                    bookDoc.author = author;
                    bookDoc.book_title= title;
                    bookDoc.genre= genre;
                    bookDoc.image= imgPath;
    
                    bookDoc.save();
    
                    response.render('editsuccess', data);
    
                }else{
                    console.log(`unable to find the document with given ID : ${err}`);
                    response.send("unable to find the document with given ID");
                }
            });
        }
    }

});

//to delete selected record
//anything after : is considered as route parameter
app.get("/delete/:docID", function(request, response){

    //if (request.session.userLoggedIn){
        console.log(`trying to delete document with ID ${request.params.docID} from orders_collections`);

        favBookModel.findByIdAndDelete({_id: request.params.docID}).exec(function(err, bookDoc){
            if(bookDoc){
                //record successfully deleted
                console.log(`document ${bookDoc} successfully deleted`);

                response.render('delete', {message: `Document for book named ${bookDoc.book_title} successfully deleted`});

            }else{
                console.log(`Unable to delete document. ${err}`);

                response.render('delete', `Unable to delete document. ${err}`);
            }
        });
    // }else{
    //     response.redirect("/login");
    // }
});

app.listen(HTTP_PORT, onHTTPStart);