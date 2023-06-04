let chooseForm = document.getElementById("chooseForm");
let accept = document.getElementById("accept");
let deny = document.getElementById("deny");



accept.addEventListener("click", (e) => {
    chooseForm.method = 'POST'
    chooseForm.action = "/admin/choose/accept"
    chooseForm.submit();
});

deny.addEventListener("click", (e) => {
    chooseForm.method = 'POST'
    chooseForm.action = "/admin/choose/deny"
    chooseForm.submit();
});