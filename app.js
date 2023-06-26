"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const e = require("express");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
mongoose.set("strictQuery", false);

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//connect to database
mongoose.connect(
  "mongodb+srv://AayushXD:Aayush15l@cluster0.hyirwc2.mongodb.net/todolistDB"
);

//creating a schema for list of items
const itemsSchema = {
  item: String,
};
//model for database
const ItemModel = mongoose.model("Item", itemsSchema);

const item1 = new ItemModel({
  item: "Add your first note",
});

const defaultItems = [item1];

const listSchema = {
  name: String,
  listItems: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  let time = date.getDate();
  ItemModel.find({}, (err, foundItems) => {
    //add default items to database
    if (foundItems.length == 0) {
      ItemModel.insertMany(defaultItems, (err) => {
        if (err) console.log(err);

        //it will redirect to same block and will go to else block and renders the data
        res.redirect("/");
      });
    } else {
      //if items array have data it will render the data
      res.render("list", {
        listTitle: 'Main',
        newListItems: foundItems,
        time: time,
      });
    }
  });
});

//dynamically allocation route name
app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName).trim();

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        console.log("Doesnt Exist");
        const list = new List({
          name: customListName,
          listItems: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        let time = date.getDate();
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.listItems,
          time: time,
        });
      }
    } else {
      console.log(err);
    }
  });
});

app.post("/", function (req, res) {
  let itemName = req.body.newItem;
  const listName = (req.body.list).trim();
console.log(listName);

  const item = new ItemModel({
    item: itemName,
  });

  if (listName === 'Main') {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      if (!err) {
        console.log(foundList);
        foundList.listItems.push(item);
        foundList.save();
        res.redirect("/" + listName);
      }
    })
  }

});

app.post("/delete", function (req, res) {
  
  const deleteItem = req.body.deleteBtn.trim();
  const listName = (req.body.listName).trim();
  console.log(deleteItem, listName);

  if (listName === 'Main') {
    ItemModel.findByIdAndRemove(deleteItem, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Deleted.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {listItems: {_id: deleteItem}}}, function (err, foundList) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/" + listName)
      }
    })
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function (req, res) {
  console.log("Server is running in port 3000");
});
