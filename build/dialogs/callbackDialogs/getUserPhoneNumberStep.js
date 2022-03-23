"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserPhoneNumberStep = exports.GET_USER_PHONE_NUMBER_STEP = void 0;
const botbuilder_ai_1 = require("botbuilder-ai");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const callbackRecognizer_1 = require("./callbackRecognizer");
const getPreferredMethodOfContactStep_1 = require("./getPreferredMethodOfContactStep");
const validateCanadianPhoneNumber_1 = __importDefault(require("../../utils/validateCanadianPhoneNumber"));
const i18nConfig_1 = __importDefault(require("../locales/i18nConfig"));
const TEXT_PROMPT = 'TEXT_PROMPT';
exports.GET_USER_PHONE_NUMBER_STEP = 'GET_USER_PHONE_NUMBER_STEP';
const GET_USER_PHONE_NUMBER_WATERFALL_STEP = 'GET_USER_PHONE_NUMBER_WATERFALL_STEP';
const utils_1 = require("../../utils");
const cards_1 = require("../../cards");
const callbackCard_1 = require("../../cards/callbackCard");
const commonPromptValidatorModel_1 = require("../../models/commonPromptValidatorModel");
const alwaysOnBotDialog_1 = require("../alwaysOnDialogs/alwaysOnBotDialog");
const CHOICE_PROMPT = 'CHOICE_PROMPT';
class GetUserPhoneNumberStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.GET_USER_PHONE_NUMBER_STEP);
        // Add a text prompt to the dialog stack
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(TEXT_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(GET_USER_PHONE_NUMBER_WATERFALL_STEP, [
            this.initialStep.bind(this),
            this.finalStep.bind(this)
        ]));
        this.initialDialogId = GET_USER_PHONE_NUMBER_WATERFALL_STEP;
    }
    /**
     * Kick off the dialog by asking for a new phone number
     *
     */
    async initialStep(stepContext) {
        // Get the user details / state machine
        const callbackBotDetails = stepContext.options;
        // Set the text for the prompt
        let standardMsg;
        if (callbackBotDetails.confirmCallbackPhoneNumberStep === false) {
            standardMsg = i18nConfig_1.default.__('getCallbackPhoneNumberStandardMsg');
        }
        else
            standardMsg = i18nConfig_1.default.__('getUserPhoneStepStandardMsg');
        // Set the text for the retry prompt
        const retryMsg = i18nConfig_1.default.__('getUserPhoneNumberFormatErrorMsg');
        // Check if the error count is greater than the max threshold
        if (callbackBotDetails.errorCount.getUserPhoneNumberStep >= utils_1.MAX_ERROR_COUNT) {
            if (callbackBotDetails.confirmCallbackPhoneNumberStep === false) {
                //   Throw the master error flag
                callbackBotDetails.masterError = true;
                //  Send master error message
                // Set master error message to send
                const errorMsg = i18nConfig_1.default.__(`MasterRetryExceededMessage`);
                await cards_1.adaptiveCard(stepContext, callbackCard_1.callbackCard(stepContext.context.activity.locale, errorMsg));
                // End the dialog and pass the updated details state machine
                return await stepContext.endDialog(callbackBotDetails);
            }
            else {
                const errorMsg = i18nConfig_1.default.__('phoneNumberFormatMaxErrorMsg');
                const promptOptions = i18nConfig_1.default.__('confirmEmailStepErrorPromptOptions');
                return await stepContext.prompt(CHOICE_PROMPT, {
                    prompt: errorMsg,
                    choices: botbuilder_dialogs_1.ChoiceFactory.toChoices(promptOptions),
                    style: botbuilder_dialogs_1.ListStyle.suggestedAction
                });
            }
        }
        // Check the user state to see if callbackBotDetails.getUserPhoneNumberStep is set to null or -1
        // If it is in the error state (-1) or or is set to null prompt the user
        // If it is false the user does not want to proceed
        if ((callbackBotDetails.getUserPhoneNumberStep === null ||
            callbackBotDetails.getUserPhoneNumberStep === -1) &&
            ((typeof callbackBotDetails.confirmPhoneStep === 'boolean' &&
                callbackBotDetails.confirmPhoneStep === false) ||
                (typeof callbackBotDetails.confirmCallbackPhoneNumberStep ===
                    'boolean' &&
                    callbackBotDetails.confirmCallbackPhoneNumberStep === false))) {
            // Setup the prompt message
            let promptMsg = '';
            // The current step is an error state
            if (callbackBotDetails.getUserPhoneNumberStep === -1) {
                promptMsg = retryMsg;
            }
            else {
                promptMsg = standardMsg;
            }
            return await stepContext.prompt(TEXT_PROMPT, promptMsg);
        }
        else {
            return await stepContext.next(false);
        }
    }
    async finalStep(stepContext) {
        // Get the user details / state machine
        const callbackBotDetails = stepContext.options;
        let luisRecognizer;
        let lang = 'en';
        // Then change LUIZ appID
        if (stepContext.context.activity.locale.toLowerCase() === 'fr-ca' ||
            stepContext.context.activity.locale.toLowerCase() === 'fr-fr') {
            lang = 'fr';
        }
        // LUIZ Recogniser processing
        luisRecognizer = new callbackRecognizer_1.CallbackRecognizer(lang);
        // Call prompts recognizer
        const reRefactorRes = await luisRecognizer.executeLuisQuery(stepContext.context);
        // Top intent tell us which cognitive service to use.
        const intent = botbuilder_ai_1.LuisRecognizer.topIntent(reRefactorRes, 'None', 0.5);
        switch (intent) {
            // Proceed
            case 'promptConfirmChoiceText':
            case 'promptConfirmYes':
            case 'promptTryAgainYes':
                callbackBotDetails.getPreferredMethodOfContactStep = null;
                callbackBotDetails.confirmPhoneStep = null;
                callbackBotDetails.getUserPhoneNumberStep = null;
                callbackBotDetails.preferredEmailAndText = null;
                callbackBotDetails.preferredText = null;
                callbackBotDetails.errorCount.getUserPhoneNumberStep = 0;
                return await stepContext.replaceDialog(getPreferredMethodOfContactStep_1.GET_PREFERRED_METHOD_OF_CONTACT_STEP, callbackBotDetails);
            case 'promptConfirmNo':
            case 'NoNotForNow':
                const commonPromptValidatorModel = new commonPromptValidatorModel_1.CommonPromptValidatorModel();
                // call dialog
                return await stepContext.replaceDialog(alwaysOnBotDialog_1.ALWAYS_ON_BOT_DIALOG, commonPromptValidatorModel);
            // Could not understand / None intent
            default: {
                // Catch all
                const results = stepContext.result;
                if (results) {
                    // phone number validation
                    const validPhoneNumber = validateCanadianPhoneNumber_1.default(results);
                    if (validPhoneNumber) {
                        const confirmMsg = i18nConfig_1.default.__('getUserPhoneConfirmMsg');
                        callbackBotDetails.confirmPhoneStep = true;
                        callbackBotDetails.getUserPhoneNumberStep = true;
                        if (callbackBotDetails.confirmCallbackPhoneNumberStep === true) {
                            await stepContext.context.sendActivity(confirmMsg);
                        }
                        if (callbackBotDetails.confirmCallbackPhoneNumberStep === false) {
                            callbackBotDetails.confirmCallbackPhoneNumberStep = true;
                            const firstWelcomeMsg = i18nConfig_1.default.__('getCallbackScheduleStandardMsg');
                            const standardMsgContinue = i18nConfig_1.default.__('confirmAuthStepMsg');
                            const confirmationCodeMsg = i18nConfig_1.default.__('confirmAuthWordStepStandardMsg');
                            await stepContext.context.sendActivity(firstWelcomeMsg);
                            await stepContext.context.sendActivity(standardMsgContinue);
                            await stepContext.context.sendActivity(confirmationCodeMsg);
                        }
                        return await stepContext.endDialog(callbackBotDetails);
                    }
                    else {
                        callbackBotDetails.getUserPhoneNumberStep = -1;
                        callbackBotDetails.errorCount.getUserPhoneNumberStep++;
                    }
                }
                return await stepContext.replaceDialog(exports.GET_USER_PHONE_NUMBER_STEP, callbackBotDetails);
            }
        }
    }
}
exports.GetUserPhoneNumberStep = GetUserPhoneNumberStep;
//# sourceMappingURL=getUserPhoneNumberStep.js.map