"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserEmailStep = exports.GET_USER_EMAIL_STEP = void 0;
const botbuilder_ai_1 = require("botbuilder-ai");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const callbackRecognizer_1 = require("./callbackRecognizer");
const getPreferredMethodOfContactStep_1 = require("./getPreferredMethodOfContactStep");
const i18nConfig_1 = __importDefault(require("../locales/i18nConfig"));
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const TEXT_PROMPT = 'TEXT_PROMPT';
exports.GET_USER_EMAIL_STEP = 'GET_USER_EMAIL_STEP';
const GET_USER_EMAIL_WATERFALL_STEP = 'GET_USER_EMAIL_WATERFALL_STEP';
const utils_1 = require("../../utils");
const commonPromptValidatorModel_1 = require("../../models/commonPromptValidatorModel");
const alwaysOnBotDialog_1 = require("../alwaysOnDialogs/alwaysOnBotDialog");
class GetUserEmailStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.GET_USER_EMAIL_STEP);
        // Add a text prompt to the dialog stack
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(TEXT_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.ChoicePrompt(CHOICE_PROMPT));
        // this.addDialog(new AlwaysOnBotDialog());
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(GET_USER_EMAIL_WATERFALL_STEP, [
            this.initialStep.bind(this),
            this.finalStep.bind(this)
        ]));
        this.initialDialogId = GET_USER_EMAIL_WATERFALL_STEP;
    }
    /**
     * Kick off the dialog by asking for an email address
     *
     */
    async initialStep(stepContext) {
        // Get the user details / state machine
        const callbackBotDetails = stepContext.options;
        // Set the text for the prompt
        const standardMsg = i18nConfig_1.default.__('getUserEmailStepStandardMsg');
        // Set the text for the retry prompt
        const retryMsg = i18nConfig_1.default.__('getUserEmailFormatErrorMsg');
        // Check if the error count is greater than the max threshold
        if (callbackBotDetails.errorCount.getUserEmailStep >= utils_1.MAX_ERROR_COUNT) {
            // Throw the master error flag
            const errorMsg = i18nConfig_1.default.__('emailFormatMaxErrorMsg');
            const promptOptions = i18nConfig_1.default.__('confirmEmailStepErrorPromptOptions');
            const promptDetails = {
                prompt: botbuilder_dialogs_1.ChoiceFactory.forChannel(stepContext.context, promptOptions, errorMsg)
            };
            return await stepContext.prompt(CHOICE_PROMPT, {
                prompt: errorMsg,
                choices: botbuilder_dialogs_1.ChoiceFactory.toChoices(promptOptions),
                style: botbuilder_dialogs_1.ListStyle.suggestedAction
            });
        }
        // Check the user state to see if unblockBotDetails.getAndSendEmailStep is set to null or -1
        // If it is in the error state (-1) or or is set to null prompt the user
        // If it is false the user does not want to proceed
        else if ((callbackBotDetails.getUserEmailStep === null ||
            callbackBotDetails.getUserEmailStep === -1) &&
            typeof callbackBotDetails.confirmEmailStep === 'boolean' &&
            callbackBotDetails.confirmEmailStep === false) {
            // Setup the prompt message
            let promptMsg = '';
            // The current step is an error state
            if (callbackBotDetails.getUserEmailStep === -1) {
                promptMsg = retryMsg;
            }
            else {
                promptMsg = standardMsg;
            }
            return await stepContext.prompt(TEXT_PROMPT, promptMsg);
        }
        return await stepContext.next(false);
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
        // Top intent tell us which cognitive service to use.
        const intent = botbuilder_ai_1.LuisRecognizer.topIntent(recognizerResult, 'None', 0.5);
        switch (intent) {
            // Proceed
            case 'promptConfirmSendEmailYes':
            case 'promptConfirmNotifyYes':
            case 'promptConfirmYes':
            case 'promptTryAgainYes':
                console.log('INTENT: ', intent);
                callbackBotDetails.getPreferredMethodOfContactStep = null;
                callbackBotDetails.confirmEmailStep = null;
                callbackBotDetails.preferredEmailAndText = null;
                callbackBotDetails.preferredEmail = null;
                callbackBotDetails.getUserEmailStep = null;
                callbackBotDetails.errorCount.getUserEmailStep = 0;
                return await stepContext.replaceDialog(getPreferredMethodOfContactStep_1.GET_PREFERRED_METHOD_OF_CONTACT_STEP, callbackBotDetails);
            // Don't Proceed
            case 'promptConfirmEmailNo':
            case 'promptConfirmNo':
            case 'NoNotForNow':
                const commonPromptValidatorModel = new commonPromptValidatorModel_1.CommonPromptValidatorModel();
                // call dialog
                return await stepContext.beginDialog(alwaysOnBotDialog_1.ALWAYS_ON_BOT_DIALOG, commonPromptValidatorModel);
            // Could not understand / None intent
            default: {
                // Catch all
                console.log('NONE INTENT');
                // Result has come through
                const results = stepContext.result;
                if (results) {
                    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    // Email validation
                    if (re.test(String(results).toLowerCase())) {
                        callbackBotDetails.confirmEmailStep = true;
                        callbackBotDetails.getUserEmailStep = true;
                        const confirmMsg = i18nConfig_1.default.__('getUserEmailStepConfirmMsg');
                        await stepContext.context.sendActivity(confirmMsg);
                        return await stepContext.endDialog(callbackBotDetails);
                    }
                    else {
                        callbackBotDetails.getUserEmailStep = -1;
                        callbackBotDetails.errorCount.getUserEmailStep++;
                    }
                }
                return await stepContext.replaceDialog(exports.GET_USER_EMAIL_STEP, callbackBotDetails);
            }
        }
    }
}
exports.GetUserEmailStep = GetUserEmailStep;
//# sourceMappingURL=getUserEmailStep.js.map