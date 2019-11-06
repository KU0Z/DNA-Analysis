var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
const dotenv = require('dotenv').config();
const request = require('request-promise');
var auth = require('./auth');
const crypto = require('crypto');

const imageUrl =
    'https://upload.wikimedia.org/wikipedia/commons/d/dc/Sasha_Grey_2010.jpg';
const params = {
  'returnFaceId': 'true',
  'returnFaceLandmarks': 'false',
  'returnFaceAttributes': 'age,gender,headPose,smile,facialHair,glasses,' +
      'emotion,hair,makeup,occlusion,accessories,blur,exposure,noise'
};  
var options = {
      uri: process.env.FACE_API_DETECTAR,
      qs: params,
      body: '{"url": ' + '"' + imageUrl + '"}',
      headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key' : process.env.SUBKEY
      }
  };

async function connect(){
  console.log(`${process.env.API_URL}`)
  const client = await mongo.MongoClient.connect(process.env.API_URL, 
    {
      useNewUrlParser: true
    });
    return client.db('ADN').collection('user');
}

/* GET home page. */
router.post('/',  async (req, res, next) => {
  const faceId = await request.post(options,(error, response, body) => {
    if (error) {
      console.log('Error: ', error);
      return;
    }
    let jsonResponse = JSON.stringify();

      console.log("hola" + body);
      return jsonResponse; 
  });

  res.send({id: faceId, t:12 });  
});

module.exports = router;
