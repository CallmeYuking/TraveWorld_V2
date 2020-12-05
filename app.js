const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const {spotSchema, reviewSchema} = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override')
const Campground = require('./models/campground');
const Review = require('./models/review');

const spots = require('./routes/spots');

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


const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg =  error.details.map( el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

app.use("/spots", spots)
 
app.get('/', (req, res) => { 
    res.render('home');
})



app.post('/spots/:id/reviews', validateReview, catchAsync(async (req, res) =>{
    const spot = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    spot.reviews.push(review);
    await review.save();
    await spot.save();
    res.redirect(`/spots/${spot._id}`);

}))

app.delete('/spots/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(req.params.reviewId);
    res.redirect(`/spots/${id}`)
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