"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmPhoneStep = exports.CONFIRM_PHONE_STEP = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const botbuilder_ai_1 = require("botbuilder-ai");
const i18nConfig_1 = __importDefault(require("../locales/i18nConfig"));
const getUserPhoneNumberStep_1 = require("./getUserPhoneNumberStep");
const callbackRecognizer_1 = require("./callbackRecognizer");
const TEXT_PROMPT = 'TEXT_PROMPT';
exports.CONFIRM_PHONE_STEP = 'CONFIRM_PHONE_STEP';
const CONFIRM_PHONE_WATERFALL_STEP = 'CONFIRM_PHONE_WATERFALL_STEP';
const utils_1 = require("../../utils");
const cards_1 = require("../../cards");
const callbackCard_1 = require("../../cards/callbackCard");
class ConfirmPhoneStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.CONFIRM_PHONE_STEP);
        // Add a text prompt to the dialog stack
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(TEXT_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(CONFIRM_PHONE_WATERFALL_STEP, [
            this.initialStep.bind(this),
            this.finalStep.bind(this)
        ]));
        this.initialDialogId = CONFIRM_PHONE_WATERFALL_STEP;
    }
    /**
     * Kick off the dialog by asking confirm the existing email address correct
     *
     */
    async initialStep(stepContext) {
        // Get the user details / state machine
        const callbackBotDetails = stepContext.options;
        // Set the text for the prompt
        const standardMsg = i18nConfig_1.default.__('confirmPhoneStepStandMsg');
        // Set the text for the retry prompt
        const retryMsg = i18nConfig_1.default.__('confirmPhoneStepRetryMsg');
        // Check if the error count is greater than the max threshold
        if (callbackBotDetails.errorCount.confirmPhoneStep >= utils_1.MAX_ERROR_COUNT) {
            // Throw the master error flag
            callbackBotDetails.masterError = true;
            // Set master error message to send
            const errorMsg = i18nConfig_1.default.__(`MasterRetryExceededMessage`);
            await cards_1.adaptiveCard(stepContext, callbackCard_1.callbackCard(stepContext.context.activity.locale, errorMsg));
            // End the dialog and pass the updated details state machine
            return await stepContext.endDialog(callbackBotDetails);
        }
        // Check the user state to see if unblockBotDetails.confirmPhoneStep is set to null or -1
        // If it is in the error state (-1) or or is set to null prompt the user
        // If it is false the user does not want to proceed
        if (callbackBotDetails.confirmPhoneStep === null ||
            callbackBotDetails.confirmPhoneStep === -1) {
            // Setup the prompt message
            let promptMsg = '';
            // The current step is an error state
            if (callbackBotDetails.confirmPhoneStep === -1) {
                promptMsg = retryMsg;
            }
            else {
                promptMsg = standardMsg;
            }
            const promptOptions = i18nConfig_1.default.__('confirmPhoneStepStandardPromptOptions');
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
        let luisRecognizer;
        let lang = 'en';
        // Language check
        // Then change LUIZ appID when initial
        if (stepContext.context.activity.locale.toLowerCase() === 'fr-ca' ||
            stepContext.context.activity.locale.toLowerCase() === 'fr-fr' ||
            stepContext.context.activity.locale.toLowerCase() === 'fr') {
            lang = 'fr';
        }
        // LUIZ Recogniser processing
        luisRecognizer = new callbackRecognizer_1.CallbackRecognizer(lang);
        // Call prompts recognizer
        const recognizerResult = await luisRecognizer.executeLuisQuery(stepContext.context);
        // Top intent tell us which cognitive service to use.
        const intent = botbuilder_ai_1.LuisRecognizer.topIntent(recognizerResult, 'None', 0.5);
        const closeMsg = i18nConfig_1.default.__('getUserBothContactsConfirmMsg');
        switch (intent) {
            // Proceed
            // Not - adding these extra intent checks because of a bug with the french happy path
            case 'promptConfirmPhoneYes':
            case 'promptConfirmYes':
                console.log('INTENT: ', intent);
                callbackBotDetails.confirmPhoneStep = true;
                const confirmMsg = i18nConfig_1.default.__('getUserPhoneConfirmMsg');
                if (callbackBotDetails.preferredEmailAndText === true) {
                    await stepContext.context.sendActivity(closeMsg);
                }
                else {
                    await stepContext.context.sendActivity(confirmMsg);
                }
                return await stepContext.endDialog(callbackBotDetails);
            // Don't Proceed
            case 'promptConfirmPhoneNo':
            case 'promptConfirmNo':
                console.log('INTENT: ', intent);
                callbackBotDetails.confirmPhoneStep = false;
                // await stepContext.context.sendActivity(closeMsg);
                // return await stepContext.endDialog(callbackBotDetails);
                return await stepContext.replaceDialog(getUserPhoneNumberStep_1.GET_USER_PHONE_NUMBER_STEP, callbackBotDetails);
            // Could not understand / None intent
            default: {
                // Catch all
                console.log('NONE INTENT');
                callbackBotDetails.confirmPhoneStep = -1;
                callbackBotDetails.errorCount.confirmPhoneStep++;
                return await stepContext.replaceDialog(exports.CONFIRM_PHONE_STEP, callbackBotDetails);
            }
        }
    }
}
exports.ConfirmPhoneStep = ConfirmPhoneStep;
//# sourceMappingURL=confirmPhoneStep.js.map