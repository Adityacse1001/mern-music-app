const express = require('express');
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const passport = require('passport');
const User=require("./models/user");
require('dotenv').config();
const mongoose = require('mongoose');
const authRoutes=require('./routes/auth');
const songRoutes = require('./routes/song');
const playlistRoutes = require('./routes/playlist');
const paymentRoutes = require("./routes/payment");
const port=8090;
const cors=require('cors');
const app = express();
// connecting mongodb to our node app

// middleware for converting the body of api into json automatically
app.use(cors());
app.use("/payment/webhook", express.raw({ type: "application/json" }));
app.use(express.json()); // After webhook
app.use(passport.initialize()); // Ensure this is here

// console.log(mongoose.connection.uri);
// console.log(process.env) 
// console.log(process.env.MONGO_PASSWORD);
mongoose.connect(process.env.mongodbUrl,{
    useNewUrlParser: true,
    useUnifiedTopology: true  // useNewUrlParser: true is needed for Node 10 or later versions.
 
}).then((x)=>{
    console.log("Connected to Mongoose")
}).catch((err)=>{
    console.log("error while connecting to Mongo"+ err);
});

// set-up password-jwt
var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secret';
// opts.issuer = 'accounts.examplesoft.com';
// opts.audience = 'yoursite.net';
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findById({ _id: jwt_payload.sub}, function(err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
            // or you could create a new account
        }
    });
}));


app.get("/",(req, res) => {
res.send("Hello World")
});

// app.get("/check",(req, res) => {
  
// })

app.use("/auth",authRoutes);
app.use("/song",songRoutes);
app.use("/playlist",playlistRoutes);
app.use("/payment", paymentRoutes); // New payment routes

app.listen(port, () => {
console.log(`Server is running at http://localhost:${port}`)
});