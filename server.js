const http = require('http')
const path = require('path')
const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const expressSession = require('express-session')
const passport = require('passport')
const TwitterStrategy = require('passport-twitter').Strategy
const port = process.env.PORT || 8080

const app = express()
const server = http.createServer(app)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(expressSession({
  secret: 'my secretz are mine',
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.static(path.join(__dirname, 'public')))

passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: 'http://dude-where-is-my-auth.jotason.rocks/auth/twitter/callback'
}, (token, tokenSecret, profile, done) => {
  // check profile against database?
  done(null, profile)
}))

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

app.get('/auth/twitter', passport.authenticate('twitter'))

app.get('/auth/twitter/callback', passport.authenticate('twitter', {
  successRedirect: '/welcome',
  failureRedirect: '/'
}))

app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

app.get('/welcome', ensureAuth, (req, res) => {
  res.send(`You are welcome ${req.user.displayName}`)
})

function ensureAuth (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/')
}

server.listen(port, () => console.log(`Listening on port ${port}`))
