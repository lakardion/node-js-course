const User = require('../models/user')
const bcrypt = require('bcryptjs')

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: req.session.isLoggedIn,
    csrfToken: req.csrfToken()
  });
};


exports.postLogin = async (req, res, next) => {
  // this adds a session cookie to our client connect.sid
  console.log('postLogin')
  const { email, password } = req.body
  const foundUser = await User.findOne({ email })
  const passwordIsCorrect = await bcrypt.compare(password, foundUser.password)
  if (!foundUser) {
    return res.status(400).send('User not found')
  }
  if (passwordIsCorrect) {
    req.session.user = foundUser;
    req.session.isLoggedIn = true
    return req.session.save((err) => {
      if (err) console.error(err)
      res.redirect("/");
    })
  }
  return res.status(400).send('Invalid credentials')
  // With sessions we don't have to worry about the request being discarded, we can 
};

exports.postLogout = async (req, res, next) => {
  console.log('hey there?', req.body)
  req.session.destroy((err) => {
    if (err) console.error(err)
    res.redirect('/')
  })
}

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    csrfToken: req.csrfToken()
  });
}

exports.postSignup = async (req, res, next) => {
  const { email, password } = req.body
  // todo: validation
  const hashedPsw = await bcrypt.hash(password, 12)
  const user = await User.findOne({ email })
  if (user) {
    return res.status(400).redirect('/signup')
  }
  const newUser = new User({ email, password: hashedPsw, cart: { items: [] } })
  await newUser.save()
  return res.redirect('/')
};
