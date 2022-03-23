"use strict";
// State machine to track a users progression through
// the unblockbot dialog conversation flow
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnblockBotDetails = void 0;
class UnblockBotDetails {
    constructor() {
        // Master error - flag that is thrown when we hit a critical error in the conversation flow
        this.masterError = null;
        // [STEP 1] Confirms path forward after initial bot block query
        this.confirmLookIntoStep = null;
        // [STEP 2] Requests they unblock their direct deposit
        this.unblockDirectDeposit = null;
        this.nextOptionStep = null;
        this.directDepositMasterError = null;
        // State machine that stores the error counts of each step
        this.errorCount = {
            confirmLookIntoStep: 0,
            unblockDirectDeposit: 0,
            directDepositErrorStep: 0,
            nextOptionStep: 0
        };
    }
}
exports.UnblockBotDetails = UnblockBotDetails;
//# sourceMappingURL=unblockBotDetails.js.map