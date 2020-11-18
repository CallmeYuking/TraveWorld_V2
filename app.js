const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override')
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
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
 
app.get('/', (req, res) => { 
    res.render('home');
})

app.get('/spots', async (req, res) => { 
    const spots = await Campground.find({});
    res.render('spots/index', { spots });
})

app.get('/spots/new', (req, res) => {
    res.render('spots/new')
})
app.post('/spots', async (req, res) => {
    const spot = new Campground(req.body.spot)
    await spot.save();
    res.redirect(`/spots/${spot._id}`)
})

app.get('/spots/:id', async (req, res) => {
    const spot = await Campground.findById(req.params.id);
    res.render('spots/show', { spot })
})

app.get('/spots/:id/edit', async (req, res) => {
    const spot = await Campground.findById(req.params.id);
    res.render('spots/edit', {spot})
})

app.put('/spots/:id', async (req, res) => {
    const { id } = req.params;
    const spot = await Campground.findByIdAndUpdate(id, { ...req.body.spot })
    res.redirect(`/spots/${spot._id}`)
} )


app.listen(3000, () => {
    console.log('Server on port 3000')
})