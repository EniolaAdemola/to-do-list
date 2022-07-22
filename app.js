const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const secrete = require("./secrete")

mongoose.connect(
	"mongodb+srv://admin-eniola:"+ secrete.password +"@cluster0.velr6at.mongodb.net/todolist"
);

// log the date module
// console.log(date.getDate());

const app = express();

// check out ejs documentation to see how it woeks
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const server = process.env.PORT || 3000;

const itemSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Hey! Task name is Required"],
		trim: true,
		maxlength: [40, "Task name should nod exceed the lenght 20"],
	},
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
	name: "Welcome to your todolist",
});

const item2 = new Item({
	name: "Hit the + button to add a new item",
});

const item3 = new Item({
	name: "<-- Hit this to delete an item",
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
	name: String,
	items: [itemSchema],
});

const List = mongoose.model("list", listSchema);

app.get("/", (req, res) => {
	let day = date.getDate();

	Item.find({}, (err, foundItems) => {
		if (foundItems.length == 0) {
			Item.insertMany(defaultItems, (err) => {
				if (err) {
					console.log(err);
				} else {
					console.log("saved default item to data base!");
				}
			});
			res.redirect("/");
		} else {
			// Render a file called list in the views folder and seting a variable there to day
			res.render("list", {
				listTitle: "Today", //add day to view the date
				newListItems: foundItems,
			});
		}
	});
});

app.post("/", (req, res) => {
	const itemName = req.body.newItem;
	const listName = req.body.list;

	const item = new Item({
		name: itemName,
	});

	if (listName == "Today") {
		item.save();
		res.redirect("/");
	} else {
		List.findOne({ name: listName }, (err, foundList) => {
			foundList.items.push(item);
			foundList.save();
			res.redirect("/" + listName);
		});
	}
});

app.get("/:customeListName", (req, res) => {
	const customeListName = _.capitalize(req.params.customeListName);

	List.findOne({ name: customeListName }, (err, foundList) => {
		if (!err) {
			if (!foundList) {
				// Create a new list
				const list = new List({
					name: customeListName,
					items: defaultItems,
				});
				list.save();
				res.redirect("/" + customeListName);
			} else {
				// show an existing list
				res.render("list", {
					listTitle: foundList.name,
					newListItems: foundList.items,
				});
			}
		}
	});
});

app.post("/delete", (req, res) => {
	const checkItemId = req.body.checkbox;
	const listName = req.body.listName;

	// console.log(listName);
	if (listName === "Today") {
		// find the item by id and remove it
		Item.findByIdAndRemove(checkItemId, (err) => {
			if (err) {
				console.log(err);
			} else {
				console.log("Removed Succesfull");
			}
			res.redirect("/");
		});
	} else {
		List.findOneAndUpdate(
			{ name: listName },
			{ $pull: { items: { _id: checkItemId } } },
			(err, foundList) => {
				if (!err) {
					res.redirect("/" + listName);
				}
			}
		);
	}
});

app.listen(server, () => {
	console.log("Server has started at port ", server);
});