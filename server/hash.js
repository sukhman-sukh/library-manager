
const bcrypt = require("bcrypt");


exports.hashPassword= async function(password) {
    const saltRounds = 5;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    
    return {
        salt: salt,
        hash: hash
    };
}