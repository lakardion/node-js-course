const User = require('../models/user')
const bcrypt = require('bcryptjs')
// const nodemailer = require('nodemailer')
// const sendgridTransport = require('nodemailer-sendgrid-transport')


// const transporter = nodemailer.createTransport(sendgridTransport({
//   auth: {
//     // ! use apikey from sendgrid here
//     api_key: ''
//   }
// }))

exports.getLogin = (req, res, next) => {
  const [message] = req.flash('error')
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: req.session.isLoggedIn,
    csrfToken: req.csrfToken(),
    errorMessage: message
  });
};


exports.postLogin = async (req, res, next) => {
  // this adds a session cookie to our client connect.sid
  const { email, password } = req.body
  const foundUser = await User.findOne({ email })
  if (!foundUser) {
    req.flash('error', 'Invalid credentials')
    return res.redirect('/login')
  }
  const passwordIsCorrect = await bcrypt.compare(password, foundUser.password)
  if (passwordIsCorrect) {
    req.session.user = foundUser;
    req.session.isLoggedIn = true
    return req.session.save((err) => {
      if (err) console.error(err)
      res.redirect("/");
    })
  }
  req.flash('error', 'Invalid credentials')
  return res.redirect('/login')
  // With sessions we don't have to worry about the request being discarded, we can 
};

exports.postLogout = async (req, res, next) => {
  req.session.destroy((err) => {
    if (err) console.error(err)
    res.redirect('/')
  })
}

exports.getSignup = (req, res, next) => {
  const [errorMessage] = req.flash('error')
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    csrfToken: req.csrfToken(),
    errorMessage
  });
}

exports.postSignup = async (req, res, next) => {
  const { email, password } = req.body
  // todo: validation
  const hashedPsw = await bcrypt.hash(password, 12)
  const user = await User.findOne({ email })
  if (user) {
    req.flash('error', 'Email alreaady exists, please choose another one')
    return res.redirect('/signup')
  }
  const newUser = new User({ email, password: hashedPsw, cart: { items: [] } })
  await newUser.save()
  return res.redirect('/')
  // try {
  //   return await transporter.sendMail({
  //     to: email,
  //     // ! use some email, I'm not hardcoding mine
  //     from: '',
  //     subject: 'Signup succeeded',
  //     html: '<h1> Welcome! </h1> <p> Your signup was completed successfully, we look forward to receiving your first order! </p>'
  //   })

  // } catch (sendgridError) {
  //   console.log({ sendgridError })
  // }
};
