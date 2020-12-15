const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, isAuthor, validateSpot} = require('../middleware');
const spots = require('../controllers/spots')
const Campground = require('../models/campground');




router.route('/')
    .get(catchAsync(spots.index))
    .post(isLoggedIn, validateSpot, catchAsync(spots.createSpot));

router.get('/new', isLoggedIn, spots.renderNewForm);

router.route('/:id')
    .get(catchAsync(spots.showSpot))
    .put(isLoggedIn, isAuthor, validateSpot, catchAsync(spots.updateEdit))
    .delete(isLoggedIn, isAuthor, catchAsync(spots.deleteSpot))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(spots.showEditForm))

module.exports = router;