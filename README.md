# library-manager
It is a full stack library manager web-app made using ejs and mysql.

## Instructions To Run The LMS

1. npm install
2. Set-Up MySQL Database And Link In database.js File
3. Rename sample.env to env and Set up your env variables
4. Open Terminal and Write 
```
npm start
```
* nodemon is already setup in package.json file
5. Just go to "/" relative path and your cookies will take you to your destination.

***

## General Instructions For Using LMS
* Anyone can request Admin-Access while registering 
* For 1st time , If someone asked for admin-access , He/She will become admin automatically . From 2nd onwards, A request would be raised and existing admins could accept or deny request.
+ Books are Issued In 3 Stages => "Request Check-Out " raised by user , which when accepted by admin changes to "Checked-Out " Leading to "Request Check-In" . Which on approval gets back to the library book record database .

P.S. => Here, I Have Implemented " **Https** " and AutoLogin With Help Of Cookies.
--- 
***
# Enjoy !!!!!!
---