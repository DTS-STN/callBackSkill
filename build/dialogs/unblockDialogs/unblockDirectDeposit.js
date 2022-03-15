"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnblockDirectDepositStep = exports.CONFIRM_DIRECT_DEPOSIT_STEP = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const i18nConfig_1 = __importDefault(require("../locales/i18nConfig"));
const cards_1 = require("../../cards");
const unblockDirectDepositMasterErrorStep_1 = require("./unblockDirectDepositMasterErrorStep");
const TEXT_PROMPT = 'TEXT_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
exports.CONFIRM_DIRECT_DEPOSIT_STEP = 'CONFIRM_DIRECT_DEPOSIT_STEP';
const CONFIRM_DIRECT_DEPOSIT_WATERFALL_STEP = 'CONFIRM_DIRECT_DEPOSIT_WATERFALL_STEP';
// Error handling
const MAX_ERROR_COUNT = 3;
const ACCOUNT = false;
let TRANSIT = false;
let INSTITUTE = false;
class UnblockDirectDepositStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.CONFIRM_DIRECT_DEPOSIT_STEP);
        // Add a text prompt to the dialog stack
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(TEXT_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(CONFIRM_DIRECT_DEPOSIT_WATERFALL_STEP, [
            this.unblockDirectDepositStart.bind(this),
            this.unblockBankDetails.bind(this),
            this.unblockDirectDepositEnd.bind(this)
        ]));
        this.initialDialogId = CONFIRM_DIRECT_DEPOSIT_WATERFALL_STEP;
    }
    /**
     * Initial step in the waterfall. This will kick of the UnblockDirectDepositStep step
     */
    async unblockDirectDepositStart(stepContext) {
        // Get the user details / state machine
        const unblockBotDetails = stepContext.options;
        // Check if the error count is greater than the max threshold
        // the design for this step is different compare to other steps
        // this time will not trigger a master error. it will go to a new step
        if (unblockBotDetails.errorCount.unblockDirectDeposit >= MAX_ERROR_COUNT) {
            unblockBotDetails.unblockDirectDeposit = -1;
            return await stepContext.replaceDialog(unblockDirectDepositMasterErrorStep_1.UNBLOCK_DIRECT_DEPOSIT_MASTER_ERROR_STEP, unblockBotDetails);
        }
        // If it is in the error state (-1) or or is set to null prompt the user
        // If it is false the user does not want to proceed
        // If it is 0, we have some direct deposit info but not all of it
        if (unblockBotDetails.unblockDirectDeposit === null ||
            unblockBotDetails.unblockDirectDeposit === -1 ||
            unblockBotDetails.unblockDirectDeposit === 0) {
            // Set dialog messages
            let promptMsg = '';
            let retryMsg = '';
            // State of unblock direct deposit determines message prompts
            if (INSTITUTE === true) {
                // ACCOUNT
                promptMsg = i18nConfig_1.default.__('unblock_direct_deposit_account');
                retryMsg = i18nConfig_1.default.__('unblock_direct_deposit_account_retry');
                if (unblockBotDetails.unblockDirectDeposit === -1) {
                    await cards_1.adaptiveCard(stepContext, cards_1.TextBlock(retryMsg));
                }
            }
            else if (TRANSIT === true) {
                // INSTITUTE
                promptMsg = i18nConfig_1.default.__('unblock_direct_deposit_institute');
                retryMsg = i18nConfig_1.default.__('unblock_direct_deposit_institute_retry');
                if (unblockBotDetails.unblockDirectDeposit === -1) {
                    await cards_1.adaptiveCard(stepContext, cards_1.TextBlock(retryMsg));
                }
            }
            else {
                // TRANSIT
                promptMsg = i18nConfig_1.default.__('unblock_direct_deposit_transit');
                retryMsg = i18nConfig_1.default.__('unblock_direct_deposit_transit_retry');
                if (unblockBotDetails.unblockDirectDeposit === -1) {
                    await cards_1.adaptiveCard(stepContext, cards_1.TextBlock(retryMsg));
                }
            }
            // If first pass through, show welcome messaging (adaptive cards)
            if (unblockBotDetails.unblockDirectDeposit === null) {
                await cards_1.adaptiveCard(stepContext, cards_1.whatNumbersToFindSchema());
                await cards_1.adaptiveCard(stepContext, cards_1.howToFindNumbersSchema());
            }
            // Prompt the user to enter their bank information
            return await stepContext.prompt(TEXT_PROMPT, { prompt: promptMsg });
        }
        else {
            return await stepContext.next(false);
        }
    }
    async unblockBankDetails(stepContext) {
        // Get the user details / state machine
        const unblockBotDetails = stepContext.options;
        const userInput = stepContext._info ? stepContext._info.result : null;
        // Validate numeric input
        let numLength = 0;
        if (INSTITUTE === true) {
            // Account
            numLength = 7;
        }
        else if (TRANSIT === true) {
            // Transit
            numLength = 3;
        }
        else {
            // Transit
            numLength = 5;
        }
        const numberRegex = /^\d+$/;
        const validNumber = numberRegex.test(userInput);
        // If valid number matches requested value length
        if (validNumber && userInput.length === numLength && TRANSIT === false) {
            TRANSIT = true;
            unblockBotDetails.unblockDirectDeposit = 0;
            unblockBotDetails.errorCount.unblockDirectDeposit = 0;
        }
        else if (validNumber &&
            userInput.length === numLength &&
            INSTITUTE === false) {
            INSTITUTE = true;
            unblockBotDetails.unblockDirectDeposit = 0;
            unblockBotDetails.errorCount.unblockDirectDeposit = 0;
        }
        else if (validNumber &&
            userInput.length === numLength &&
            INSTITUTE === true &&
            TRANSIT === true &&
            ACCOUNT === false) {
            unblockBotDetails.unblockDirectDeposit = true; // Proceed
            TRANSIT = false; // Reset
            INSTITUTE = false; // Reset
        }
        else {
            unblockBotDetails.unblockDirectDeposit = -1;
            unblockBotDetails.errorCount.unblockDirectDeposit++;
        }
        // Next step for pass, or repeat as needed
        if (unblockBotDetails.unblockDirectDeposit === true) {
            return await stepContext.next(unblockBotDetails);
        }
        else {
            return await stepContext.replaceDialog(exports.CONFIRM_DIRECT_DEPOSIT_STEP, unblockBotDetails);
        }
    }
    /**
     * End Direct Deposit Waterfall
     */
    async unblockDirectDepositEnd(stepContext) {
        // Set the messages
        const unblockBotDetails = stepContext.options;
        const validReminder = i18nConfig_1.default.__('unblock_direct_deposit_valid_reminder');
        const doneMsg = i18nConfig_1.default.__('unblock_direct_deposit_complete');
        const validMsg = i18nConfig_1.default.__('unblock_direct_deposit_valid_msg');
        const tipMsg = i18nConfig_1.default.__('unblock_direct_deposit_valid_tip');
        // Display the prompts
        await cards_1.adaptiveCard(stepContext, cards_1.TwoTextBlock(validMsg, tipMsg));
        await cards_1.adaptiveCard(stepContext, cards_1.TextBlock(validReminder));
        await cards_1.adaptiveCard(stepContext, cards_1.TextBlock(doneMsg));
        unblockBotDetails.directDepositMasterError = false;
        // End the dialog
        return await stepContext.endDialog(unblockBotDetails);
    }
}
exports.UnblockDirectDepositStep = UnblockDirectDepositStep;
//# sourceMappingURL=unblockDirectDeposit.js.map