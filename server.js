const express = require('express');
require("dotenv").config()
const bcrypt = require("bcrypt");
const bodyParser = require('body-parser');
const crypto = require("crypto");
const db = require("./database");
const NodeRSA = require('node-rsa');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
const PORT = process.env.PORT || 3000;

db.connect();
if(process.env.LIB_RSA_PUB )
{
    publicKey = process.env.LIB_RSA_PUB
}
else{
    const key = new NodeRSA({ b: 512 });
    const publicKey = key.exportKey('pkcs1-public-pem');
    // const privateKey = key.exportKey('pkcs1-private-pem');
    process.env.LIB_RSA_PUB = publicKey
}

app.listen(PORT, (error)=>{
    if(!error)
        console.log("Server is Successfully Running,and listening on port: "+ PORT)
    else 
        console.log("Unable to connect to server : ", error);
    }
);

function decryptor(encryptedData){
    // Create an instance of NodeRSA with the private key
    const decryptor = new NodeRSA(privateKey);
    
    // Decrypt the encrypted data using the private key
    const decryptedData = decryptor.decrypt(encryptedData, 'utf8');
    return decryptedData;
}

async function hashPassword(password) {
    const saltRounds = 12;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    
    return {
      salt: salt,
      hash: hash
    };
}

app.get('/api/rsaPub' ,( req,res) =>{
    res.send(publicKey); 
});

// JUST AN EXAMPLE 

// app.post('/api/data', (req, res) => {
//     const encryptedData = req.body.encryptedData;
  
//     let decryptedData = decryptor(encryptedData);
  
//     // Process the decrypted data on the server
//     console.log('Decrypted data:', decryptedData);
  
//     // Send a response back to the client
//     res.json({ message: 'Data received and decrypted by the server' });
//   });
  

app.post("/api/login" , ( req,res) =>{
    const username = req.body.username;
    const encryptedPass = req.body.password;
    let decryptedData = decryptor(encryptedPass);
  
    // Process the decrypted data on the server
    console.log('Decrypted data:', decryptedData);
  
    // Send a response back to the client
    res.json({ message: 'Data received and decrypted by the server' });
  
});

