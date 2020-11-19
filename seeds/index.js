const mongoose      = require('mongoose');
const Campground    = require('../models/campground');
const cities        = require('./cities'); 
const {places, descriptors} = require('./seedHelpers');


mongoose.connect('mongodb://localhost:27017/trave-world', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 100) + 10;
        const place = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/885364',
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Obcaecati corporis maxime ad vitae sunt est distinctio neque, delectus mollitia autem optio libero magnam. Rem quod ratione aliquam quaerat a modi!',
            price: price
        });
        await place.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});