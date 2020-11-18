const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');


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

const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
 
app.get('/', (req, res) => { 
    res.render('home');
})

app.get('/spots', async (req, res) => { 
    const spots = await Campground.find({});
    res.render('spots/index', { spots });
})

app.get('/spots/:id', async (req, res) => {
    const spot = await Campground.findById(req.params.id);
    res.render('spots/show', { spot })
} )

app.listen(3000, () => {
    console.log('Server on port 3000')
})