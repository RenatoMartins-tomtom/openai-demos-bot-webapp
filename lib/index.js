"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const dotenv_1 = require("dotenv");
const ENV_FILE = path.join(__dirname, '..', '.env.local');
dotenv_1.config({ path: ENV_FILE });
const restify = require("restify");
// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const botbuilder_1 = require("botbuilder");
// This bot's main dialog.
const bot_1 = require("./bot");
// Create HTTP server.
const server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log('\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator');
    console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
});
const botFrameworkAuthentication = new botbuilder_1.ConfigurationBotFrameworkAuthentication(process.env);
// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about how bots work.
const adapter = new botbuilder_1.CloudAdapter(botFrameworkAuthentication);
// Catch-all for errors.
const onTurnErrorHandler = (context, error) => __awaiter(void 0, void 0, void 0, function* () {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights.
    console.error(`\n [onTurnError] unhandled error: ${error}`);
    // Send a trace activity, which will be displayed in Bot Framework Emulator
    yield context.sendTraceActivity('OnTurnError Trace', `${error}`, 'https://www.botframework.com/schemas/error', 'TurnError');
    // Send a message to the user
    yield context.sendActivity('The bot encountered an error or bug.');
    yield context.sendActivity('To continue to run this bot, please fix the bot source code.');
});
// Set the onTurnError for the singleton CloudAdapter.
adapter.onTurnError = onTurnErrorHandler;
// Create the main dialog.
const myBot = new bot_1.EchoBot();
// Listen for incoming requests.
server.post('/api/messages', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Route received a request to adapter for processing
    yield adapter.process(req, res, (context) => myBot.run(context));
}));
// Listen for HTTP request on /
server.get('/', (req, res) => {
    // res.send('Hello World!');
    // display basic html page
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`
    
<!DOCTYPE html> 
<html> 
  <head>
    <script
      crossorigin="anonymous"
      src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"
    ></script>
    <style> 
      html,
      body {
          height: 100%;
          background-image: linear-gradient( #C2C0C4,#c2a0a0);
          color: black;
          font-family: 'Segoe UI', Calibri, sans-serif;
      }

      body {
        padding-left: 5px;
      }
      #top-h1 {
        text-align: center;
        display: flex;
        align-items: center;
        vertical-align: middle;  
      }
      #webchat {
        height: 85%;
        width: 100%;
      }
      .webchat__stacked-layout__main{
        white-space: break-spaces;
        
      }
      .webchat__stacked-layout--from-user{
        background-color: rgba(32,33,35, .2);
      }
      
    </style>
  </head>
  <body>
    <div class="top-h1">
    <h1><img src='https://logos-world.net/wp-content/uploads/2020/04/TomTom-Logo.png' height="40"> tomtom internal OpenAI - ChatGPT</h1></div>
    <pre>version 20230321 | model: ChatGPT (turbo) | max_tokens: 1500 | temperature: 0.7 | Speech input enabled: false | Speech language: N/A</pre> 
    <div style="" id="webchat" role="main"></div>
    <script>
      // Set  the CSS rules.
      const styleSet = window.WebChat.createStyleSet({
          bubbleBackground: 'transparent',
          bubbleBorderColor: 'darkslategrey',
          bubbleBorderRadius: 5,
          bubbleBorderStyle: 'solid',
          bubbleBorderWidth: 0,
          bubbleTextColor: 'black',

          userAvatarBackgroundColor: 'rgba(53, 55, 64, .3)',
          bubbleFromUserBackground: 'transparent', 
          bubbleFromUserBorderColor: '#E6E6E6',
          bubbleFromUserBorderRadius: 5,
          bubbleFromUserBorderStyle: 'solid',
          bubbleFromUserBorderWidth: 0,
          bubbleFromUserTextColor: 'black',

          notificationText: 'white',

          bubbleMinWidth: 400,
          bubbleMaxWidth: 720,

          botAvatarBackgroundColor: 'white',
          avatarBorderRadius: 2,
          avatarSize: 40,

          rootHeight: '100%',
          rootWidth: '100%',
          backgroundColor: 'rgba(70, 130, 180, .2)',

          hideUploadButton: 'true'
      });

      // After generated, you can modify the CSS rules.
      // Change font family and weight. 
      styleSet.textContent = {
          ...styleSet.textContent,
          fontWeight: 'regular'
      };

    // Set the avatar options. 
      const avatarOptions = {
          botAvatarInitials: '.',
          userAvatarInitials: 'Me',
          botAvatarImage: 'https://logos-world.net/wp-content/uploads/2020/04/TomTom-Symbol-500x281.png',
          
          };
      window.WebChat.renderWebChat(
        {
          directLine: window.WebChat.createDirectLine({
            token: '` + process.env.DIRECT_LINE_TOKEN + `'
          }),
          styleSet, styleOptions: avatarOptions
        },
        document.getElementById('webchat')
      );
    </script>
      
  </body>
</html>
    `);
    res.end();
});
// Listen for Upgrade requests for Streaming.
server.on('upgrade', (req, socket, head) => __awaiter(void 0, void 0, void 0, function* () {
    // Create an adapter scoped to this WebSocket connection to allow storing session data.
    const streamingAdapter = new botbuilder_1.CloudAdapter(botFrameworkAuthentication);
    // Set onTurnError for the CloudAdapter created for each connection.
    streamingAdapter.onTurnError = onTurnErrorHandler;
    yield streamingAdapter.process(req, socket, head, (context) => myBot.run(context));
}));
//# sourceMappingURL=index.js.map