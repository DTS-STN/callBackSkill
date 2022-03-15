"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LUISUnblockSetup = void 0;
const botbuilder_ai_1 = require("botbuilder-ai");
exports.LUISUnblockSetup = (stepContext) => {
    // Luis Application Settings
    let applicationId;
    let endpointKey;
    let endpoint;
    let recognizer;
    // Then change LUIZ appID
    if (stepContext.context.activity.locale.toLowerCase() === 'fr-ca' ||
        stepContext.context.activity.locale.toLowerCase() === 'fr-fr' ||
        stepContext.context.activity.locale.toLowerCase() === 'fr') {
        applicationId = process.env.LuisAppIdFR;
        endpointKey = process.env.LuisAPIKeyFR;
        endpoint = `https://${process.env.LuisAPIHostNameFR}.api.cognitive.microsoft.com`;
    }
    else {
        applicationId = process.env.LuisAppIdEN;
        endpointKey = process.env.LuisAPIKeyEN;
        endpoint = `https://${process.env.LuisAPIHostNameEN}.api.cognitive.microsoft.com`;
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
//# sourceMappingURL=luisAppSetup.js.map