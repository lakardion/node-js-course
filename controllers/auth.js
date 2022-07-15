import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import sendgridTransport from 'nodemailer-sendgrid-transport'
import crypto from 'crypto'

import { User } from '../models/index.js'


const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: process.env.SENDGRID_API_KEY
  }
}))

export const getLogin = (req, res, next) => {
  const [errorMessage] = req.flash('error')
  const [successMessage] = req.flash('success')

  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: req.session.isLoggedIn,
    csrfToken: req.csrfToken(),
    errorMessage,
    successMessage
  });
};


export const postLogin = async (req, res, next) => {
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

export const postLogout = async (req, res, next) => {
  req.session.destroy((err) => {
    if (err) console.error(err)
    res.redirect('/')
  })
}

export const getSignup = (req, res, next) => {
  const [errorMessage] = req.flash('error')
  const [successMessage] = req.flash('success')
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage,
    successMessage
  });
}

export const postSignup = async (req, res, next) => {
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
  res.redirect('/')
  try {
    return await transporter.sendMail({
      to: email,
      from: process.env.SENDGRID_EMAIL,
      subject: 'Signup succeeded',
      html: '<h1> Welcome! </h1> <p> Your signup was completed successfully, we look forward to receiving your first order! </p>'
    })

  } catch (sendgridError) {
    console.log({ sendgridError })
  }
};

export const getReset = async (req, res, next) => {
  const { token } = req.query
  const [errorMessage] = req.flash('error')
  const [successMessage] = req.flash('success')
  if (token) {
    const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    if (!user) {
      req.flash('error', 'Invalid token')
      return res.redirect('/reset')
    }
    return res.render('auth/reset-password', {
      path: '/reset-password', pageTitle: 'Reset password', errorMessage, userId: user._id, successMessage
    })
  }
  res.render(
    'auth/reset', {
    path: '/reset', pageTitle: 'Reset password', errorMessage, successMessage
  }
  )
}
export const postReset = (req, res, next) => {
  crypto.randomBytes(32, async (cryptoError, buffer) => {
    if (cryptoError) {
      console.error({ cryptoError })
      return res.redirect('/reset')
    }
    const token = buffer.toString('hex')
    try {
      const user = await User.findOne({ email: req.body.email })
      if (!user) {
        req.flash('error', 'No account with that email found')
        return res.redirect('/reset')
      }
      user.resetToken = token;
      const ONE_HOUR_MS = 60 * 60 * 1000
      user.resetTokenExpiration = Date.now() + ONE_HOUR_MS
      await user.save()
      res.redirect('/')
      return transporter.sendMail({
        to: user.email,
        from: process.env.SENDGRID_EMAIL,
        subject: 'Reset password',
        html: `
          <p> You requested a password reset </p>
          <p> Click this <a href="${process.env.BASE_URL}/reset?token=${token}">link</a> to reset your password. Or ignore this email if this was not you </p>
        `
      })

    } catch (userError) {
      console.error(userError)
      req.flash('error', 'There has been an error while resetting password')
      return res.redirect('/reset')
    }
  })
}
export const postResetPassword = async (req, res, next) => {
  const { password
    // , confirmPassword
    , userId } = req.body
  // todo: validate
  try {
    // ! in the course Max does check again for the token expiration here... I did not add this since I did not pass around the token adn token expiration, but definitely could have done it as well
    const user = await User.findOne({ _id: userId })
    user.password = await bcrypt.hash(password, 12)
    await user.save()
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save()
    req.flash('success', 'Password reset successfully, login again with your new credentials')
    res.redirect('/login')
  } catch (userError) {
    console.error({ userError })
    req.flash('error', 'There was an error resetting the password')
    res.redirect('/reset')
  }
}