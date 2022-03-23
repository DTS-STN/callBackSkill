"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallbackNextOptionStep = exports.CALLBACK_NEXT_OPTION_STEP = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const i18nConfig_1 = __importDefault(require("../locales/i18nConfig"));
const cards_1 = require("../../cards");
const TEXT_PROMPT = 'TEXT_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
exports.CALLBACK_NEXT_OPTION_STEP = 'CALLBACK_NEXT_OPTION_STEP';
const CALLBACK_NEXT_OPTION_WATERFALL_STEP = 'CALLBACK_NEXT_OPTION_WATERFALL_STEP';
// Error handling
const utils_1 = require("../../utils");
const unblockRecognizer_1 = require("../unblockDialogs/unblockRecognizer");
const botbuilder_ai_1 = require("botbuilder-ai");
const callbackCard_1 = require("../../cards/callbackCard");
const commonChoiceCheckStep_1 = require("../common/commonChoiceCheckStep");
const alwaysOnBotDialog_1 = require("../alwaysOnDialogs/alwaysOnBotDialog");
class CallbackNextOptionStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.CALLBACK_NEXT_OPTION_STEP);
        // Add a text prompt to the dialog stack
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(TEXT_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new commonChoiceCheckStep_1.CommonChoiceCheckStep());
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(CALLBACK_NEXT_OPTION_WATERFALL_STEP, [
            this.unblockBotNextStepStart.bind(this),
            this.unblockBotNextStepEnd.bind(this)
        ]));
        this.initialDialogId = CALLBACK_NEXT_OPTION_WATERFALL_STEP;
    }
    async unblockBotNextStepStart(stepContext) {
        // Get the user details / state machine
        const callbackBotDetails = stepContext.options;
        // Check if the error count is greater than the max threshold
        // Throw the master error flag
        // because  master error already set to send
        if (callbackBotDetails.errorCount.nextOptionStep >= utils_1.MAX_ERROR_COUNT) {
            callbackBotDetails.masterError = true;
            const errorMsg = i18nConfig_1.default.__(`MasterRetryExceededMessage`);
            await cards_1.adaptiveCard(stepContext, callbackCard_1.callbackCard(stepContext.context.activity.locale, errorMsg));
            return await stepContext.endDialog(callbackBotDetails);
        }
        // Check the user state to see if unblockBotDetails.confirm_look_into_step is set to null or -1
        // If it is in the error state (-1) or or is set to null prompt the user
        // If it is false the user does not want to proceed
        if (callbackBotDetails.nextOptionStep === null ||
            callbackBotDetails.nextOptionStep === -1) {
            // Set dialog messages
            let promptMsg;
            promptMsg = i18nConfig_1.default.__('unblockToAlwaysOnBotOrCallbackBotQueryMsg');
            const promptOptions = i18nConfig_1.default.__('unblock_lookup_prompt_confirm_opts');
            const retryMsg = i18nConfig_1.default.__('unblockToAlwaysOnBotOrCallbackBotQueryRetryMsg');
            // Setup the prompt
            const promptText = callbackBotDetails.nextOptionStep === -1 ? retryMsg : promptMsg;
            const promptDetails = {
                prompt: botbuilder_dialogs_1.ChoiceFactory.forChannel(stepContext.context, promptOptions, promptText),
                style: botbuilder_dialogs_1.ListStyle.suggestedAction
            };
            return await stepContext.prompt(TEXT_PROMPT, promptDetails);
        }
        else {
            return await stepContext.next(false);
        }
    }
    async unblockBotNextStepEnd(stepContext) {
        const callbackBotDetails = stepContext.options;
        // Setup the LUIS to recognize intents
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
        luisRecognizer = new unblockRecognizer_1.UnblockRecognizer(lang);
        // Call prompts recognizer
        const recognizerResult = await luisRecognizer.executeLuisQuery(stepContext.context);
        const intent = botbuilder_ai_1.LuisRecognizer.topIntent(recognizerResult, 'None', 0.5);
        switch (intent) {
            // route user to always on bot
            case 'promptConfirmYes':
                return await stepContext.replaceDialog(alwaysOnBotDialog_1.ALWAYS_ON_BOT_DIALOG, null);
            // route user to feedback
            case 'promptConfirmNo':
                return await stepContext.endDialog(callbackBotDetails);
            // Could not understand / No intent
            default: {
                callbackBotDetails.nextOptionStep = -1;
                callbackBotDetails.errorCount.nextOptionStep++;
                return await stepContext.replaceDialog(exports.CALLBACK_NEXT_OPTION_STEP, callbackBotDetails);
            }
        }
    }
}
exports.CallbackNextOptionStep = CallbackNextOptionStep;
//# sourceMappingURL=callbackNext.js.map