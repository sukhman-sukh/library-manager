let logout = document.getElementById("logout");
let add = document.getElementById("add");
let remove = document.getElementById("remove");
let searchbtn = document.getElementById("searchbtn");
let checkout = document.getElementById("checkout");
let reqbtn = document.getElementById("reqbtn");
let accept = document.getElementById("accept");
let deny = document.getElementById("deny");
let bookIdForm = document.getElementById("bookIdForm");



function checkOut(){
    // let bookId = bookIdForm.elements['bookId'].value;
    console.log(bookId )    
    // fetch(`/admin/remove?bookId=${encodeURIComponent(bookId)}&copies=${encodeURIComponent(copies)}`)
    // window.location.href = `/checkout?bookId=${encodeURIComponent(bookId)}`;
    window.location.href = `/checkout`;
}


function removeBook(){
    // var totalh2=document.getElementsByTagName("td");  
    // console.log(document.getElementsByTagName("td").innerHTML)
    // index = parseInt(id.charAt(id.length - 1));
    // console.log(data);
    // // alert(id.charAt(id.length - 1));
    // let bookId = data[index].bookId;
    // let copies = data[index].copies;
    // // let bookId = bookIdForm.elements['bookId'].value;
    // // let copies = bookIdForm.elements['copies'].value;
    // alert(bookId+' '+copies);

    // window.location.href = `/admin/remove?bookId=${encodeURIComponent(bookId)}&copies=${encodeURIComponent(copies)}`
   window.location.href = `/admin/remove`
}

// checkout.addEventListener("click", (e) => {
//     checkOut();
// });


remove.addEventListener("click", (e) => {
    removeBook();
});


