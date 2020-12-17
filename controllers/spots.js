const Campground = require('../models/campground');

module.exports.index = async(req, res) => { 
    const spots = await Campground.find({});
    res.render('spots/index', { spots });
};
 
module.exports.renderNewForm = (req, res) => {
    res.render('spots/new')
}

module.exports.createSpot = async (req, res, next) => {
    const spot = new Campground(req.body.spot)
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
    const spot = await Campground.findByIdAndUpdate(id, { ...req.body.spot })
    req.flash('success', 'Successfully updated spot!');
    res.redirect(`/spots/${spot._id}`)
} 

module.exports.deleteSpot = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted spot!');
    res.redirect('/spots');
}