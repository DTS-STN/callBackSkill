"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmEmailStep = exports.CONFIRM_EMAIL_STEP = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const botbuilder_ai_1 = require("botbuilder-ai");
const i18nConfig_1 = __importDefault(require("../locales/i18nConfig"));
const getUserEmailStep_1 = require("./getUserEmailStep");
const callbackRecognizer_1 = require("./callbackRecognizer");
const TEXT_PROMPT = 'TEXT_PROMPT';
exports.CONFIRM_EMAIL_STEP = 'CONFIRM_EMAIL_STEP';
const CONFIRM_EMAIL_WATERFALL_STEP = 'CONFIRM_EMAIL_WATERFALL_STEP';
const MAX_ERROR_COUNT = 3;
class ConfirmEmailStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.CONFIRM_EMAIL_STEP);
        // Add a text prompt to the dialog stack
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(TEXT_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(CONFIRM_EMAIL_WATERFALL_STEP, [
            this.initialStep.bind(this),
            this.finalStep.bind(this)
        ]));
        this.initialDialogId = CONFIRM_EMAIL_WATERFALL_STEP;
    }
    /**
     * Kick off the dialog by asking for an email address
     *
     */
    async initialStep(stepContext) {
        // Get the user details / state machine
        const callbackBotDetails = stepContext.options;
        // Set the text for the prompt
        const standardMsg = i18nConfig_1.default.__('confirmEmailStepStandMsg');
        // Set the text for the retry prompt
        const retryMsg = i18nConfig_1.default.__('confirmEmailStepRetryMsg');
        // Check if the error count is greater than the max threshold
        if (callbackBotDetails.errorCount.confirmEmailStep >= MAX_ERROR_COUNT) {
            // Throw the master error flag
            callbackBotDetails.masterError = true;
            // Set master error message to send
            const errorMsg = i18nConfig_1.default.__('masterErrorMsg');
            // Send master error message
            await stepContext.context.sendActivity(errorMsg);
            // End the dialog and pass the updated details state machine
            return await stepContext.endDialog(callbackBotDetails);
        }
        // Check the user state to see if unblockBotDetails.confirmEmailStep is set to null or -1
        // If it is in the error state (-1) or or is set to null prompt the user
        // If it is false the user does not want to proceed
        if (callbackBotDetails.confirmEmailStep === null ||
            callbackBotDetails.confirmEmailStep === -1) {
            // Setup the prompt message
            let promptMsg = '';
            // The current step is an error state
            if (callbackBotDetails.confirmEmailStep === -1) {
                promptMsg = retryMsg;
            }
            else {
                promptMsg = standardMsg;
            }
            const promptOptions = i18nConfig_1.default.__('confirmEmailStepStandardPromptOptions');
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
        // Then change LUIZ appID
        if (stepContext.context.activity.locale.toLowerCase() === 'fr-ca' ||
            stepContext.context.activity.locale.toLowerCase() === 'fr-fr') {
            lang = 'fr';
        }
        // LUIZ Recogniser processing
        luisRecognizer = new callbackRecognizer_1.CallbackRecognizer(lang);
        // Call prompts recognizer
        const recognizerResult = await luisRecognizer.executeLuisQuery(stepContext.context);
        // Top intent tell us which cognitive service to use.
        const intent = botbuilder_ai_1.LuisRecognizer.topIntent(recognizerResult, 'None', 0.5);
        switch (intent) {
            // Proceed
            // Not - adding these extra intent checks because of a bug with the french happy path
            case 'promptConfirmSendEmailYes':
            case 'promptConfirmNotifyYes':
            case 'promptConfirmYes':
                console.log('INTENT: ', intent);
                callbackBotDetails.confirmEmailStep = true;
                if (callbackBotDetails.preferredEmailAndText !== true) {
                    const confirmMsg = i18nConfig_1.default.__('getUserEmailStepConfirmMsg');
                    await stepContext.context.sendActivity(confirmMsg);
                }
                return await stepContext.endDialog(callbackBotDetails);
            // Don't Proceed
            case 'promptConfirmEmailNo':
            case 'promptConfirmNo':
                console.log('INTENT: ', intent);
                // if email is incorrect, go to setup a new email dialog
                callbackBotDetails.confirmEmailStep = false;
                return await stepContext.replaceDialog(getUserEmailStep_1.GET_USER_EMAIL_STEP, callbackBotDetails);
            //  return await stepContext.endDialog(callbackBotDetails);
            // Could not understand / None intent
            default: {
                // Catch all
                console.log('NONE INTENT');
                callbackBotDetails.confirmEmailStep = -1;
                callbackBotDetails.errorCount.confirmEmailStep++;
                return await stepContext.replaceDialog(exports.CONFIRM_EMAIL_STEP, callbackBotDetails);
            }
        }
    }
}
exports.ConfirmEmailStep = ConfirmEmailStep;
//# sourceMappingURL=confirmEmailStep.js.map