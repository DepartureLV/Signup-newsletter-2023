const express = require('express');
const bodyParser = require('body-parser');
const mailchimp = require('@mailchimp/mailchimp_marketing');
const path = require('path');

const app = express();

//*******before getting started*******
//please settings up the thing below from mailchimp developers doc and mailchimp dashboard.

const api = '' // copy API key from mailchimp.com > profile > settings > Extras > API key
const us = '' //log into your Mailchimp account and look at the URL in your browser. You’ll see something like https://us19.admin.mailchimp.com/; the us19 part is the server prefix.
const id = '' //find it under audience > all contacts > settings > audience name and default > under audience ID section.


//load HTML,
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/signup.html');
});

app.get('/success', function(req, res) {
    res.sendFile(path.join(__dirname, '/success.html'));
});

app.get('/failure', function(req, res) {
    res.sendFile(path.join(__dirname, '/failure.html'));
});



//mailchimp configuration and startup
//when the server set up and request successfully, it should response "health_status": "Everything's Chimpy!"
mailchimp.setConfig({
  apiKey: api,
  server: us,
});

async function run() {
    const response = await mailchimp.ping.get();
    console.log(response);
}

run();


//post request to mailchimp subscribers
app.post('/', function(req, res) {
    let fName = req.body.firstName;
    let lName = req.body.lastName;
    let email = req.body.email;

    const listId = id;
    const subscribingUser = {
    firstName: fName,
    lastName: lName,
    email: email
    };

    async function run() {
        try {
            const response = await mailchimp.lists.addListMember(listId, {
                email_address: subscribingUser.email,
                status: "subscribed",
                merge_fields: {
                FNAME: subscribingUser.firstName,
                LNAME: subscribingUser.lastName
                }
            });

            console.log(
                `Successfully added contact as an audience member. The contact's id is ${
                response.id}.`
            );
            res.redirect('/success');
        } catch (error) {
            console.error(error);
            res.redirect('/failure');
        }
    }

    run();
});

app.post('/failure', function(req, res) {
    res.redirect('/');
});

app.post('/success', function(req, res) {
    res.redirect('/');
});

//listening on port
app.listen(process.env.PORT || 3000, function(){
    console.log(`listening on port ${process.env.PORT}`);
});