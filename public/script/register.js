let mismatch = document.getElementById("mismatch");
let invalid = document.getElementById("invalid");
let registerForm = document.getElementById("registerForm");
let btnsubmit = document.getElementById("btnsubmit");

var Regex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[@$_]).+$/;
var alphanumericRegex = /^[a-zA-Z0-9]+$/;

let i=0
registerForm.method = 'POST'
registerForm.action = "/register"

function check(){
    console.log('hover')
    var Username = document.getElementById('username');
    var Password = document.getElementById('password');
    let reEnterPass = document.getElementById('reEnterPass');

    if(Password.value != reEnterPass.value ){
        mismatch.style.display = 'block'
        i=1
    }
    else if( !(Regex.test(Password.value))){
        invalid.style.display = 'block'
        i=1;
    }
    else if( !(alphanumericRegex.test(Username.value)) ){
        invalid.style.display = 'block'
        i=1;
    }
    else{
        mismatch.style.display = 'none'
        invalid.style.display = 'none'
        btnsubmit.style.cursor = 'default'
        // btnsubmit.disabled = false;
        i=0;
    }
}

btnsubmit.addEventListener("click", (e) => {
    // e.preventDefault();
    console.log(i)
    // if(btnsubmit.style.cursor == 'default')
    if(i===0){
        // invalid.style.display = 'block'
        console.log("sending request to servre")
        registerForm.submit()
        console.log("=========")
}
});