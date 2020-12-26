const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })
const { cloudinary } = require("../cloudinary")

module.exports.index = async(req, res) => { 
    const spots = await Campground.find({});
    res.render('spots/index', { spots });
};
 
module.exports.renderNewForm = (req, res) => {
    res.render('spots/new')
}

module.exports.createSpot = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.spot.location,
        limit: 1
    }).send();
    const spot = new Campground(req.body.spot);
    spot.geometry = geoData.body.features[0].geometry;
    spot.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    spot.author = req.user._id;
    await spot.save();
    console.log(spot)
    req.flash('success', 'Successfully made a new spot!');
    res.redirect(`/spots/${spot._id}`)
}

module.exports.showSpot = async (req, res) => {
    const spot = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    // console.log(spot)
    if (!spot) {
        req.flash('error', 'Cannot find that spot!');
        return res.redirect('/spots')
    }
    res.render('spots/show', { spot })
}

module.exports.showEditForm = async (req, res) => {
    const spot = await Campground.findById(req.params.id);
    if (!spot) {
        req.flash('error', 'Cannot find that spot!');
        return res.redirect('/spots')
    }
    res.render('spots/edit', {spot})
}

module.exports.updateEdit = async (req, res) => {
    const { id } = req.params;
    console.log(req.body)
    const spot = await Campground.findByIdAndUpdate(id, { ...req.body.spot })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    spot.images.push(...imgs);
    await spot.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await spot.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } } );
        console.log(spot)
    }
    req.flash('success', 'Successfully updated spot!');
    res.redirect(`/spots/${spot._id}`)
} 

module.exports.deleteSpot = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted spot!');
    res.redirect('/spots');
}