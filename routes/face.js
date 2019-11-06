const request = require('request-promise');





const params = {
      'returnFaceId': 'true',
      'returnFaceLandmarks': 'false',
      'returnFaceAttributes': 'age,gender,headPose,smile,facialHair,glasses,' +
          'emotion,hair,makeup,occlusion,accessories,blur,exposure,noise'
  };
  
const options = {
      uri: process.env.FACE_API_DETECTAR,
      qs: params,
      body: '{"url": ' + '"' + _imageURL + '"}',
      headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key' : process.env.SUBKEY
      }
  };
  
  
request.post(options,(error, response, body) => {
    if (error) {
      console.log('Error: ', error);
      return;
    }
    let jsonResponse = JSON.stringify(JSON.parse(body), null, '  ');

      console.log("hola" + jsonResponse);
      return jsonResponse; 
  }); 

