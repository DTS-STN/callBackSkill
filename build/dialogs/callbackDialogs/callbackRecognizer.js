"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallbackRecognizer = void 0;
const botbuilder_ai_1 = require("botbuilder-ai");
class CallbackRecognizer {
    constructor(lang) {
        // Then change LUIZ appID
        if (lang === 'fr') {
            this.applicationId = process.env.LuisAppIdFR;
            this.endpointKey = process.env.LuisAPIKeyFR;
            this.endpoint = `https://${process.env.LuisAPIHostNameFR}.cognitiveservices.azure.com`;
        }
        else {
            this.applicationId = process.env.LuisAppIdEN;
            this.endpointKey = process.env.LuisAPIKeyEN;
            this.endpoint = `https://${process.env.LuisAPIHostNameEN}.cognitiveservices.azure.com`;
        }
        const luisConfig = {
            applicationId: this.applicationId,
            endpointKey: this.endpointKey,
            endpoint: this.endpoint
        };
        const luisIsConfigured = luisConfig &&
            luisConfig.applicationId &&
            luisConfig.endpoint &&
            luisConfig.endpointKey;
        if (luisIsConfigured) {
            // Set the recognizer options depending on which endpoint version you want to use e.g LuisRecognizerOptionsV2 or LuisRecognizerOptionsV3.
            // More details can be found in https://docs.microsoft.com/en-gb/azure/cognitive-services/luis/luis-migration-api-v3
            const recognizerOptions = {
                apiVersion: 'v3',
                includeAllIntents: true,
                includeInstanceData: true
            };
            this.recognizer = new botbuilder_ai_1.LuisRecognizer(luisConfig, recognizerOptions, true);
        }
    }
    get isConfigured() {
        return this.recognizer !== undefined;
    }
    /**
     * Returns an object with preformatted LUIS results for the bot's dialogs to consume.
     * @param {TurnContext} context
     */
    async executeLuisQuery(context) {
        return this.recognizer.recognize(context);
    }
}
exports.CallbackRecognizer = CallbackRecognizer;
//# sourceMappingURL=callbackRecognizer.js.map