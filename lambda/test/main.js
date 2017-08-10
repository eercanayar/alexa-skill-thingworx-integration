var roleArn = 'arn:aws:iam::***/***';
var region = 'us-east-1';

/* DO NOT MAKE CHANGE BELOW THIS */
var aws = require('aws-sdk');

function context() {
   var context = require('./context.json');
   context.done = function(error, result) {
       console.log('context.done');
       console.log(error);
       console.log(result);
       process.exit();
   }
   context.succeed = function(result) {
       console.log('context.succeed');
       console.log(result);
       process.exit();
   }
   context.fail = function(error) {
       console.log('context.fail');
       console.log(error);
       process.exit();
   }
   return context;
}
aws.config.region = region;
var sts = new aws.STS();
sts.assumeRole({
    RoleArn: roleArn,
    RoleSessionName: 'emulambda'
}, function(err, data) {
    if (err) { // an error occurred
        console.log('Cannot assume role');
        console.log(err, err.stack);
    } else { // successful response
        
        aws.config.update({
            accessKeyId: data.Credentials.AccessKeyId,
            secretAccessKey: data.Credentials.SecretAccessKey,
            sessionToken: data.Credentials.SessionToken
        });
       
        var Module = require('module');
        var originalRequire = Module.prototype.require;

        Module.prototype.require = function(){
          if (arguments[0] === 'aws-sdk'){
            return aws;
          } else {
            return originalRequire.apply(this, arguments);
          }
        };

        var lambda = require('../index.js');
        var event = require('./input.json');
        lambda.handler(event, context());
    }
});
