'use strict';
var Alexa = require("alexa-sdk");
var appId = 'amzn1.ask.skill.***';

var unitsRef = {
    'temperature':'#val# degree celcius',
    'humidity':'#val#%'
};

var parameterDict = {
  'temperature':'Temperature',
  'humidity':'Humidity'  
};

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = appId;

    if(event.session.user.accessToken == null) {
        alexa.emit(':tellWithLinkAccountCard', "Your Thingworx parameters isn't set. Please link Thingworx via alexa app.");
    } else {
        global.accessToken = event.session.user.accessToken;
        global.accessToken = accessToken.split(',');
    }

    alexa.registerHandlers(mainHandlers);
    alexa.execute();
};

var reqBody={};

var mainHandlers = {
    'getParameter': function() {
        var parameterVal = this.event.request.intent.slots.parameter.value;
        
        if(parameterDict[parameterVal]!=null) {
            
            var myCont = this;
        
            var http = require('http');

            var options = {
            host: global.accessToken[0],
            path: '/Thingworx/Things/'+global.accessToken[1]+'/Properties/'+parameterDict[parameterVal],
            headers: {
                "Accept": "application/json",
                "appkey": global.accessToken[3]
            }
            };
            
            var callbackQ = function(response) {
                var strResult = '';
                
                response.on('data', function (chunk) {
                    strResult += chunk;
                });
                
                response.on('end', function () {
                    try {
                        var thingData = JSON.parse(strResult);
                    } catch(e) {
                        myCont.emit(':tell', "There is an error while connecting to the smart home server. Please try again later.");  
                    }
                    
                    var speechOutput = "The "+parameterVal+" in home is "+placeUnits(parameterVal, thingData.rows[0][Object.keys(thingData.rows[0])[0]])+" now.";
                    console.log("speechOutput: "+speechOutput);
                    
                    myCont.attributes['tweetCache'] =  "The "+parameterVal+" in home is "+placeUnits(parameterVal, thingData.rows[0][Object.keys(thingData.rows[0])[0]])+" now.";
                    myCont.emit(':ask', speechOutput);  
                
                });
            };
            
            http.request(options, callbackQ).end();

        } else {
            this.emit(':ask', "I didn't understand what did you ask, may you ask again?");  
        }
        
    },
    'serviceMusic': function() {
        
        var musicAction = this.event.request.intent.slots.musicAction.value;
        
       if(musicAction=="play" || musicAction=="start") {
           reqBody = {"state": true};
       } else if(musicAction=="stop" || musicAction=="mute" || musicAction=="pause") {
           reqBody = {"state": false};
       }

       if(reqBody==null) {
           this.emit(':ask', "I didn't understand what did you ask, may you ask again?");
       } else {

            var myCont = this;
        
            var http = require('http');

            var options = {
                method: 'PUT',
                host: global.accessToken[0],
                path: '/Thingworx/Things/'+global.accessToken[1]+'/Properties/PlayMusic',
                headers: {
                    "Accept": "application/json",
                    "appkey": global.accessToken[3],
                    "Content-Type": "application/json",
                }
            };
        
            var body = JSON.stringify({
             'PlayMusic': reqBody.state
            });
            
            var callbackQ = function(response) {
                var strResult = '';

                response.on('data', function (chunk) {
                    strResult += chunk;
                });
                
                response.on('end', function () {
                    if(response.statusCode!=200) {
                        myCont.emit(':tell', "There is an error while connecting to the smart home server. Please try again later.");  
                    } else {
                        var speechOutput = "Okay, music is "+ ((reqBody.state) ? "started" : "stopped")+" now.";
                        console.log("speechOutput: "+speechOutput);
                        myCont.emit(':tell', speechOutput);  
                    }
                });
            };
            
            http.request(options, callbackQ).end(body);

       }
        
    },
    'serviceArm': function() {
        
        var armAction = this.event.request.intent.slots.armAction.value;
        
       if(armAction=="on" || armAction=="enable" || armAction=="arm on") {
           reqBody = {"state": true};
       } else if(armAction=="off" || armAction=="disable" || armAction=="arm off") {
           reqBody = {"state": false};
       }

       if(reqBody==null) {
           this.emit(':ask', "I didn't understand what did you ask, may you ask again?");
       } else {

            var myCont = this;
        
            var http = require('http');

            var options = {
            method: 'PUT',
            host: global.accessToken[0],
            path: '/Thingworx/Things/'+global.accessToken[1]+'/Properties/ArmState',
            headers: {
                "Accept": "application/json",
                "appkey": global.accessToken[3],
                "Content-Type": "application/json"
            }
            };
            
            var body = JSON.stringify({
             'ArmState': reqBody.state
            });

            var callbackQ = function(response) {
                var strResult = '';
                
                response.on('data', function (chunk) {
                    strResult += chunk;
                });
                
                response.on('end', function () {
                    if(response.statusCode!=200) {
                        myCont.emit(':tell', "There is an error while connecting to the smart home server. Please try again later.");  
                    } else {
                        var speechOutput = "Okay, security system is "+ ((reqBody.state) ? "on" : "off")+" now.";
                        console.log("speechOutput: "+speechOutput);
                        myCont.emit(':tell', speechOutput);  
                    }
                });
            };
            
            http.request(options, callbackQ).end(body);

       }
        
    },
    'serviceTurn': function() {
        
        var turnAction = this.event.request.intent.slots.turnAction.value;
        
       if(turnAction=="on" || turnAction=="turn on") {
           reqBody = {"state": true};
       } else if(turnAction=="off" || turnAction=="turn off") {
           reqBody = {"state": false};
       }

       if(reqBody==null) {
           this.emit(':ask', "I didn't understand what did you ask, may you ask again?");
       } else {

            var myCont = this;
        
            var http = require('http');

            var options = {
                method: 'POST',
                host: global.accessToken[0],
                path: '/Thingworx/Things/'+global.accessToken[1]+'/Services/SetSmartPlugState',
                headers: {
                    "Accept": "application/json",
                    "appkey": global.accessToken[3],
                    "Content-Type": "application/json"
                }
            };
        
            var body = JSON.stringify({
             'state': reqBody.state
            });
            
            var callbackQ = function(response) {
                var strResult = '';
                
                response.on('data', function (chunk) {
                    strResult += chunk;
                });
                
                response.on('end', function () {
                    if(response.statusCode!=200) {
                        myCont.emit(':tell', "There is an error while connecting to the smart home server. Please try again later.");  
                    } else {
                        var speechOutput = "Okay, lights are "+ ((reqBody.state) ? "on" : "off")+" now.";
                        console.log("speechOutput: "+speechOutput);
                        myCont.emit(':tell', speechOutput);  
                    }
                });
            };
            
            http.request(options, callbackQ).end(body);

       }
        
    },
    'tweetResult': function() {
		var myCont = this;
      	var accessToken = this.event.session.user.accessToken;
		if (accessToken === null) {
			this.emit(':tell', "Your twitter account isn't linked. Please link your account with alexa app.");
		} else if(this.attributes['tweetCache'] === null) {
            this.emit(':tell', "Hmmm, nothing to tweet.");
        } else {
			accessToken = accessToken.split(',');
			
			var Twitter = require('twitter');
			var client = new Twitter({
				consumer_key: '***',
				consumer_secret: '***',
				access_token_key: accessToken[4],
				access_token_secret: accessToken[5]
			});
			
			client.post('statuses/update', {status: this.attributes['tweetCache']},  function(error, tweet, response) {
			  if(error)  {
				  if(error[0]['code']==187) {
					myCont.emit(':ask', "This tweet is already sent. You can try another.");
				  } else if(error[0]['code']==89) {
					myCont.emit(':tell', "Please link your account to the skill using Alexa App.");
				  }else {
					myCont.emit(':tell', "Hmmm, there is a problem while tweeting; \""+error[0]['message']+"\"");
				  }
				} else {
					myCont.emit(':tell', "I have just tweeted that; "+myCont.attributes['tweetCache']);
				}
			});
			
		}
	},
    'tweetPhoto': function() {
		var myCont = this;
      	var accessToken = this.event.session.user.accessToken;
		if (accessToken === null) {
			this.emit(':tell', "Your twitter account isn't linked. Please link your account with alexa app.");
		} else if(this.attributes['tweetCache'] === null) {
            this.emit(':tell', "Hmmm, nothing to tweet.");
        } else {

			accessToken = accessToken.split(',');
			
            var http = require('http');

            var options = {
                method: 'POST',
                host: global.accessToken[0],
                path: '/Thingworx/Things/'+global.accessToken[2]+'/Services/TakePhoto',
                headers: {
                    "Accept": "application/json",
                    "appkey": global.accessToken[3],
                    "Content-Type": "application/json"
                }
            };
        
            var callbackQ = function(response) {
                var strResult = '';
                
                response.on('data', function (chunk) {
                    strResult += chunk;
                });
                
                response.on('end', function () {
                    if(response.statusCode!=200) {
                        myCont.emit(':tell', "There is an error while connecting to the smart home server. Please try again later.");  
                    } else {
                        
                        var Twitter = require('twitter');
                        var client = new Twitter({
                            consumer_key: '***',
                            consumer_secret: '***',
                            access_token_key: accessToken[4],
                            access_token_secret: accessToken[5]
                        });
                        
                        var strResultParsed = JSON.parse(strResult);
                        client.post('media/upload', { media_data: strResultParsed.rows[0]["result"] }, function (err, data, response) {

                            var status = {
                                status: '#IoT',
                                media_ids: data.media_id_string
                            }

                            client.post('statuses/update', status,  function(error, tweet, response) {
                                if(error)  {
                                    if(error[0]['code']==187) {
                                        myCont.emit(':ask', "This tweet is already sent. You can try another.");
                                    } else if(error[0]['code']==89) {
                                        myCont.emit(':tell', "Please link your account to the skill using Alexa App.");
                                    } else {
                                        myCont.emit(':tell', "Hmmm, there is a problem while tweeting; \""+error[0]['message']+"\"");
                                    }
                                } else { 
                                    myCont.emit(':tell', "I have just tweeted the photo on twitter.");
                                }
                            });
                        });

                    }
                });
            };
            
            http.request(options, callbackQ).end();

			
		}
	},
    "AMAZON.StopIntent": function() {
      this.emit(':tell', "Goodbye!");  
    },
    "AMAZON.CancelIntent": function() {
      this.emit(':tell', "Goodbye!");  
    },'LaunchRequest': function () {
        this.emit(":ask", "Welcome to your home.");
    },'Unhandled': function () {
        this.emit(':ask', "Ask by saying like; \"how is the temperature?\".");
    }

};

function placeUnits(parameterVal, val) {
    return unitsRef[parameterVal].replace("#val#", val);
}