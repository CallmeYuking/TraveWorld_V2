const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {spotSchema} = require('../schemas.js');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');

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

router.get('/new', (req, res) => {
    res.render('spots/new')
})

router.post('/', validateSpot, catchAsync(async (req, res) => {
    // if (!req.body.spot) throw new ExpressError('Invalid Spot Data', 400);
    const spot = new Campground(req.body.spot)
    await spot.save();
    req.flash('success', 'Successfully made a new spot!');
    res.redirect(`/spots/${spot._id}`)
}))

router.get('/:id', catchAsync(async (req, res) => {
    const spot = await Campground.findById(req.params.id).populate('reviews');
    res.render('spots/show', { spot })
}))

router.get('/:id/edit', catchAsync(async (req, res) => {
    const spot = await Campground.findById(req.params.id);
    res.render('spots/edit', {spot})
}))

router.put('/:id', validateSpot, catchAsync(async (req, res) => {
    const { id } = req.params;
    const spot = await Campground.findByIdAndUpdate(id, { ...req.body.spot })
    res.redirect(`/spots/${spot._id}`)
} ))

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/spots');
}))

module.exports = router;