var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
const dotenv = require('dotenv').config();
var auth = require('./auth');
const crypto = require('crypto');
const request = require('request-promise')
var nodemailer = require('nodemailer'); 


const imageUrl =
    'https://upload.wikimedia.org/wikipedia/commons/2/26/Alexis_Texas_2017.jpg';

const params = {
  'returnFaceId': 'true',
  'returnFaceLandmarks': 'false',
  'returnFaceAttributes': 'age,gender,headPose,smile,facialHair,glasses,' +
      'emotion,hair,makeup,occlusion,accessories,blur,exposure,noise'
};  

var transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
      user: 'analisisadnurl@gmail.com',
      pass: 'ubedoverga'
  }
}); 

async function connect(){
  console.log(`${process.env.API_URL}`)
  const client = await mongo.MongoClient.connect(process.env.API_URL, 
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    return client.db('ADN').collection('user');
}


/* GET home page. */
router.post('/signup', async (req, res, next) => {
    const data = await connect();
    //await data.createIndex({"email": 1}, {unique: true}); 
    console.log(req); 
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


/* GET home page. */
router.post('/Analyze',  async (req, res, next) => {
  console.log(req.body.ImageURL); 
  var options = {
    uri: process.env.FACE_API_DETECTAR,
    qs: params,
    body: '{"url": ' + '"' + req.body.ImageURL + '"}',
    headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key' : process.env.SUBKEY
    }
  }
  const faceId = await request.post(options,(error, response, body) => {
    if (error) {
      console.log('Error: ', error);
      return;
    }
    let jsonResponse = JSON.stringify();

      //return jsonResponse;   
      res.send({id: JSON.stringify(body).split("\\")[3].substr(1) }); 
  });
 
});

router.post('/Compare',  async (req, res, next) => {
  var options2 = {
    uri: process.env.FACE_API_COMPARAR,
    qs: params,
    body: '{"faceId1": ' + '"' + req.body.Id1 + '"'+ ',' + '"faceId2": '+ '"' + req.body.Id2 + '"}',
    headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key' : process.env.SUBKEY
    }
  };
  const result = await request.post(options2,(error, response, body) => {
    if (error) {
      console.log('Error: ', error);
      return;
    }
    let jsonResponse = JSON.stringify(body).split("\\")[4];
    const confidence = jsonResponse.substring(2, jsonResponse.length - 2); 
      let parent;
      confidence < 0.2 ? parent = 'Ninguno' :
      confidence < 0.4 ? parent = 'Primos Lejanos' :
      confidence < 0.6 ? parent = 'Primos o tíos' :
      confidence < 0.8 ? parent = 'Hermanos' :
      confidence < 0.9 ? parent = 'Papá - Mamá':
      parent = 'La misma persona'; 
      
    res.send({Confidence: confidence*100, Parent: parent });  
  });

});

router.post('/SendEmail', async (req, res, next) =>{
  console.log(req.body)
  var mailOptions = {
    from: 'analisisadnurl@gmail.com', // sender address
    to: req.body.email, // list of receivers
    subject: 'Analisis ADN', // Subject line
    html: '<table style="width: 100%;" border="0" width="100%" cellspacing="0" cellpadding="0"> ' +
    '<tbody>' +
    '<tr>' +
    '<td style="background-color: #e0e0e0;">' +
    '<p>&nbsp;</p>' +
    '<table style="width: 590px;" border="0" width="590" cellspacing="0" cellpadding="0" align="center"> ' +
    '<tbody> ' +
    '<tr> ' + 
    '<td style="height: 30px; background-color: #6200ea;"> ' +
    '<table style="height: 176px; width: 668px;" border="0" cellspacing="10" cellpadding="0" align="center"> ' +
    '<tbody> ' + 
    '<tr> ' + 
    '<td>&nbsp;</td> ' + 
    '<td style="width: 500px;"> ' +
    '<p style="text-align: center;"><span style="font-family: tahoma;"><span style="font-size: 10pt;"><span style="color: white;">Gracias por utilizar el análizador de ADN sus resultados son los siguientes: </span></span></span></p>'+
    '<p style="text-align: center;"><span style="font-family: tahoma;"><span style="font-size: 10pt;"><span style="color: white;"><strong>'+ req.body.confidence+'-'+ req.body.result + '</strong></span></span></span></p>'+
    '</td>'+
    '<td>&nbsp;</td> '+
    '</tr> '+
    '</tbody>'+
    '</table>'+
    '</td>'+
    '</tr>'+
    '</tbody>'+
    '</table>'+
    '<p>&nbsp;</p>'+
    '</td>'+
    '</tr>'+
    '</tbody>'+
    '</table>'+
    '<p>&nbsp;</p>'
  };

  transporter.sendMail(mailOptions, (err, info) =>{
    err ? console.log(err) : (console.log(info), res.send().status(200))
  }); 
}); 

module.exports = router;
