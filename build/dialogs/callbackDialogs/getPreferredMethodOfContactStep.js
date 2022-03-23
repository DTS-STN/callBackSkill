"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPreferredMethodOfContactStep = exports.GET_PREFERRED_METHOD_OF_CONTACT_STEP = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const botbuilder_ai_1 = require("botbuilder-ai");
const i18nConfig_1 = __importDefault(require("../locales/i18nConfig"));
const callbackRecognizer_1 = require("./callbackRecognizer");
const confirmPhoneStep_1 = require("./confirmPhoneStep");
const confirmEmailStep_1 = require("./confirmEmailStep");
const TEXT_PROMPT = 'TEXT_PROMPT';
exports.GET_PREFERRED_METHOD_OF_CONTACT_STEP = 'GET_PREFERRED_METHOD_OF_CONTACT_STEP';
const GET_PREFERRED_METHOD_OF_CONTACT_WATERFALL_STEP = 'GET_PREFERRED_METHOD_OF_CONTACT_WATERFALL_STEP';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const utils_1 = require("../../utils");
const cards_1 = require("../../cards");
const callbackCard_1 = require("../../cards/callbackCard");
class GetPreferredMethodOfContactStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.GET_PREFERRED_METHOD_OF_CONTACT_STEP);
        // Add a text prompt to the dialog stack
        // this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.ChoicePrompt(CHOICE_PROMPT, this.CustomChoiceValidator));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(GET_PREFERRED_METHOD_OF_CONTACT_WATERFALL_STEP, [
            this.initialStep.bind(this),
            this.finalStep.bind(this)
        ]));
        this.initialDialogId = GET_PREFERRED_METHOD_OF_CONTACT_WATERFALL_STEP;
    }
    async CustomChoiceValidator(promptContext) {
        return true;
    }
    /**
     * Initial step in the waterfall. This will kick of this  step
     *
     * If the flag is set in the state machine then we can just
     * end this whole dialog
     *
     * If the  flag is set to null then we need to get a response from the user
     *
     * If the user errors out then we're going to set the flag to false and assume they can't / don't
     * want to proceed
     */
    async initialStep(stepContext) {
        // Get the user details / state machine
        const callbackDetails = stepContext.options;
        // Set the text for the retry prompt
        const retryMsg = i18nConfig_1.default.__('getPreferredMethodOfContactStepRetryMsg');
        // Check if the error count is greater than the max threshold
        if (callbackDetails.errorCount.getPreferredMethodOfContactStep >=
            utils_1.MAX_ERROR_COUNT) {
            // Throw the master error flag
            callbackDetails.masterError = true;
            // End the dialog and pass the updated details state machine
            // Send master error message
            const errorMsg = i18nConfig_1.default.__(`MasterRetryExceededMessage`);
            await cards_1.adaptiveCard(stepContext, callbackCard_1.callbackCard(stepContext.context.activity.locale, errorMsg));
            return await stepContext.endDialog(callbackDetails);
        }
        // Check the user state to see if unblockBotDetails.confirm_look_into_step is set to null or -1
        // If it is in the error state (-1) or or is set to null prompt the user
        // If it is false the user does not want to proceed
        if (callbackDetails.getPreferredMethodOfContactStep === null ||
            callbackDetails.getPreferredMethodOfContactStep === -1) {
            // Setup the prompt message
            let promptMsg = '';
            const queryMsg = i18nConfig_1.default.__('callbackConfirmationQueryMsg');
            // The current step is an error state
            if (callbackDetails.getPreferredMethodOfContactStep === -1) {
                promptMsg = retryMsg;
            }
            else {
                promptMsg = queryMsg;
            }
            // displays prompt options to the user
            // Set the options for the quick reply buttons
            const promptOptions = i18nConfig_1.default.__('getPreferredMethodOfContactStepStandardPromptOptions');
            return await stepContext.prompt(CHOICE_PROMPT, {
                prompt: promptMsg,
                choices: botbuilder_dialogs_1.ChoiceFactory.toChoices(promptOptions),
                style: botbuilder_dialogs_1.ListStyle.suggestedAction
            });
        }
        else {
            return await stepContext.next(false);
        }
    }
    /**
     * Validation step in the waterfall.
     * We use LUIZ to process the prompt reply and then
     * update the state machine (unblockBotDetails)
     */
    async finalStep(stepContext) {
        console.log('test 9000000');
        // Get the user details / state machine
        const callbackBotDetails = stepContext.options;
        let luisRecognizer;
        let lang = 'en';
        // Language check
        // Then change LUIZ appID
        if (stepContext.context.activity.locale.toLowerCase() === 'fr-ca' ||
            stepContext.context.activity.locale.toLowerCase() === 'fr-fr' ||
            stepContext.context.activity.locale.toLowerCase() === 'fr') {
            lang = 'fr';
        }
        // LUIZ Recogniser processing
        luisRecognizer = new callbackRecognizer_1.CallbackRecognizer(lang);
        // Call prompts recognizer
        const recognizerResult = await luisRecognizer.executeLuisQuery(stepContext.context);
        // Setup the possible messages that could go out
        const sendEmailMsg = i18nConfig_1.default.__('confirmEmailStepStandMsg');
        const sendTextMsg = i18nConfig_1.default.__('confirmPhoneStepStandMsg');
        const sendBothMsg = i18nConfig_1.default.__('getPreferredMethodOfContactStepSendBothMsg');
        const NoNotificationMsg = i18nConfig_1.default.__('NoNotificationMsg');
        // Top intent tell us which cognitive service to use.
        const intent = botbuilder_ai_1.LuisRecognizer.topIntent(recognizerResult, 'None', 0.5);
        switch (intent) {
            // Proceed with Email
            case 'promptConfirmSendEmailYes':
            case 'promptConfirmChoiceEmail':
                callbackBotDetails.getPreferredMethodOfContactStep = true;
                callbackBotDetails.preferredEmail = true;
                return await stepContext.replaceDialog(confirmEmailStep_1.CONFIRM_EMAIL_STEP, callbackBotDetails);
            // Proceed with Text Message
            case 'promptConfirmChoiceText':
                console.log('INTENT: ', intent);
                callbackBotDetails.getPreferredMethodOfContactStep = true;
                callbackBotDetails.preferredText = true;
                return await stepContext.replaceDialog(confirmPhoneStep_1.CONFIRM_PHONE_STEP, callbackBotDetails);
            // Proceed with Both Messages
            case 'promptConfirmChoiceBoth':
                console.log('INTENT: ', intent);
                callbackBotDetails.getPreferredMethodOfContactStep = true;
                callbackBotDetails.preferredEmailAndText = true;
                return await stepContext.endDialog(callbackBotDetails);
            case 'promptConfirmChoiceNone':
                // user don't want to receive notification. use this case
                console.log('INTENT: ', intent);
                await stepContext.context.sendActivity(NoNotificationMsg);
                return await stepContext.endDialog(callbackBotDetails);
            // Could not understand / None intent
            default: {
                // Catch all
                console.log('NONE INTENT');
                callbackBotDetails.getPreferredMethodOfContactStep = -1;
                callbackBotDetails.errorCount.getPreferredMethodOfContactStep++;
                return await stepContext.replaceDialog(exports.GET_PREFERRED_METHOD_OF_CONTACT_STEP, callbackBotDetails);
            }
        }
    }
}
exports.GetPreferredMethodOfContactStep = GetPreferredMethodOfContactStep;
//# sourceMappingURL=getPreferredMethodOfContactStep.js.map