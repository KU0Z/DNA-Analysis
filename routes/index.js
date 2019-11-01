var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
const dotenv = require('dotenv').config();
var auth = require('./auth');
const crypto = require('crypto');
var passport = require('passport')
, FacebookStrategy = require('passport-facebook').Strategy;



async function connect(){
  console.log(`${process.env.API_URL}`)
  const client = await mongo.MongoClient.connect(process.env.API_URL, 
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    return client.db('ADN').collection('user');
}


var passportConfig = passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID, 
  clientSecret: process.env.FACEBOOK_APP_SECRET
}, 
async (accessToken, refreshToken, profile, done) =>{
  const db = connect(); 
  console.log(profile); 
  db.insertOne({
    Name: profile.name, 
    email: profile.emails[0].value, 
    facebookProvider: {
      id: profile.id, 
      token: accessToken
    }
  }, (err, user) =>{
    return done(err, user)
  }); 
})); 

/* GET home page. */
router.post('/signup', async (req, res, next) => {
    const data = await connect();
    //await data.createIndex({"email": 1}, {unique: true}); 
    console.log(req.body); 
    await data.insertOne({
      Name: req.body.name,
      email: req.body.email,
      password: crypto.createHmac('sha256',process.env.SECRETKEY).update(req.body.password).digest('hex')
    }, (err, data) => {
      err ? (console.log(err), res.sendStatus(409)) : (console.log(data), res.sendStatus(201))
    });
    //auth.createToken(req.query);
});

router.post('/login', async (req, res, next) =>{
  const data = await connect();
  var user = await data.findOne({ $and :[{email: req.body.email}, {password: crypto.createHmac('sha256',process.env.SECRETKEY).update(req.body.password).digest('hex')}]}
  , (err, result)=>{
    err ? console.log(err) : ( result === null ? ( res.sendStatus(204)) :
    (res.send({token: auth.createToken(req.body)})));
  } );  
  //res.sendStatus(201); 
}); 

router.post('/facebook', passport.authenticate('facebook'),(req, res, next) =>{
  console.log(req)
  !req.user ? res.send(401, 'User not authentucated') : 
  ( req.auth = {
    id: req.user.id
  }, next(), console.log(req))
}, async (req, res, next) => {
  console.log(req)
  const data = await connect();
  var user = await data.findOne({email: req.body.email}
  ,   (err, result)=>{
    err ? console.log(err) : ( result === null ? ( res.sendStatus(204)) :
    (res.send({token: auth.createToken(req.body)})));
  } ) 
})


module.exports = router;
