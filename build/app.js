"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const dotenv_1 = require("dotenv");
const restify = require('restify');
// Read environment variables from .env file
// Import required bot configuration.
const ENV_FILE = path.join(__dirname, "..", ".env");
dotenv_1.config({ path: ENV_FILE });
// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
// This bot's main dialog.
const virtualAssistantUnblockBot_1 = require("./bots/virtualAssistantUnblockBot");
const botframework_connector_1 = require("botframework-connector");
// import i18n from './dialogs/locales/i18nConfig';
// Create HTTP server
const server = restify.createServer();
server.use(restify.plugins.bodyParser());
// server.use(i18n.init);
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log("\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator");
    console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
});
// Expose the manifest
server.get('/manifest/*', restify.plugins.serveStatic({ directory: './manifest', appendRequestPath: false }));
const allowedCallers = (process.env.AllowedCallers || '').split(',').filter((val) => val) || [];
const claimsValidators = botframework_connector_1.allowedCallersClaimsValidator(allowedCallers);
// If the MicrosoftAppTenantId is specified in the environment config, add the tenant as a valid JWT token issuer for Bot to Skill conversation.
// The token issuer for MSI and single tenant scenarios will be the tenant where the bot is registered.
let validTokenIssuers = [];
const { MicrosoftAppTenantId } = process.env;
if (MicrosoftAppTenantId) {
    // For SingleTenant/MSI auth, the JWT tokens will be issued from the bot's home tenant.
    // Therefore, these issuers need to be added to the list of valid token issuers for authenticating activity requests.
    validTokenIssuers = [
        `${botframework_connector_1.AuthenticationConstants.ValidTokenIssuerUrlTemplateV1}${MicrosoftAppTenantId}/`,
        `${botframework_connector_1.AuthenticationConstants.ValidTokenIssuerUrlTemplateV2}${MicrosoftAppTenantId}/v2.0/`,
        `${botframework_connector_1.AuthenticationConstants.ValidGovernmentTokenIssuerUrlTemplateV1}${MicrosoftAppTenantId}/`,
        `${botframework_connector_1.AuthenticationConstants.ValidGovernmentTokenIssuerUrlTemplateV2}${MicrosoftAppTenantId}/v2.0/`
    ];
}
// Define our authentication configuration.
const authConfig = new botframework_connector_1.AuthenticationConfiguration([], claimsValidators, validTokenIssuers);
const credentialsFactory = new botbuilder_1.ConfigurationServiceClientCredentialFactory({
    MicrosoftAppId: process.env.MicrosoftAppId,
    MicrosoftAppPassword: process.env.MicrosoftAppPassword,
    MicrosoftAppType: process.env.MicrosoftAppType,
    MicrosoftAppTenantId: process.env.MicrosoftAppTenantId
});
const botFrameworkAuthentication = botbuilder_1.createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory, authConfig);
// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about how bots work.
// const adapter = new BotFrameworkAdapter({
//   appId: process.env.MicrosoftAppId,
//   appPassword: process.env.MicrosoftAppPassword,
// });
const adapter = new botbuilder_1.CloudAdapter(botFrameworkAuthentication);
// Catch-all for errors.
const onTurnErrorHandler = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights. See https://aka.ms/bottelemetry for telemetry
    //       configuration instructions.
    console.error(`\n [onTurnError] unhandled error: ${error}`);
    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendTraceActivity("OnTurnError Trace", `${error}`, "https://www.botframework.com/schemas/error", "TurnError");
    // Send a message to the user
    await context.sendActivity("The bot encountered an error or bug.");
    await context.sendActivity("To continue to run this bot, please fix the bot source code.");
};
// Set the onTurnError for the singleton BotFrameworkAdapter.
adapter.onTurnError = onTurnErrorHandler;
// Define the state store for your bot.
// See https://aka.ms/about-bot-state to learn more about using MemoryStorage.
// A bot requires a state storage system to persist the dialog and user state between messages.
const memoryStorage = new botbuilder_1.MemoryStorage();
// Create conversation state with in-memory storage provider.
const conversationState = new botbuilder_1.ConversationState(memoryStorage);
// Create the Dialog State for the bot
const dialogs = new botbuilder_dialogs_1.DialogSet(conversationState.createProperty("DialogState"));
// Create the User State for the bot
const userState = new botbuilder_1.UserState(memoryStorage);
// Create the main dialog.
const myVirtualAssistantBot = new virtualAssistantUnblockBot_1.VirtualAssistantUnblockBot(conversationState, userState, dialogs);
// Listen for incoming requests.
server.post('/api/messages', async (req, res) => {
    // Route received a request to adapter for processing
    await adapter.process(req, res, context => myVirtualAssistantBot.run(context));
});
// [OPTIONAL]
// When deploying azure usually pings the web app server to know the status. The request can be ignored or answered, depending
// on the implementation. In my case it was logging the errors so I prefer to just reply to the request.
server.get("/", (req, res, next) => {
    res.send(200);
    next();
});
// Listen for Upgrade requests for Streaming.
server.on("upgrade", (req, socket, head) => {
    // Create an adapter scoped to this WebSocket connection to allow storing session data.
    const streamingAdapter = new botbuilder_1.BotFrameworkAdapter({
        appId: process.env.MicrosoftAppId,
        appPassword: process.env.MicrosoftAppPassword,
    });
    // Set onTurnError for the BotFrameworkAdapter created for each connection.
    streamingAdapter.onTurnError = onTurnErrorHandler;
    streamingAdapter.useWebSocket(req, socket, head, async (context) => {
        // After connecting via WebSocket, run this logic for every request sent over
        // the WebSocket connection.
        await myVirtualAssistantBot.run(context);
    });
});
//# sourceMappingURL=app.js.map