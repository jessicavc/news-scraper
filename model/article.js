var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
     headline: {
        type: String,
        required: true
    },
    summaryOne: {
        type: String,
        required: true
    },
    link: {
        type: String,
        unique: true,
        required: true
    },
    image: {
        type:String,
        required:true
    },
    saved: {
        type: Boolean,
        default: false
    },
    note: []
});

ArticleSchema.plugin(uniqueValidator);

// This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;
