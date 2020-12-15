const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, isAuthor, validateSpot} = require('../middleware');
const spots = require('../controllers/spots')
const Campground = require('../models/campground');




router.get('/', catchAsync(spots.index));

router.get('/new', isLoggedIn, spots.renderNewForm);

router.post('/', isLoggedIn, validateSpot, catchAsync(spots.createSpot));

router.get('/:id', catchAsync(spots.showSpot));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(spots.showEditForm))

router.put('/:id', isLoggedIn, isAuthor, validateSpot, catchAsync(spots.updateEdit))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(spots.deleteSpot))

module.exports = router;