"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmCallbackPhoneNumberStep = exports.CONFIRM_CALLBACK_PHONE_NUMBER_STEP = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const botbuilder_ai_1 = require("botbuilder-ai");
const i18nConfig_1 = __importDefault(require("../locales/i18nConfig"));
const getUserPhoneNumberStep_1 = require("./getUserPhoneNumberStep");
const callbackRecognizer_1 = require("./callbackRecognizer");
const TEXT_PROMPT = 'TEXT_PROMPT';
exports.CONFIRM_CALLBACK_PHONE_NUMBER_STEP = 'CONFIRM_CALLBACK_PHONE_NUMBER_STEP';
const CONFIRM_CALLBACK_PHONE_NUMBER_WATERFALL_STEP = 'CONFIRM_CALLBACK_PHONE_NUMBER_WATERFALL_STEP';
const utils_1 = require("../../utils");
const cards_1 = require("../../cards");
const callbackCard_1 = require("../../cards/callbackCard");
class ConfirmCallbackPhoneNumberStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.CONFIRM_CALLBACK_PHONE_NUMBER_STEP);
        // Add a text prompt to the dialog stack
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(TEXT_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(CONFIRM_CALLBACK_PHONE_NUMBER_WATERFALL_STEP, [
            this.initialStep.bind(this),
            this.finalStep.bind(this)
        ]));
        this.initialDialogId = CONFIRM_CALLBACK_PHONE_NUMBER_WATERFALL_STEP;
    }
    /**
     * Kick off the dialog by asking confirm the existing phone still can reach the client
     *
     */
    async initialStep(stepContext) {
        // Get the user details / state machine
        const callbackBotDetails = stepContext.options;
        // Set the text for the prompt
        const standardMsg = i18nConfig_1.default.__('confirmCallbackPhoneNumberStepStandardMsg');
        // Set the text for the retry prompt
        const retryMsg = i18nConfig_1.default.__('confirmCallbackPhoneNumberStepRetryMsg');
        // Check if the error count is greater than the max threshold
        if (callbackBotDetails.errorCount.confirmCallbackPhoneNumberStep >=
            utils_1.MAX_ERROR_COUNT) {
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
        if (callbackBotDetails.confirmCallbackPhoneNumberStep === null ||
            callbackBotDetails.confirmCallbackPhoneNumberStep === -1) {
            // Setup the prompt message
            let promptMsg = '';
            const promptOptions = i18nConfig_1.default.__('confirmCallbackPhoneNumberStepStandardPromptOptions');
            // The current step is an error state
            if (callbackBotDetails.confirmCallbackPhoneNumberStep === -1) {
                promptMsg = retryMsg;
            }
            else {
                promptMsg = standardMsg;
            }
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
        switch (intent) {
            // Proceed
            // Not - adding these extra intent checks because of a bug with the french happy path
            case 'promptConfirmYes':
            case 'promptConfirmPhoneYes':
                callbackBotDetails.confirmCallbackPhoneNumberStep = true;
                //  const confirmMsg = i18n.__('getUserPhoneConfirmMsg');
                // await stepContext.context.sendActivity(confirmMsg);
                const firstWelcomeMsg = i18nConfig_1.default.__('getCallbackScheduleStandardMsg');
                const standardMsgContinue = i18nConfig_1.default.__('confirmAuthStepMsg');
                const confirmationCodeMsg = i18nConfig_1.default.__('confirmAuthWordStepStandardMsg');
                await stepContext.context.sendActivity(firstWelcomeMsg);
                await stepContext.context.sendActivity(standardMsgContinue);
                await stepContext.context.sendActivity(confirmationCodeMsg);
                return await stepContext.endDialog(callbackBotDetails);
            // Don't Proceed
            case 'promptConfirmNo':
                callbackBotDetails.confirmCallbackPhoneNumberStep = false;
                return await stepContext.replaceDialog(getUserPhoneNumberStep_1.GET_USER_PHONE_NUMBER_STEP, callbackBotDetails);
            // Could not understand / None intent
            default: {
                // Catch all
                callbackBotDetails.confirmCallbackPhoneNumberStep = -1;
                callbackBotDetails.errorCount.confirmCallbackPhoneNumberStep++;
                return await stepContext.replaceDialog(exports.CONFIRM_CALLBACK_PHONE_NUMBER_STEP, callbackBotDetails);
            }
        }
    }
}
exports.ConfirmCallbackPhoneNumberStep = ConfirmCallbackPhoneNumberStep;
//# sourceMappingURL=confirmCallbackPhoneNumberStep.js.map