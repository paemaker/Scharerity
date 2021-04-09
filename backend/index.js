const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
// const axios = require('axios')

passport.use(
  new FacebookStrategy(
    {
      clientID: "YOUR_FACEBOOK_CLIENTID",
      clientSecret: "YOUR_FACEBOOK_SECRETID",
      //   callbackURL: 'http://localhost:4000/auth/facebook/callback',
      callbackURL: "http://localhost:8085/api/v2/authen/login",
      profileFields: ["id", "displayName", "name", "email"],
      passReqToCallback: true,
    },
    function (req, accessToken, refreshToken, profile, done) {
      try {
        if (profile) {
          req.user = profile;
          done(null, profile);
        }
      } catch (error) {
        done(error);
      }
    }
  )
);

const app = express();
app.use(cors());

// parse application/json
app.use(bodyParser.json());

app.post("http://localhost:8085/api/v2/authen/register", async (req, res) => {
  console.log("Request -->", req.body.user);

  try {
    const response = await axios({
      method: "get",
      url: `https://graph.facebook.com/v6.0/oauth/access_token?grant_type=fb_exchange_token&client_id=269562731257397&client_secret=557a28000f6f84d3ab32464a1cbf6e75&fb_exchange_token=${req.body.user.accessToken}`,
    });
    const result = response.data;
    console.log("Result -->", result);

    // If (result) --> process signup (new user) / signin (exiting user)
  } catch (error) {}
});

app.post("http://localhost:8085/api/v2/authen/register", async (req, res) => {
  console.log("Request -->", req.body.user);

  try {
    // Handle user as appropriate --> signup(new user) / signin(existing user)
  } catch (error) {}
});

app.get("/auth/facebook", passport.authenticate("facebook"));

app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    session: false,
    failureRedirect: "http://localhost:3000",
  }),
  (req, res) => {
    const user = req.user;
    // Handle user with database --> new user (sign up --> create new user) / signin
    // Send jwt token back to frontend --> response / res.cookies

    res.redirect("http://localhost:3000");
  }
);

app.listen(4000, () => console.log("Server started"));
