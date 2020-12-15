const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

module.exports.userRegister = async(req, res) => {
    try {
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success', 'Welcome to Trave World!')
            res.redirect('/spots');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register')
    }

};

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login')
}

module.exports.userLogin = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/spots';
    delete req.session.returnTo;
    res.redirect(redirectUrl)
}

module.exports.userLogout = (req, res) => {
    req.logout();;
    req.flash('success', 'Goodbye!');
    res.redirect('/spots')
}