function rsaEncrypt(data) {
    
    const encryptor = new NodeRSA();
    encryptor.importKey(publicKey, 'pkcs8-public-pem');

    // const data = 'Hello, server!';

    // Encrypt the data using the public key
    const encryptedData = encryptor.encrypt(data, 'base64');

    // Send the encrypted data to the server
    fetch('/data', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ encryptedData }),
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response from the server
        console.log(data);
    })
    .catch(error => {
        // Handle any errors
        console.error(error);
    });

}