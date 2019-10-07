var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
const dotenv = require('dotenv').config();
var auth = require('./auth');
const crypto = require('crypto');



async function connect(){
  console.log(`${process.env.API_URL}`)
  const client = await mongo.MongoClient.connect(process.env.API_URL, 
    {
      useNewUrlParser: true
    });
    return client.db('ADN').collection('user');
}

/* GET home page. */
router.post('/', async (req, res, next) => {
    const data = await connect(); 
      await data.insertOne({
      Name: req.query.Name,
      email: req.query.email,
      password: crypto.createHmac('sha256',process.env.SECRETKEY).update(req.query.password).digest('hex')
    });
    auth.createToken(req.query);
    res.status(201).send(); 
});

module.exports = router;
