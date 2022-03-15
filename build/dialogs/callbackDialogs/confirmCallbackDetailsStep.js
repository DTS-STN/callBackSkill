"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmCallbackDetailsStep = exports.CONFIRM_CALLBACK_DETAILS_STEP = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const i18nConfig_1 = __importDefault(require("../locales/i18nConfig"));
const callbackBotDetails_1 = require("./callbackBotDetails");
const TEXT_PROMPT = 'TEXT_PROMPT';
exports.CONFIRM_CALLBACK_DETAILS_STEP = 'CONFIRM_CALLBACK_DETAILS_STEP';
const CONFIRM_CALLBACK_DETAILS_STEP_WATERFALL_STEP = 'CONFIRM_CALLBACK_DETAILS_STEP_WATERFALL_STEP';
const MAX_ERROR_COUNT = 3;
class ConfirmCallbackDetailsStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.CONFIRM_CALLBACK_DETAILS_STEP);
        // Add a text prompt to the dialog stack
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(TEXT_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(CONFIRM_CALLBACK_DETAILS_STEP_WATERFALL_STEP, [
            this.initialStep.bind(this),
            this.finalStep.bind(this)
        ]));
        this.initialDialogId = CONFIRM_CALLBACK_DETAILS_STEP_WATERFALL_STEP;
    }
    /**
     * Initial step in the waterfall. This will kick of the ConfirmLookIntoStep step
     *
     * If the confirmSendEmailStep flag is set in the state machine then we can just
     * end this whole dialog
     *
     * If the confirmLookIntoStep flag is set to null then we need to get a response from the user
     *
     * If the user errors out then we're going to set the flag to false and assume they can't / don't
     * want to proceed
     */
    async initialStep(stepContext) {
        // Get the user details / state machine
        const callbackBotDetails = stepContext.options;
        // Set the text for the prompt
        const standardMsg = i18nConfig_1.default.__('confirmCallbackDetailsStepStandardMsg');
        // Check if the error count is greater than the max threshold
        if (callbackBotDetails.errorCount.confirmCallbackDetailsStep >=
            MAX_ERROR_COUNT) {
            // Throw the master error flag
            callbackBotDetails.masterError = true;
            // Set error message to send
            const errorMsg = i18nConfig_1.default.__('confirmSendEmailStepErrorMsg');
            // Send error message
            await stepContext.context.sendActivity(errorMsg);
            // End the dialog and pass the updated details state machine
            return await stepContext.endDialog(callbackBotDetails);
        }
        // Check the user state to see if callbackBotDetails.confirm_look_into_step is set to null or -1
        // If it is in the error state (-1) or or is set to null prompt the user
        // If it is false the user does not want to proceed
        if (callbackBotDetails.confirmCallbackDetailsStep === null ||
            callbackBotDetails.confirmCallbackDetailsStep === -1) {
            // TODO: Refactor this - has to be a better way
            // If the flag is set to null then the step hasn't run before
            if (callbackBotDetails.confirmCallbackDetailsStep === null) {
                const details = new callbackBotDetails_1.CallbackBotDetails();
                const stepContextOptions = stepContext.options;
                details.phoneNumber = stepContextOptions.phoneNumber;
                details.date = stepContextOptions.date;
                details.time = stepContextOptions.time;
                details.authCode = stepContextOptions.authCode;
                const outputMsg = standardMsg + details.toString();
                await stepContext.context.sendActivity(outputMsg);
                return stepContext.next(callbackBotDetails);
            }
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
        const callbackBotDetails = stepContext.options;
        // Language check
        let applicationId = '';
        let endpointKey = '';
        let endpoint = '';
        // Then change LUIZ appID
        if (stepContext.context.activity.locale.toLowerCase() === 'fr-ca' ||
            stepContext.context.activity.locale.toLowerCase() === 'fr-fr') {
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
        /*  const recognizer = new LuisRecognizer({
                applicationId: applicationId,
                endpointKey: endpointKey,
                endpoint: endpoint
            }, {
                includeAllIntents: true,
                includeInstanceData: true
            }, true);
    
            // Call prompts recognizer
            const recognizerResult = await recognizer.recognize(stepContext.context);
    */
        // Top intent tell us which cognitive service to use.
        //   const intent = LuisRecognizer.topIntent(recognizerResult, 'None', 0.50);
        // This message is sent if the user selects that they don't want to continue
        const intent = 'promptConfirmYes';
        switch (intent) {
            // Proceed
            case 'promptConfirmYes':
            case 'promptConfirmSendEmailYes':
                console.log('INTENT: ', intent);
                callbackBotDetails.confirmCallbackDetailsStep = true;
                return await stepContext.endDialog(callbackBotDetails);
            // Could not understand / None intent
            default: {
                // Catch all
                console.log('NONE INTENT');
                callbackBotDetails.confirmCallbackDetailsStep = -1;
                callbackBotDetails.errorCount.confirmCallbackDetailsStep++;
                return await stepContext.replaceDialog(exports.CONFIRM_CALLBACK_DETAILS_STEP, callbackBotDetails);
            }
        }
    }
}
exports.ConfirmCallbackDetailsStep = ConfirmCallbackDetailsStep;
//# sourceMappingURL=confirmCallbackDetailsStep.js.map