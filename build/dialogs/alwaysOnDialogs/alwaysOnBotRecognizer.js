"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LUISAlwaysOnBotSetup = void 0;
const botbuilder_ai_1 = require("botbuilder-ai");
exports.LUISAlwaysOnBotSetup = (stepContext) => {
    // Luis Application Settings
    let applicationId;
    let endpointKey;
    let endpoint;
    let recognizer;
    let locale = 'en';
    if (stepContext.context.activity.locale) {
        locale = stepContext.context.activity.locale.toLowerCase();
    }
    // Then change LUIZ appID
    if (locale.toLowerCase() === 'fr-ca' ||
        locale.toLowerCase() === 'fr-fr' ||
        locale.toLowerCase() === 'fr') {
        applicationId = process.env.LuisAppIdFR;
        endpointKey = process.env.LuisAPIKeyFR;
        endpoint = `https://${process.env.LuisAPIHostNameFR}.cognitiveservices.azure.com`;
    }
    else {
        applicationId = process.env.LuisAppIdEN;
        endpointKey = process.env.LuisAPIKeyEN;
        endpoint = `https://${process.env.LuisAPIHostNameEN}.cognitiveservices.azure.com`;
    }
    // LUIZ Recogniser processing
    recognizer = new botbuilder_ai_1.LuisRecognizer({
        'applicationId': `${applicationId}`,
        'endpointKey': `${endpointKey}`,
        'endpoint': `${endpoint}`
    }, {
        includeAllIntents: true,
        includeInstanceData: true
    }, true);
    return recognizer;
};
//# sourceMappingURL=alwaysOnBotRecognizer.js.map