"use strict";
// State machine to track a users progression through
// the callback bot dialog conversation flow
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallbackBotDetails = void 0;
class CallbackBotDetails {
    constructor() {
        // Master error - flag that is thrown when we hit a critical error in the conversation flow
        this.masterError = null;
        this.preferredEmail = null;
        this.preferredText = null;
        this.preferredEmailAndText = null;
        this.directDepositErrorCallback = null;
        this.getPreferredCallbackDateAndTimeStep = null;
        this.directDepositError = null;
        this.getUserPhoneNumberStep = null;
        this.getUserEmailStep = null;
        this.confirmAuthWordStep = null;
        this.confirmConfirmationStep = null;
        this.getPreferredMethodOfContactStep = null;
        this.confirmEmailStep = null;
        this.confirmPhoneStep = null;
        this.confirmCallbackDetailsStep = null;
        this.date = '';
        this.phoneNumber = '';
        this.time = '';
        this.authCode = '';
        this.confirmCallbackPhoneNumberStep = null;
        this.nextOptionStep = null;
        // State machine that stores the error counts of each step
        this.errorCount = {
            getUserPhoneNumberStep: 0,
            getPreferredCallbackDateAndTimeStep: 0,
            confirmCallbackDetailsStep: 0,
            confirmAuthWordStep: 0,
            getUserEmailStep: 0,
            confirmConfirmationStep: 0,
            getPreferredMethodOfContactStep: 0,
            confirmEmailStep: 0,
            confirmPhoneStep: 0,
            confirmCallbackPhoneNumberStep: 0,
            nextOptionStep: 0
        };
    }
}
exports.CallbackBotDetails = CallbackBotDetails;
//# sourceMappingURL=callbackBotDetails.js.map