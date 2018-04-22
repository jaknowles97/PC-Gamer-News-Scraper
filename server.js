var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 3000;
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines"

// Connect to the Mongo DB
mongoose.connect(MONGODB_URI);

// Routes
// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {

  // First, we grab the body of the html with request
  axios.get("http://www.pcgamer.com/news").then(function(response) {

    var $ = cheerio.load(response.data);
    // find every div in the webpage that has a class "listingResult" 
    $(".listingResult").each(function(i, attr) {
      
      var result = {};
      // Grab the article information and place it in the result object
      result.title = $(this)
        .children()
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
      result.summary = $(this)
        .children("a")
        .children("article")
        .children("div")
        .children("p")
        .text();
      result.img = $(this)
        .children("a")
        .children("article")
        .children("div")
        .children("figure")
        .attr("data-original");

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          return res.json(err);
        });
    });
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("notes")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {

  db.Note.create(req.body)
    .then(function(dbNote) {

      return db.Article.findOneAndUpdate({ _id: req.params.id }, {$push: {notes: dbNote._id } }, { new: true });
    })

    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Start the server
app.listen(process.env.PORT || 3000, function() {
  console.log("App running on port " + PORT + "!");
});
