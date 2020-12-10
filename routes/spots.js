const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {spotSchema} = require('../schemas.js');
const {isLoggedIn} = require('../middleware');

const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const campground = require('../models/campground');


const validateSpot = (req, res, next) => {
    const { error } = spotSchema.validate(req.body);
    if (error) {
        const msg =  error.details.map( el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => { 
    const spots = await Campground.find({});
    res.render('spots/index', { spots });
}))

router.get('/new', isLoggedIn, (req, res) => {
    res.render('spots/new')
})

router.post('/', isLoggedIn, validateSpot, catchAsync(async (req, res) => {
    // if (!req.body.spot) throw new ExpressError('Invalid Spot Data', 400);
    const spot = new Campground(req.body.spot)
    spot.author = req.user._id;
    await spot.save();
    req.flash('success', 'Successfully made a new spot!');
    res.redirect(`/spots/${spot._id}`)
}))

router.get('/:id', catchAsync(async (req, res) => {
    const spot = await Campground.findById(req.params.id).populate('reviews').populate('author');
    console.log(spot)
    if (!spot) {
        req.flash('error', 'Cannot find that spot!');
        return res.redirect('/spots')
    }
    res.render('spots/show', { spot })
}))

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const spot = await Campground.findById(req.params.id);
    if (!spot) {
        req.flash('error', 'Cannot find that spot!');
        return res.redirect('/spots')
    }
    res.render('spots/edit', {spot})
}))

router.put('/:id', isLoggedIn, validateSpot, catchAsync(async (req, res) => {
    const { id } = req.params;
    const spot = await Campground.findById(id);
    if (!spot.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/spots/${id}`)
    }
    const place = await Campground.findByIdAndUpdate(id, { ...req.body.spot })
    req.flash('success', 'Successfully updated spot!');
    res.redirect(`/spots/${spot._id}`)
} ))

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted spot!');
    res.redirect('/spots');
}))

module.exports = router;