var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
const dotenv = require('dotenv').config();


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
    Name: 'diego',
    email: 'diegojmoir@gmail.com',
    password: 'hola123'
  });
  res.status(201).send(); 
});

module.exports = router;
