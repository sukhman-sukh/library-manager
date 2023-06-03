let logout = document.getElementById("logout");
let add = document.getElementById("add");
let remove = document.getElementById("remove");
let searchbtn = document.getElementById("searchbtn");
let checkout = document.getElementById("checkout");
let reqbtn = document.getElementById("reqbtn");
let accept = document.getElementById("accept");
let deny = document.getElementById("deny");



// logout.addEventListener("click", (e) => {
//     fetch("/logout", {
     
//         // Adding method type
//         method: "POST",
         
//         // Adding body or contents to send
//         body: JSON.stringify({
//            status: "Success"
//         }),
         
//         // Adding headers to the request
//         headers: {
//             "Content-type": "application/json; charset=UTF-8"
//         }
//     })
// });

// add.addEventListener("click", (e) => {
//     fetch("/admin/add")
// });

// remove.addEventListener("click", (e) => {
//     fetch("/admin/remove")
// });

accept.addEventListener("click", (e) => {
    fetch("/admin/accept", {
     
        // Adding method type
        method: "POST",
         
        // Adding body or contents to send
        body: JSON.stringify({
           status: "Success"
        }),
         
        // Adding headers to the request
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
});

deny.addEventListener("click", (e) => {
    fetch("/admin/deny", {
     
        // Adding method type
        method: "POST",
         
        // Adding body or contents to send
        body: JSON.stringify({
           status: "Success"
        }),
         
        // Adding headers to the request
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
});



searchbtn.addEventListener("click", (e) => {
    fetch("/searchbtn", {
     
        // Adding method type
        method: "POST",
         
        // Adding body or contents to send
        body: JSON.stringify({
           status: "Success"
        }),
         
        // Adding headers to the request
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
});
checkout.addEventListener("click", (e) => {
    fetch("/checkout", {
     
        // Adding method type
        method: "POST",
         
        // Adding body or contents to send
        body: JSON.stringify({
           status: "Success"
        }),
         
        // Adding headers to the request
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
});

reqbtn.addEventListener("click", (e) => {
    fetch("/reqbtn", {
     
        // Adding method type
        method: "POST",
         
        // Adding body or contents to send
        body: JSON.stringify({
           status: "Success"
        }),
         
        // Adding headers to the request
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
});

