var express = require("express");
var logger = require("morgan");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./model");

var PORT = process.env.PORT || 3000;

var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.set('index', __dirname + '/views');

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoscraper4";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

//api routes
app.get("/", function(req,res){
    db.article.find({saved : false}).then(result => {
        res.render('index', {
            result: result.map(result => result.toJSON())
        })
    })
});

app.get("/scrape", function(req,res){
    axios.get("https://www.npr.org/").then(function (response) {
        var $ = cheerio.load(response.data);
        var results = [];
        $(".story-wrap").each(function (i, element) {
            var headline = $(this).find(".title").text();
            var link = $(this).find(".title").parent().attr("href");
            var summary = $(this).find(".teaser").text();
            var image = $(this).find(".imagewrap").find("a").find("img").attr('src');

            if (headline && summary && link && image) {
                results.push({
                    headline: headline,
                    summaryOne: summary,
                    link: link,
                    image: image
                })
            }
        });
        db.Article.create(results)
            .then(function (dbarticle) {
                res.render("index", { dbArticle });
                console.log(dbarticle);
            })
            .catch(function (err) {
                console.log(err);
            })
        app.get("/", function (req, res) {
            res.render("index");
        })
    })
});

app.put("/update/:id", function (req, res) {
    db.Article.updateOne({ _id: req.params.id }, { $set: { saved: true } }, function (err, result) {
        if (result.changedRows == 0) {
            return res.status(404).end();
        } else {
            res.status(200).end();
        }
    });
});

app.put("/newnote/:id", function(req, res) {
    db.article.updateOne({ _id: req.body._id }, { $push: { note: req.body.note }}, function(err, result) {
        console.log(result)
        if (result.changedRows == 0) {
            return res.status(404).end();
        } else {
            res.status(200).end();
        } 
    })
})

app.put("/unsave/:id", function(req, res) {
    console.log(req.body)
    db.article.updateOne({ _id: req.params.id }, { $set: { saved: false }}, function(err, result) {
        if (result.changedRows == 0) {
            return res.status(404).end();
        } else {
            res.status(200).end();
        }
    })
})

app.delete("/articles", function (req, res) {
    db.Article.remove({})
        .then(function (dbarticle) {
            res.json(dbarticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.get("/newnote/:id", function(req, res) {
    db.article.findOne({ _id: req.params.id })
      .populate("note")
      .then(function(dbarticle) {
        res.json(dbarticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

app.post("/newnote/:id", function(req, res) {
    db.note.create(req.body)
    .then(function(dbNote) {
      return db.article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbarticle) {
      res.json(dbarticle);
    })
    .catch(function(err) {
      res.json(err);
    });
})

app.get("/saved", function (req, res) {
    var savedArticles = [];
    db.Article.find({saved : true}).then(saved => {
        savedArticles.push(saved);
        res.render('saved', {
            saved: saved.map(saved => saved.toJSON())
        })
    })
})

app.listen(PORT, function () {
    console.log("Server listening on: http://localhost:" + PORT);
});