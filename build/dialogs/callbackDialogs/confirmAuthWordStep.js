"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmAuthWordStep = exports.CONFIRM_AUTH_WORD_STEP = void 0;
const botbuilder_ai_1 = require("botbuilder-ai");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const i18nConfig_1 = __importDefault(require("../locales/i18nConfig"));
const TEXT_PROMPT = 'TEXT_PROMPT';
exports.CONFIRM_AUTH_WORD_STEP = 'CONFIRM_AUTH_WORD_STEP';
const CONFIRM_AUTH_WORD_WATERFALL_STEP = 'CONFIRM_AUTH_WORD_WATERFALL_STEP';
const MAX_ERROR_COUNT = 3;
class ConfirmAuthWordStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.CONFIRM_AUTH_WORD_STEP);
        // Add a text prompt to the dialog stack
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(TEXT_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(CONFIRM_AUTH_WORD_WATERFALL_STEP, [
            this.initialStep.bind(this),
            this.finalStep.bind(this)
        ]));
        this.initialDialogId = CONFIRM_AUTH_WORD_WATERFALL_STEP;
    }
    /**
     * Kick off the dialog to display callback details, include the secure word
     *
     */
    async initialStep(stepContext) {
        // Get the user details / state machine
        const callbackBotDetails = stepContext.options;
        // Set the text for the prompt
        const standardMsg = i18nConfig_1.default.__('confirmAuthWordStepStandardMsg');
        const standardMsgContinue = i18nConfig_1.default.__('confirmAuthStepMsg');
        const standardMsgEnd = i18nConfig_1.default.__('confirmAuthWordMsg');
        const retryMsg = i18nConfig_1.default.__('confirmAuthWordStepRetryMsg');
        // Check if the error count is greater than the max threshold
        if (callbackBotDetails.errorCount.confirmAuthWordStep >= MAX_ERROR_COUNT) {
            // Throw the master error flag
            callbackBotDetails.masterError = true;
            // Set master error message to send
            const errorMsg = i18nConfig_1.default.__('masterErrorMsg');
            // Send master error message
            await stepContext.context.sendActivity(errorMsg);
            // End the dialog and pass the updated details state machine
            return await stepContext.endDialog(callbackBotDetails);
        }
        // Check the user state to see if callbackBotDetails.confirmAuthWordStep is set to null or -1
        // If it is in the error state (-1) or or is set to null prompt the user
        // If it is false the user does not want to proceed
        if (callbackBotDetails.confirmAuthWordStep === null ||
            callbackBotDetails.confirmAuthWordStep === -1) {
            const authCode = this.generateAuthCode();
            callbackBotDetails.authCode = authCode;
            const standMsg = standardMsg + ' ' + authCode;
            // Setup the prompt message
            await stepContext.context.sendActivity(standMsg);
            await stepContext.context.sendActivity(standardMsgContinue);
            await stepContext.context.sendActivity(standardMsgEnd);
            const goodbyeMsg = i18nConfig_1.default.__('callbackGoodByeGreetingMsg');
            let promptMsg = '';
            // The current step is an error state
            if (callbackBotDetails.confirmAuthWordStep === -1) {
                promptMsg = retryMsg;
            }
            else {
                promptMsg = goodbyeMsg;
            }
            const promptOptions = i18nConfig_1.default.__('callbackGoodByeGreetingStandardPromptOptions');
            const promptDetails = {
                prompt: botbuilder_dialogs_1.ChoiceFactory.forChannel(stepContext.context, promptOptions, promptMsg)
            };
            return await stepContext.prompt(TEXT_PROMPT, promptDetails);
        }
        else {
            return await stepContext.next(false);
        }
    }
    /**
     *
     *
     */
    async finalStep(stepContext) {
        // Get the user details / state machine
        const callbackBotDetails = stepContext.options;
        // Language check
        let applicationId = '';
        let endpointKey = '';
        let endpoint = '';
        // Then change LUIZ appID
        if (stepContext.context.activity.locale.toLowerCase() === 'fr-ca' ||
            stepContext.context.activity.locale.toLowerCase() === 'fr-fr') {
            applicationId = process.env.LuisCallbackAppIdFR;
            endpointKey = process.env.LuisCallbackAPIKeyFR;
            endpoint = `https://${process.env.LuisCallbackAPIHostNameFR}.api.cognitive.microsoft.com`;
        }
        else {
            applicationId = process.env.LuisCallbackAppIdEN;
            endpointKey = process.env.LuisCallbackAPIKeyEN;
            endpoint = `https://${process.env.LuisCallbackAPIHostNameEN}.api.cognitive.microsoft.com`;
        }
        // LUIZ Recogniser processing
        const recognizer = new botbuilder_ai_1.LuisRecognizer({
            applicationId,
            endpointKey,
            endpoint
        }, {
            includeAllIntents: true,
            includeInstanceData: true
        }, true);
        // Call prompts recognizer
        const recognizerResult = await recognizer.recognize(stepContext.context);
        // Top intent tell us which cognitive service to use.
        const intent = botbuilder_ai_1.LuisRecognizer.topIntent(recognizerResult, 'None', 0.5);
        // Result has come through
        switch (intent) {
            case 'promptConfirmYes':
                const confirmMsg = i18nConfig_1.default.__('callbackGoodByeGreetingMsg');
                callbackBotDetails.confirmAuthWordStep = true;
                await stepContext.context.sendActivity(confirmMsg);
                return await stepContext.endDialog(callbackBotDetails);
            case 'promptConfirmNo':
                const closeMsg = i18nConfig_1.default.__('callbackCloseMsg');
                callbackBotDetails.confirmAuthWordStep = true;
                await stepContext.context.sendActivity(closeMsg);
                return await stepContext.endDialog(callbackBotDetails);
            // No result provided
            case 'None':
                callbackBotDetails.confirmAuthWordStep = -1;
                callbackBotDetails.errorCount.confirmAuthWordStep++;
                return await stepContext.replaceDialog(exports.CONFIRM_AUTH_WORD_STEP, callbackBotDetails);
        }
    }
    generateAuthCode() {
        return Math.floor(1000 + Math.random() * 9000);
    }
}
exports.ConfirmAuthWordStep = ConfirmAuthWordStep;
//# sourceMappingURL=confirmAuthWordStep.js.map