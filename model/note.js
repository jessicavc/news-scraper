  
//note model based off of Note.Js from scraping-with-mongoose activity

var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var noteSchema = new Schema({
    body: String
});

var note = mongoose.model("Note", noteSchema);

module.exports = note;