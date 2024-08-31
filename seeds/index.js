if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
  console.log("Loaded .env file, DB_URL:", process.env.DB_URL);
}

const mongoose = require("mongoose");
const cities = require("./cities");
const Campground = require("../models/campground");
const { descriptors, places } = require("./seedHelpers");

const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 70; i++) {
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "66d30b622f63c36bc5b749a5",
      location: `${cities[i].city}, ${cities[i].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url: 'https://res.cloudinary.com/duk3bkbre/image/upload/v1725019992/CampQuest/yxlivgbarwpcrda8peyb.jpg',
          filename: 'CampQuest/yxlivgbarwpcrda8peyb'
        },
        {
          url: 'https://res.cloudinary.com/duk3bkbre/image/upload/v1725019999/CampQuest/yzud9sv4qcsoltcabygo.jpg',
          filename: 'CampQuest/yzud9sv4qcsoltcabygo'
        }
      ],
      description:
        "Discover this Campground. Enjoy stunning alpine views, tranquil lakeside activities, and peaceful sunsets in this picturesque setting.",
      price,
      geometry: {
        type: "Point",
        coordinates: [cities[i].longitude, cities[i].latitude],
      },
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
