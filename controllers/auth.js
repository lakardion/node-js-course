const User = require('../models/user')

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: req.session.isLoggedIn
  });
};

exports.postLogin = async (req, res, next) => {
  // this adds a session cookie to our client connect.sid
  const user = await User.findById("62cf2e73908c74bdae5f86d6");
  // ? is this okay? not sure whether the mongodb reference is okay to keep in sesssion
  // ! looks like mongodb reference is not stored fully in the reference
  req.session.user = user;
  req.session.isLoggedIn = true
  // With sessions we don't have to worry about the request being discarded, we can 
  req.session.save((err) => {
    if (err) console.error(err)
    res.redirect("/");
  })
};

exports.postLogout = async (req, res, next) => {
  req.session.destroy((err) => {
    if (err) console.error(err)
    res.redirect('/')
  })
}