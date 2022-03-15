"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallbackBotDialog = exports.CALLBACK_BOT_DIALOG = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const confirmCallbackStep_1 = require("./confirmCallbackStep");
const getUserPhoneNumberStep_1 = require("./getUserPhoneNumberStep");
const confirmAuthWordStep_1 = require("./confirmAuthWordStep");
const getPreferredCallbackDateAndTimeStep_1 = require("./getPreferredCallbackDateAndTimeStep");
const confirmCallbackDetailsStep_1 = require("./confirmCallbackDetailsStep");
const i18nConfig_1 = __importDefault(require("../locales/i18nConfig"));
const confirmEmailStep_1 = require("./confirmEmailStep");
const getPreferredMethodOfContactStep_1 = require("./getPreferredMethodOfContactStep");
const confirmPhoneStep_1 = require("./confirmPhoneStep");
const getUserEmailStep_1 = require("./getUserEmailStep");
const confirmCallbackPhoneNumberStep_1 = require("./confirmCallbackPhoneNumberStep");
exports.CALLBACK_BOT_DIALOG = 'CALLBACK_BOT_DIALOG';
const MAIN_CALLBACK_BOT_WATERFALL_DIALOG = 'MAIN_CALLBACK_BOT_WATERFALL_DIALOG';
const CALLBACK_BOT_DETAILS = 'CALLBACK_BOT_DETAILS';
class CallbackBotDialog extends botbuilder_dialogs_1.ComponentDialog {
    constructor(id) {
        super(id || exports.CALLBACK_BOT_DIALOG);
        // Add the ConfirmCallbackStep dialog to the dialog stack
        this.addDialog(new confirmCallbackStep_1.ConfirmCallbackStep());
        this.addDialog(new confirmCallbackPhoneNumberStep_1.ConfirmCallbackPhoneNumberStep());
        this.addDialog(new getPreferredMethodOfContactStep_1.GetPreferredMethodOfContactStep());
        this.addDialog(new confirmEmailStep_1.ConfirmEmailStep());
        this.addDialog(new confirmPhoneStep_1.ConfirmPhoneStep());
        this.addDialog(new getUserEmailStep_1.GetUserEmailStep());
        this.addDialog(new getUserPhoneNumberStep_1.GetUserPhoneNumberStep());
        // this.addDialog(new ConfirmAuthWordStep());
        // this.addDialog(new ConfirmCallbackDetailsStep());
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(MAIN_CALLBACK_BOT_WATERFALL_DIALOG, [
            this.welcomeStep.bind(this),
            this.confirmCallbackStep.bind(this),
            this.confirmCallbackPhoneNumberStep.bind(this),
            this.getPreferredMethodOfContactStep.bind(this),
            this.confirmEmailStep.bind(this),
            this.confirmPhoneStep.bind(this),
            // this.confirmAuthWordStep.bind(this),
            this.getUserEmailStep.bind(this),
            this.getUserPhoneNumberStep.bind(this),
            // this.confirmCallbackDetailsStep.bind(this),
            this.finalStep.bind(this)
        ]));
        this.initialDialogId = MAIN_CALLBACK_BOT_WATERFALL_DIALOG;
    }
    /**
     * Initial step in the waterfall. This will kick of the callbackBot dialog
     * Most of the time this will just kick off the CONFIRM_CALLBACK_STEP dialog -
     * But in the off chance that the bot has already run through the switch statement
     * will take care of edge cases
     */
    async welcomeStep(stepContext) {
        // Get the callback Bot details / state machine for the current user
        const callbackBotDetails = stepContext.options;
        // const welcomeMsg = i18n.__('callbackBotDialogWelcomeMsg');
        // await stepContext.context.sendActivity(welcomeMsg);
        return await stepContext.next(callbackBotDetails);
    }
    /*
     * start the confirmCallbackStep dialog
     */
    async confirmCallbackStep(stepContext) {
        // Get the state machine from the last step
        const callbackBotDetails = stepContext.result;
        switch (callbackBotDetails.confirmCallbackStep) {
            // The confirmCallbackStep flag in the state machine isn't set
            // so we are sending the user to that step
            case null:
                return await stepContext.beginDialog(confirmCallbackStep_1.CONFIRM_CALLBACK_STEP, callbackBotDetails);
            // The confirmCallbackStep flag in the state machine is set to true
            // so we are sending the user to next step
            case true:
                return await stepContext.next(callbackBotDetails);
            // The confirmCallbackStep flag in the state machine is set to false
            // so we are sending to the end because they don't want to continue
            case false:
                // code block
                return await stepContext.endDialog(callbackBotDetails);
            // Default catch all but we should never get here
            default:
                return await stepContext.endDialog(callbackBotDetails);
        }
    }
    /**
     * Not use at this moment
     *
     */
    async confirmCallbackDetailsStep(stepContext) {
        // Get the state machine from the last step
        const callbackBotDetails = stepContext.result;
        // debug
        // Check if a master error occurred and then end the dialog
        if (callbackBotDetails.masterError === true) {
            return await stepContext.endDialog(callbackBotDetails);
        }
        else {
            // If no master error occurred continue on
            switch (callbackBotDetails.confirmCallbackDetailsStep) {
                // The previous step flag in the state machine isn't set
                // so we are sending the user to that step
                case null:
                    if (callbackBotDetails.confirmAuthWordStep === true) {
                        return await stepContext.beginDialog(confirmCallbackDetailsStep_1.CONFIRM_CALLBACK_DETAILS_STEP, callbackBotDetails);
                    }
                    else {
                        return await stepContext.endDialog(callbackBotDetails);
                    }
                // The confirmLookIntoStep flag in the state machine is set to true
                // so we are sending the user to next step
                case true:
                    return await stepContext.next();
                // The confirmLookIntoStep flag in the state machine is set to false
                // so we are sending to the end because they don't want to continue
                case false:
                    return await stepContext.endDialog(callbackBotDetails);
                // Default catch all but we should never get here
                default:
                    return await stepContext.endDialog(callbackBotDetails);
            }
        }
    }
    /**
     * ask user confirm their phone number correct
     *
     */
    async confirmPhoneStep(stepContext) {
        // Get the state machine from the last step
        const callbackBotDetails = stepContext.result;
        if (callbackBotDetails.masterError) {
            return await stepContext.endDialog(callbackBotDetails);
        }
        else {
            switch (callbackBotDetails.confirmPhoneStep) {
                // The confirmPhoneStep flag in the state machine isn't set
                // so we are sending the user to that step
                case null:
                    // start this dialog if user want to receive text or both email and text
                    if (callbackBotDetails.preferredText === true ||
                        callbackBotDetails.preferredEmailAndText === true) {
                        return await stepContext.beginDialog(confirmPhoneStep_1.CONFIRM_PHONE_STEP, callbackBotDetails);
                    }
                    return await stepContext.next(callbackBotDetails);
                // The flag in the state machine is set to true
                // so we are sending the user to next step
                case true:
                    return await stepContext.next(callbackBotDetails);
                // The flag in the state machine is set to false
                // so we are sending to the end because they need to hit the next step
                case false:
                    // code block
                    return await stepContext.endDialog(callbackBotDetails);
                // Default catch all but we should never get here
                default:
                    return await stepContext.endDialog(callbackBotDetails);
            }
        }
    }
    /**
     * update user phone number step
     *
     */
    async getUserPhoneNumberStep(stepContext) {
        // Get the state machine from the last step
        const callbackBotDetails = stepContext.result;
        // Check if a master error occurred and then end the dialog
        if (callbackBotDetails.masterError === true) {
            return await stepContext.endDialog(callbackBotDetails);
        }
        else {
            // If no master error occurred continue on
            switch (callbackBotDetails.getUserPhoneNumberStep) {
                // The confirmPhoneStep flag in the state machine isn't set
                // so we are sending the user to that step
                case null:
                    if (typeof callbackBotDetails.confirmPhoneStep === 'boolean' &&
                        callbackBotDetails.confirmPhoneStep === false) {
                        return await stepContext.beginDialog(getUserPhoneNumberStep_1.GET_USER_PHONE_NUMBER_STEP, callbackBotDetails);
                    }
                    else {
                        return await stepContext.next(callbackBotDetails);
                    }
                // The flag in the state machine is set to true
                // so we are sending the user to next step
                case true:
                    return await stepContext.next(callbackBotDetails);
                // The flag in the state machine is set to false
                // so we are sending to the end because they don't want to continue
                case false:
                    // code block
                    return await stepContext.endDialog(callbackBotDetails);
                // Default catch all but we should never get here
                default:
                    return await stepContext.endDialog(callbackBotDetails);
            }
        }
    }
    async getUserEmailStep(stepContext) {
        // Get the state machine from the last step
        const callbackBotDetails = stepContext.result;
        // Check if a master error occurred and then end the dialog
        if (callbackBotDetails.masterError === true) {
            return await stepContext.endDialog(callbackBotDetails);
        }
        else {
            // If no master error occurred continue on
            switch (callbackBotDetails.getUserEmailStep) {
                case null:
                    // bot only ask user input new email if they say current one is incorrect
                    if (typeof callbackBotDetails.confirmEmailStep === 'boolean' &&
                        callbackBotDetails.confirmEmailStep === false) {
                        return await stepContext.beginDialog(getUserEmailStep_1.GET_USER_EMAIL_STEP, callbackBotDetails);
                    }
                    else
                        return await stepContext.next(callbackBotDetails);
                // The Step flag in the state machine is set to true
                // so we are sending the user to next step
                case true:
                    return await stepContext.next(callbackBotDetails);
                // The Step flag in the state machine is set to false
                // so we are sending to the end because they don't want to continue
                case false:
                    // code block
                    return await stepContext.endDialog(callbackBotDetails);
                // Default catch all but we should never get here
                default:
                    return await stepContext.endDialog(callbackBotDetails);
            }
        }
    }
    /**
     * Not User this moment
     *
     */
    async getPreferredCallbackDateAndTimeStep(stepContext) {
        // Get the state machine from the last step
        const callbackBotDetails = stepContext.result;
        switch (callbackBotDetails.getPreferredCallbackDateAndTimeStep) {
            // The confirmNotifyROEReceivedStep flag in the state machine isn't set
            // so we are sending the user to that step
            case null:
                // ADD CHECKS TO SEE IF THE FIRST THREE STEPS ARE TRUE
                // IF ANY STEPS WERE FALSE OR ANYTHING ELSE THAN JUST END DIALOG
                return await stepContext.beginDialog(getPreferredCallbackDateAndTimeStep_1.GET_PREFERRED_CALLBACK_DATE_AND_TIME_STEP, callbackBotDetails);
            // The confirmNotifyROEReceivedStep flag in the state machine is set to true
            // so we are sending the user to next step
            case true:
                return await stepContext.next(callbackBotDetails);
            // The  flag in the state machine is set to false
            // so we are sending to the end because they need to hit the next step
            case false:
                // code block
                return await stepContext.endDialog(callbackBotDetails);
            // Default catch all but we should never get here
            default:
                return await stepContext.endDialog(callbackBotDetails);
        }
    }
    /**
     * confirm details
     *
     */
    async confirmAuthWordStep(stepContext) {
        // Get the state machine from the last step
        const callbackBotDetails = stepContext.result;
        switch (callbackBotDetails.confirmAuthWordStep) {
            // The confirmAuthWordStep flag in the state machine isn't set
            // so we are sending the user to that step
            case null:
                if (callbackBotDetails.confirmEmailStep === true ||
                    callbackBotDetails.confirmPhoneStep === true) {
                    return await stepContext.beginDialog(confirmAuthWordStep_1.CONFIRM_AUTH_WORD_STEP, callbackBotDetails);
                }
                else {
                    return await stepContext.endDialog(callbackBotDetails);
                }
            // The flag in the state machine is set to true
            // so we are sending the user to next step
            case true:
                return await stepContext.next(callbackBotDetails);
            // The flag in the state machine is set to false
            // so we are sending to the end because they need to hit the next step
            case false:
                return await stepContext.endDialog(callbackBotDetails);
            // Default catch all but we should never get here
            default:
                return await stepContext.endDialog(callbackBotDetails);
        }
    }
    /**
     * ask user confirm their existing email is correct or not
     * @param stepContext
     * @returns
     */
    async confirmEmailStep(stepContext) {
        // Get the state machine from the last step
        const callbackBotDetails = stepContext.result;
        if (callbackBotDetails.masterError) {
            return await stepContext.endDialog(callbackBotDetails);
        }
        else {
            switch (callbackBotDetails.confirmEmailStep) {
                // The flag in the state machine isn't set
                // so we are sending the user to that step
                case null:
                    // only start the dialog if user choose email or both ways to notify them
                    if (callbackBotDetails.preferredEmail === true ||
                        callbackBotDetails.preferredEmailAndText === true) {
                        return await stepContext.beginDialog(confirmEmailStep_1.CONFIRM_EMAIL_STEP, callbackBotDetails);
                    }
                    return await stepContext.next(callbackBotDetails);
                // The flag in the state machine is set to true
                // so we are sending the user to next step
                case true:
                    return await stepContext.next(callbackBotDetails);
                // The flag in the state machine is set to false
                // so we are sending to the end because they need to hit the next step
                case false:
                    return await stepContext.endDialog(callbackBotDetails);
                // Default catch all but we should never get here
                default:
                    return await stepContext.endDialog(callbackBotDetails);
            }
        }
    }
    async confirmCallbackPhoneNumberStep(stepContext) {
        // Get the state machine from the last step
        const callbackBotDetails = stepContext.result;
        if (callbackBotDetails.masterError) {
            return await stepContext.endDialog(callbackBotDetails);
        }
        else {
            switch (callbackBotDetails.confirmCallbackPhoneNumberStep) {
                // The flag in the state machine isn't set
                // so we are sending the user to that step
                case null:
                    // only start the dialog if user choose setup callback
                    if (callbackBotDetails.confirmCallbackStep === true) {
                        return await stepContext.beginDialog(confirmCallbackPhoneNumberStep_1.CONFIRM_CALLBACK_PHONE_NUMBER_STEP, callbackBotDetails);
                    }
                    else {
                        return await stepContext.next(callbackBotDetails);
                    }
                // The flag in the state machine is set to true
                // so we are sending the user to next step
                case true:
                    return await stepContext.next(callbackBotDetails);
                // The flag in the state machine is set to false
                // so we are sending to the end because they need to hit the next step
                case false:
                    return await stepContext.endDialog(callbackBotDetails);
                // Default catch all but we should never get here
                default:
                    return await stepContext.endDialog(callbackBotDetails);
            }
        }
    }
    /**
     * confirm primary contact method that user preferred
     * @param stepContext
     * @returns
     */
    async getPreferredMethodOfContactStep(stepContext) {
        // Get the state machine from the last step
        const callbackBotDetails = stepContext.result;
        if (callbackBotDetails.masterError) {
            return await stepContext.endDialog(callbackBotDetails);
        }
        else {
            switch (callbackBotDetails.getPreferredMethodOfContactStep) {
                // The  flag in the state machine isn't set
                // so we are sending the user to that step
                case null:
                    if (callbackBotDetails.confirmCallbackStep === true &&
                        callbackBotDetails.confirmCallbackPhoneNumberStep === true) {
                        return await stepContext.beginDialog(getPreferredMethodOfContactStep_1.GET_PREFERRED_METHOD_OF_CONTACT_STEP, callbackBotDetails);
                    }
                    else {
                        return await stepContext.endDialog(callbackBotDetails);
                    }
                // The flag in the state machine is set to true
                // so we are sending the user to next step
                case true:
                    return await stepContext.next(callbackBotDetails);
                // The flag in the state machine is set to false
                // so we are sending to the end because they need to hit the next step
                case false:
                    return await stepContext.endDialog(callbackBotDetails);
                // Default catch all but we should never get here
                default:
                    return await stepContext.endDialog(callbackBotDetails);
            }
        }
    }
    /**
     * Final step in the waterfall. This will end the callbackBot dialog
     */
    async finalStep(stepContext) {
        // Get the results of the last ran step
        const callbackBotDetails = stepContext.result;
        // Check if a master error has occurred
        if (callbackBotDetails.masterError === true) {
            const masterErrorMsg = i18nConfig_1.default.__('callbackBotDialogMasterErrorMsg');
            await stepContext.context.sendActivity(masterErrorMsg);
        }
        return await stepContext.endDialog(callbackBotDetails);
    }
}
exports.CallbackBotDialog = CallbackBotDialog;
//# sourceMappingURL=callbackBotDialog.js.map