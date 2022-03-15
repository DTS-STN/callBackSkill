"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmCallbackStep = exports.CONFIRM_CALLBACK_STEP = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const botbuilder_ai_1 = require("botbuilder-ai");
const i18nConfig_1 = __importDefault(require("../locales/i18nConfig"));
const callbackRecognizer_1 = require("./callbackRecognizer");
const TEXT_PROMPT = 'TEXT_PROMPT';
exports.CONFIRM_CALLBACK_STEP = 'CONFIRM_CALLBACK_STEP';
const CONFIRM_CALLBACK_WATERFALL_STEP = 'CONFIRM_CALLBACK_WATERFALL_STEP';
const MAX_ERROR_COUNT = 3;
class ConfirmCallbackStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.CONFIRM_CALLBACK_STEP);
        // Add a text prompt to the dialog stack
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(TEXT_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(CONFIRM_CALLBACK_WATERFALL_STEP, [
            this.initialStep.bind(this),
            this.finalStep.bind(this)
        ]));
        this.initialDialogId = CONFIRM_CALLBACK_WATERFALL_STEP;
    }
    /**
     * Initial step in the waterfall. This will kick of the ConfirmCallbackStep step
     *
     * If the confirmCallbackStep flag is set in the state machine then we can just
     * end this whole dialog
     *
     * If the confirmCallbackStep flag is set to null then we need to get a response from the user
     *
     * If the user errors out then we're going to set the flag to false and assume they can't / don't
     * want to proceed
     */
    async initialStep(stepContext) {
        // Get the user details / state machine
        const callbackBotDetails = stepContext.options;
        // Set the text for the prompt
        const botGreatMsg = i18nConfig_1.default.__('botGreatMsg');
        const standardMsg = i18nConfig_1.default.__('callbackBotDialogStepStandardMsg');
        // Set the text for the retry prompt
        const retryMsg = i18nConfig_1.default.__('confirmCallbackStepRetryMsg');
        // Check if the error count is greater than the max threshold
        if (callbackBotDetails.errorCount.confirmCallbackStep >= MAX_ERROR_COUNT) {
            // Throw the master error flag
            callbackBotDetails.masterError = true;
            // Set master error message to send
            const errorMsg = i18nConfig_1.default.__('confirmCallbackStepErrorMsg');
            // Send master error message
            await stepContext.context.sendActivity(errorMsg);
            // End the dialog and pass the updated details state machine
            return await stepContext.endDialog(callbackBotDetails);
        }
        // Check the user state to see if callbackBotDetails.confirmCallbackStep is set to null or -1
        // If it is in the error state (-1) or or is set to null prompt the user
        // If it is false the user does not want to proceed
        if (callbackBotDetails.confirmCallbackStep === null ||
            callbackBotDetails.confirmCallbackStep === -1) {
            // Setup the prompt message
            let promptMsg = standardMsg;
            // The current step is an error state
            if (callbackBotDetails.confirmCallbackStep === -1) {
                promptMsg = retryMsg;
            }
            if (callbackBotDetails.confirmCallbackStep === null) {
                await stepContext.context.sendActivity(botGreatMsg);
            }
            const promptOptions = i18nConfig_1.default.__('confirmCallbackStandardPromptOptions');
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
     * Validation step in the waterfall.
     * We use LUIZ to process the prompt reply and then
     * update the state machine (callbackBotDetails)
     */
    async finalStep(stepContext) {
        // Get the user details / state machine
        const callbackDetails = stepContext.options;
        let luisRecognizer;
        let lang = 'en';
        // Language check
        // Then change LUIZ appID
        if (stepContext.context.activity.locale.toLowerCase() === 'fr-ca' ||
            stepContext.context.activity.locale.toLowerCase() === 'fr-fr') {
            console.log('here');
            lang = 'fr';
        }
        // LUIZ Recogniser processing
        luisRecognizer = new callbackRecognizer_1.CallbackRecognizer(lang);
        // Call prompts recognizer
        const recognizerResult = await luisRecognizer.executeLuisQuery(stepContext.context);
        // Top intent tell us which cognitive service to use.
        const intent = botbuilder_ai_1.LuisRecognizer.topIntent(recognizerResult, 'None', 0.5);
        const closeMsg = i18nConfig_1.default.__('confirmCallbackStepCloseMsg');
        switch (intent) {
            // Proceed
            case 'promptConfirmYes':
                console.log('INTENT 1: ', intent);
                callbackDetails.confirmCallbackStep = true;
                return await stepContext.endDialog(callbackDetails);
            // Don't Proceed
            case 'promptConfirmNo':
                console.log('INTENT 1 : ', intent);
                await stepContext.context.sendActivity(closeMsg);
                callbackDetails.confirmCallbackStep = false;
                return await stepContext.endDialog(callbackDetails);
            // Could not understand / None intent
            default: {
                // Catch all
                console.log('NONE INTENT 1');
                callbackDetails.confirmCallbackStep = -1;
                callbackDetails.errorCount.confirmCallbackStep++;
                return await stepContext.replaceDialog(exports.CONFIRM_CALLBACK_STEP, callbackDetails);
            }
        }
    }
}
exports.ConfirmCallbackStep = ConfirmCallbackStep;
//# sourceMappingURL=confirmCallbackStep.js.map