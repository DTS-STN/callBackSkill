"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnblockBotDialog = exports.UNBLOCK_BOT_DIALOG = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const unblockLookup_1 = require("./unblockLookup");
const unblockDirectDeposit_1 = require("./unblockDirectDeposit");
const i18nConfig_1 = __importDefault(require("../locales/i18nConfig"));
const callbackBotDialog_1 = require("../callbackDialogs/callbackBotDialog");
const cards_1 = require("../../cards");
const unblockDirectDepositMasterErrorStep_1 = require("./unblockDirectDepositMasterErrorStep");
const unblockNext_1 = require("./unblockNext");
exports.UNBLOCK_BOT_DIALOG = 'UNBLOCK_BOT_DIALOG';
const MAIN_UNBLOCK_BOT_WATERFALL_DIALOG = 'MAIN_UNBLOCK_BOT_WATERFALL_DIALOG';
class UnblockBotDialog extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.UNBLOCK_BOT_DIALOG);
        // Add the ConfirmLookIntoStep dialog to the dialog stack
        this.addDialog(new unblockLookup_1.ConfirmLookIntoStep());
        this.addDialog(new unblockDirectDeposit_1.UnblockDirectDepositStep());
        this.addDialog(new unblockNext_1.UnblockNextOptionStep());
        this.addDialog(new unblockDirectDepositMasterErrorStep_1.UnblockDirectDepositMasterErrorStep());
        this.addDialog(new callbackBotDialog_1.CallbackBotDialog());
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(MAIN_UNBLOCK_BOT_WATERFALL_DIALOG, [
            this.welcomeStep.bind(this),
            this.confirmLookIntoStep.bind(this),
            this.unblockDirectDepositStep.bind(this),
            this.unblockNextOptionStep.bind(this),
            this.unblockMasterErrorStep.bind(this),
            this.finalStep.bind(this)
        ]));
        this.initialDialogId = MAIN_UNBLOCK_BOT_WATERFALL_DIALOG;
    }
    /**
     * 1. Initial step in the waterfall. This will kick of the unblockBot dialog
     * Most of the time this will just kick off the CONFIRM_LOOK_INTO_STEP dialog -
     * But in the off chance that the bot has already run through the switch statement
     * will take care of edge cases
     */
    async welcomeStep(stepContext) {
        // Get the unblockbot details / state machine for the current user
        const unblockBotDetails = stepContext.options;
        await cards_1.adaptiveCard(stepContext, cards_1.TextBlock(i18nConfig_1.default.__('unblock_lookup_welcome_msg')));
        return await stepContext.next(unblockBotDetails);
    }
    /**
     * 2. Confirm the user's intent to proceed with the unblockbot
     */
    async confirmLookIntoStep(stepContext) {
        // Get the state machine from the last step
        const unblockBotDetails = stepContext.result;
        switch (unblockBotDetails.confirmLookIntoStep) {
            // The confirmLookIntoStep flag in the state machine isn't set
            // so we are sending the user to that step
            case null:
                return await stepContext.beginDialog(unblockLookup_1.CONFIRM_LOOK_INTO_STEP, unblockBotDetails);
            // The confirmLookIntoStep flag in the state machine is set to true
            // so we are sending the user to next step
            case true:
                return await stepContext.next(unblockBotDetails);
            // The confirmLookIntoStep flag in the state machine is set to false
            // so we are sending to the end because they don't want to continue
            case false:
                return await stepContext.endDialog(unblockBotDetails);
            // Default catch all but we should never get here
            default:
                return await stepContext.endDialog(unblockBotDetails);
        }
    }
    // Unblock the user's direct deposit account
    async unblockDirectDepositStep(stepContext) {
        // Get the state machine from the last step
        const unblockBotDetails = stepContext.result;
        // Check if a master error occurred and then end the dialog
        if (unblockBotDetails.masterError) {
            return await stepContext.endDialog(unblockBotDetails);
        }
        else {
            // If no master error occurred continue on to the next step
            switch (unblockBotDetails.unblockDirectDeposit) {
                // The flag in the state machine isn't set
                // so we are sending the user to that step
                case null:
                    return await stepContext.beginDialog(unblockDirectDeposit_1.CONFIRM_DIRECT_DEPOSIT_STEP, unblockBotDetails);
                // The confirmLookIntoStep flag in the state machine is set to true
                // so we are sending the user to next step
                case true:
                    return await stepContext.next(unblockBotDetails);
                // The flag in the state machine is set to false
                // so we are sending to the end because they don't want to continue
                case false:
                default:
                    return await stepContext.endDialog(unblockBotDetails);
            }
        }
    }
    async unblockNextOptionStep(stepContext) {
        // Get the state machine from the last step
        const unblockBotDetails = stepContext.result;
        // Check if a master error occurred and then end the dialog
        if (unblockBotDetails.masterError) {
            return await stepContext.endDialog(unblockBotDetails);
        }
        else {
            // If no master error occurred continue on to the next step
            switch (unblockBotDetails.nextOptionStep) {
                // The flag in the state machine isn't set
                // so we are sending the user to that step
                case null:
                    return await stepContext.beginDialog(unblockNext_1.NEXT_OPTION_STEP, unblockBotDetails);
                // The confirmLookIntoStep flag in the state machine is set to true
                // so we are sending the user to next step
                case true:
                    return await stepContext.next(unblockBotDetails);
                // The flag in the state machine is set to false
                // so we are sending to the end because they don't want to continue
                case false:
                default:
                    return await stepContext.endDialog(unblockBotDetails);
            }
        }
    }
    /**
     * this is handle direct deposit master error scenario for unblock bot
     * @param stepContext
     * @returns
     *
     */
    async unblockMasterErrorStep(stepContext) {
        // Get the state machine from the last step
        const unblockBotDetails = stepContext.result;
        // Check if a master error occurred and then end the dialog
        if (unblockBotDetails.masterError) {
            return await stepContext.endDialog(unblockBotDetails);
        }
        else {
            // If no master error occurred continue on to the next step
            switch (unblockBotDetails.directDepositMasterError) {
                // The flag in the state machine isn't set
                // so we are sending the user to that step
                case null:
                    return await stepContext.beginDialog(unblockDirectDepositMasterErrorStep_1.UNBLOCK_DIRECT_DEPOSIT_MASTER_ERROR_STEP, unblockBotDetails);
                // The flag in the state machine is set to true
                // so we are sending the user to next step
                case true:
                    return await stepContext.next(unblockBotDetails);
                // The flag in the state machine is set to false
                // so we are sending to the end because they don't want to continue
                case false:
                default:
                    return await stepContext.endDialog(unblockBotDetails);
            }
        }
    }
    /**
     * Final step in the waterfall. This will end the unblockBot dialog
     */
    async finalStep(stepContext) {
        // Get the results of the last ran step
        const unblockBotDetails = stepContext.result;
        // Check if a master error has occurred
        if (unblockBotDetails !== undefined && unblockBotDetails.masterError) {
            const masterErrorMsg = i18nConfig_1.default.__('masterErrorMsg');
            await stepContext.context.sendActivity(masterErrorMsg);
        }
        return await stepContext.endDialog(unblockBotDetails);
    }
}
exports.UnblockBotDialog = UnblockBotDialog;
//# sourceMappingURL=unblockBotDialog.js.map