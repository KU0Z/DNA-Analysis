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
      if (typeof localStorage === "undefined" || localStorage === null) {
        var LocalStorage = require('node-localstorage').LocalStorage;
        localStorage = new LocalStorage('./scratch');
      }
      localStorage.setItem('jwt',(token));
      console.log('jwt',(token));
      return token;
  }
  
  
exports.checkTokenExpiration =  (tokenU)=>{
    console.log("CHECK TOKEN");
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
    const tokenLocal = localStorage.getItem('jwt');
    console.log("checkTokenExpiration: token => " + tokenLocal);
    if(tokenLocal == null){return false;}
    jsonwebtoken.verify(tokenLocal,process.env.SECRETKEY,{algorithm :['HS256']}, (err,decoded) => {
        err  ?   (false, console.log(err)):  (true, console.log(decoded.Password));

    });
  }