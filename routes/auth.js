var jsonwebtoken = require('jsonwebtoken');


exports.createToken = function (User){

    const payload = {
      email: User.email,
      password: User.password,
    };
    const singOptions = {
        algorithm :'HS256', 
        expiresIn: '1h'
    }
    var token = jsonwebtoken.sign(payload,process.env.SECRETKEY, singOptions)               
      console.log('jwt',(token));
      return token;
  }
  
  
exports.checkTokenExpiration =  (tokenU) => {
    console.log("CHECK TOKEN");
    jsonwebtoken.verify(tokenU ,process.env.SECRETKEY,{algorithm :['HS256']}, (err,decoded) => {
        err  ?   (false, console.log(err)):  (true, console.log(decoded.Password));
    });
  }

