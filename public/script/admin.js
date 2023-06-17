let remove = document.getElementById("remove");

function removeBook(){
   window.location.href = `/admin/remove`
}

remove.addEventListener("click", (e) => {
    removeBook();
});


