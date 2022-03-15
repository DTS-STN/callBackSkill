"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnblockDirectDepositMasterErrorStep = exports.UNBLOCK_DIRECT_DEPOSIT_MASTER_ERROR_STEP = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const botbuilder_ai_1 = require("botbuilder-ai");
const i18nConfig_1 = __importDefault(require("../locales/i18nConfig"));
const cards_1 = require("../../cards");
const unblockDirectDeposit_1 = require("./unblockDirectDeposit");
const unblockRecognizer_1 = require("./unblockRecognizer");
const TEXT_PROMPT = 'TEXT_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
exports.UNBLOCK_DIRECT_DEPOSIT_MASTER_ERROR_STEP = 'UNBLOCK_DIRECT_DEPOSIT_MASTER_ERROR_STEP';
const UNBLOCK_DIRECT_DEPOSIT_MASTER_ERROR_WATERFALL_STEP = 'UNBLOCK_DIRECT_DEPOSIT_MASTER_ERROR_WATERFALL_STEP';
const MAX_ERROR_COUNT = 3;
class UnblockDirectDepositMasterErrorStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.UNBLOCK_DIRECT_DEPOSIT_MASTER_ERROR_STEP);
        // Add a text prompt to the dialog stack
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(TEXT_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(UNBLOCK_DIRECT_DEPOSIT_MASTER_ERROR_WATERFALL_STEP, [
            this.unblockMasterErrorProcessStart.bind(this),
            this.unblockMasterErrorProcessEnd.bind(this)
        ]));
        this.initialDialogId = UNBLOCK_DIRECT_DEPOSIT_MASTER_ERROR_WATERFALL_STEP;
    }
    /**
     * Initial step in the waterfall. This will kick of the ConfirmLookIntoStep step
     *
     * If the confirmLookIntoStep flag is set in the state machine then we can just
     * end this whole dialog
     *
     * If the confirmLookIntoStep flag is set to null then we need to get a response from the user
     *
     * If the user errors out then we're going to set the flag to false and assume they can't / don't
     * want to proceed
     */
    async unblockMasterErrorProcessStart(stepContext) {
        // Get the user details / state machine
        const unblockBotDetails = stepContext.options;
        // Check if the error count is greater than the max threshold
        // Throw the master error flag
        // because  master error already set to send
        if (unblockBotDetails.errorCount.directDepositErrorStep >= MAX_ERROR_COUNT) {
            unblockBotDetails.masterError = true;
            const errorMsg = i18nConfig_1.default.__('unblockBotDialogMasterErrorMsg');
            await cards_1.adaptiveCard(stepContext, cards_1.TextBlock(errorMsg));
            return await stepContext.endDialog(unblockBotDetails);
        }
        // Check the user state to see if unblockBotDetails.confirm_look_into_step is set to null or -1
        // If it is in the error state (-1) or or is set to null prompt the user
        // If it is false the user does not want to proceed
        if (unblockBotDetails.directDepositMasterError === null ||
            unblockBotDetails.directDepositMasterError === -1) {
            // Set dialog messages
            let promptMsg;
            const cardMessage = null;
            const promptOptions = i18nConfig_1.default.__('directDepositMasterErrorPromptRetryOpts');
            const retryMsg = i18nConfig_1.default.__('confirmLookIntoStepRetryMsg');
            promptMsg = i18nConfig_1.default.__('directDepositMasterErrorMsg');
            // Setup the prompt
            const promptText = unblockBotDetails.confirmLookIntoStep === -1 ? retryMsg : promptMsg;
            const promptDetails = {
                prompt: botbuilder_dialogs_1.ChoiceFactory.forChannel(stepContext.context, promptOptions, promptText)
            };
            return await stepContext.prompt(TEXT_PROMPT, promptDetails);
        }
        else {
            return await stepContext.next(false);
        }
    }
    /**
     * Offer to have a Service Canada Officer contact them
     */
    async unblockMasterErrorProcessEnd(stepContext) {
        // Get the user details / state machine
        const unblockBotDetails = stepContext.options;
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
            // route user to callback bot
            case 'promptConfirmYes':
                // Do the direct deposit step
                return await stepContext.replaceDialog(unblockDirectDeposit_1.CONFIRM_DIRECT_DEPOSIT_STEP, unblockBotDetails);
            // route user to always on bot
            case 'promptConfirmNo':
                unblockBotDetails.directDepositMasterError = false;
                const text = i18nConfig_1.default.__('unblock_lookup_decline_final_text');
                const link = i18nConfig_1.default.__('unblock_lookup_decline_callback_link');
                const linkText = i18nConfig_1.default.__('unblock_lookup_decline_final_link_text');
                cards_1.adaptiveCard(stepContext, cards_1.TextBlockWithLink(text, link, linkText));
                return await stepContext.endDialog(unblockBotDetails);
            // Could not understand / No intent
            default: {
                unblockBotDetails.directDepositMasterError = -1;
                unblockBotDetails.errorCount.directDepositErrorStep++;
                return await stepContext.replaceDialog(exports.UNBLOCK_DIRECT_DEPOSIT_MASTER_ERROR_STEP, unblockBotDetails);
            }
        }
    }
}
exports.UnblockDirectDepositMasterErrorStep = UnblockDirectDepositMasterErrorStep;
//# sourceMappingURL=unblockDirectDepositMasterErrorStep.js.map