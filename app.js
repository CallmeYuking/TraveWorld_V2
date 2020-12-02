const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
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

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
 
app.get('/', (req, res) => { 
    res.render('home');
})

app.get('/spots', catchAsync(async (req, res) => { 
    const spots = await Campground.find({});
    res.render('spots/index', { spots });
}))

app.get('/spots/new', (req, res) => {
    res.render('spots/new')
})
app.post('/spots', catchAsync(async (req, res) => {
    // if (!req.body.spot) throw new ExpressError('Invalid Spot Data', 400);
    const spotSchema = Joi.object({
        spot: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required().min(0),
            image: Joi.string().required(),
            location: Joi.string().required(),
            description: Joi.string().required()
        }).required()
    })
    const { error } = spotSchema.validate(req.body);
    if (error) {
        const msg =  error.details.map( el => el.message).join(',');
        throw new ExpressError(msg, 400)
    }
    console.log(result)
    const spot = new Campground(req.body.spot)
    await spot.save();
    res.redirect(`/spots/${spot._id}`)
}))

app.get('/spots/:id', catchAsync(async (req, res) => {
    const spot = await Campground.findById(req.params.id);
    res.render('spots/show', { spot })
}))

app.get('/spots/:id/edit', catchAsync(async (req, res) => {
    const spot = await Campground.findById(req.params.id);
    res.render('spots/edit', {spot})
}))

app.put('/spots/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const spot = await Campground.findByIdAndUpdate(id, { ...req.body.spot })
    res.redirect(`/spots/${spot._id}`)
} ))

app.delete('/spots/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/spots');
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Something went wrong'
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('Server on port 3000')
})