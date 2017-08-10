require('dotenv').config()

var express = require('express');
var app = express();

var session = require('cookie-session')

var bodyParser = require('body-parser');

app.set('trust proxy', 1)
app.set('port', (process.env.PORT || 5000));

app.use(session({ secret: process.env.SESS_SECRET, cookie: { maxAge: 2592000 }}))

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var twitterAPI = require('node-twitter-api');

var twitter = new twitterAPI({
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    callback: process.env.CALLBACK_URL
});

app.get('/', function(request, response) {
	response.send("Hello!");
});

app.get('/policy', function(request, response) {
	response.send("Policy will be here.");
});

app.get('/auth', function(request, response) {
	
	var sess = request.session;

	if(request.query.accessToken==null || request.query.accessTokenSecret==null) {
		
		sess.consumer_key = process.env.CONSUMER_KEY;
		sess.consumer_secret = process.env.CONSUMER_SECRET;
		
		sess.state = request.query.state;
		sess.client_id = request.query.client_id;
		sess.redirect_uri = request.query.redirect_uri;
	
		twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results){
			if (error) {
				console.log("Error getting OAuth request token : ");
				console.log(error);
			} else {
				
				sess.request_token = requestToken;
				sess.request_token_secret = requestTokenSecret;
					
				response.redirect('https://twitter.com/oauth/authenticate?oauth_token='+requestToken);
			}
		});
	
	} else {
	
		var renderHtml = `
		<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
		<body style="padding: 2rem;">
		<!-- Latest compiled and minified CSS -->
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">

		<!-- Optional theme -->
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">

		<!-- Latest compiled and minified JavaScript -->
		<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>

		<h3>Link Thingworx with Amazon Alexa</h3>
		<div class="alert alert-success">
		  <strong>Success!</strong> Your Twitter account has been linked successfully. To complete linking, please fill details about Thingworx.
		</div>
		
		<form method="post" action="generateAuth">
		<div class="form-group">
		  <label for="thingworxServer">Thingworx Server IP:port :</label>
		  <input type="text" class="form-control" id="thingworxServer" name="thingworxServer">
		</div>
		<div class="form-group">
		  <label for="thingName_connectedHome">Connected Home Thing Name :</label>
		  <input type="text" class="form-control" id="thingName_connectedHome" name="thingName_connectedHome">
		</div>
		<div class="form-group">
		  <label for="thingName_alexaAgent">Alexa Agent Thing Name :</label>
		  <input type="text" class="form-control" id="thingName_alexaAgent" name="thingName_alexaAgent">
		</div>
		<div class="form-group">
		  <label for="appkey">appkey :</label>
		  <input type="text" class="form-control" id="appkey" name="appkey">
		</div>
		<input type="hidden" name="accessToken" value="${request.query.accessToken}">
		<input type="hidden" name="accessTokenSecret" value="${request.query.accessTokenSecret}">
		
		<input type="submit" class="btn btn-info" value="Submit & Save">
		</form>
		</body>`;
		response.send(renderHtml);
	}
});

app.get('/oauth/callback', (req, res) => {
	var sess = req.session;
	
	requestToken = sess.request_token;
	requestTokenSecret = sess.request_token_secret;
	oauth_verifier =  req.query.oauth_verifier;
	
	twitter.getAccessToken(requestToken, requestTokenSecret, oauth_verifier, function(error, accessToken, accessTokenSecret, results) {
		if (error) {
			console.log(error);
		} else {

			params = {};
			twitter.verifyCredentials(accessToken, accessTokenSecret, params, function(error, data, response) {
			if (error) {
				console.log("Error while verifying.");
				res.send("Error while verifying.");
			} else {
			
				console.log("Success; name:"+data["screen_name"]);
				
				var redirect_alexa = "/auth?accessToken="+accessToken+"&accessTokenSecret="+accessTokenSecret;
				
				console.log(redirect_alexa);
				
				res.redirect(redirect_alexa);
				
			}
		});
		}
	});
});

app.post('/generateAuth', function(request, response) {
	var sess = request.session;
	
	
	if(request.body.accessToken=="" || request.body.accessTokenSecret=="") {
		console.log("Error while getting twitter tokens.");
		res.redirect("Error while getting twitter tokens.");
	} else {
		
		var accessToken = request.body.accessToken;
		var accessTokenSecret = request.body.accessTokenSecret;
		var thingworxServer = request.body.thingworxServer;
		var thingName_alexaAgent = request.body.thingName_alexaAgent;
		var thingName_connectedHome = request.body.thingName_connectedHome;
		var appkey = request.body.appkey;
		
		var redirect_alexa = decodeURI(sess.redirect_uri)+
					"#access_token="+thingworxServer+","+thingName_connectedHome+","+thingName_alexaAgent+","+appkey+","+accessToken+","+accessTokenSecret+
					"&state="+sess.state+
					"&client_id="+sess.client_id+
					"&response_type=Bearer";
					
					console.log(redirect_alexa);
					response.redirect(redirect_alexa);
	}
				
});

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});


