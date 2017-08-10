# alexa-skill-thingworx-integration
thingworx IoT platform alexa skill integration with get properties, call events and remote events with sample case studies, multiple account linking with twitter and thingworx

This repo contains my last combined work about alexa skills, account linking and integration with IoT ecosystems.

Assume that you have an IoT ecosystem which works on thingworx platform: Couple of sensors like temperature and humidity can be monitored on thingworx thing properties. Some smart home functions like turn on/off lights, start/stop music can be operated by thingworx services. Also there is a security cam connected to same network.

The skill provides a case study to perform this features;

* Linking thingworx and twitter accounts from Alexa App
* Tell sensor measurements like temperature and humidity on Alexa
* Tweet these sensor values to linked twitter account
* Turn on/off lights, start/stop music, enable/disable security from Alexa
* Taking photo from security cam and sharing it on Twitter when asked from Alexa

**Plase visit wiki and learn more about Alexa Skill Development and read detailed section for this sample skill. Do it before start using the repo. [eercanayar/alexa-skills-ask-tutorial/wiki/Alexa-Skills-Kit-(ASK)-Development-Tutorial](https://github.com/eercanayar/alexa-skills-ask-tutorial/wiki/Alexa-Skills-Kit-(ASK)-Development-Tutorial)**

* **lambda:** Amazon Lambda function of the skill. Can be debugged on Visual Studio Code.
* **alexa-skill:** Alexa skill's interaction model. Can be set on Alexa Developer Console. This has a lot of massy code, I know. I've commited this right after I see it works. I'll update it with more re-usable code.
* **account-linking-middleware:** Middleware to set thingworx parameters and link Twitter account on Alexa app. Can run on heroku.
* **remote-service-client:** The role about the camera was taking photo from it and send to Alexa skill to share on Twitter when requested. Notice that camera isn't on internet. It's accessible from a local IP. This remote service makes all possible. It scans IP ranges to find the current IP of the camera. Then, waits for the service call from thingworx. This C# .NET solution is based on Thingworx SDK.

*eercan @Accenture Istanbul*