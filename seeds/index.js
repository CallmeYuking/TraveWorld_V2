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
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 100) + 10;
        const place = new Campground({
            // Your author ID
            author: '5fd082762af818e2a8f1f0d7',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Obcaecati corporis maxime ad vitae sunt est distinctio neque, delectus mollitia autem optio libero magnam. Rem quod ratione aliquam quaerat a modi!',
            price: price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude, 
                    cities[random1000].latitude, 
                ]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/yuking/image/upload/v1608951983/TraveWorld/b7kjo8hmafycfwfqymjs.jpg',
                  filename: 'TraveWorld/b7kjo8hmafycfwfqymjs'
                },
                {
                  url: 'https://res.cloudinary.com/yuking/image/upload/v1608959509/TraveWorld/p1wz4xw4cb9euhwkyqln.jpg',
                  filename: 'TraveWorld/p1wz4xw4cb9euhwkyqln'
                }
              ]
        });
        await place.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});