"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationStatusStep = exports.APPLICATION_STATUS_STEP = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const i18nConfig_1 = __importDefault(require("../../locales/i18nConfig"));
const continueAndFeedbackStep_1 = require("../../common/continueAndFeedbackStep");
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
exports.APPLICATION_STATUS_STEP = 'APPLICATION_STATUS_STEP';
const APPLICATION_STATUS_WATERFALL_STEP = 'APPLICATION_STATUS_WATERFALL_STEP';
// Define the main dialog and its related components
class ApplicationStatusStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.APPLICATION_STATUS_STEP);
        this.addDialog(new botbuilder_dialogs_1.ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new continueAndFeedbackStep_1.ContinueAndFeedbackStep())
            .addDialog(new botbuilder_dialogs_1.WaterfallDialog(APPLICATION_STATUS_WATERFALL_STEP, [
            this.checkProfileStep.bind(this)
        ]));
        this.initialDialogId = APPLICATION_STATUS_WATERFALL_STEP;
    }
    /**
     * This is the final step in the main waterfall dialog.
     * Bot displays the Payment due amount and next payment details..etc.
     */
    async checkProfileStep(stepContext) {
        await stepContext.context.sendActivity(i18nConfig_1.default.__('oasBenefitCheckProfile'));
        await stepContext.context.sendActivity(i18nConfig_1.default.__('oasBenefitPaymentDue'));
        await stepContext.context.sendActivity(i18nConfig_1.default.__('oasBenefitShowDeposit'));
        return await stepContext.replaceDialog(continueAndFeedbackStep_1.CONTINUE_AND_FEEDBACK_STEP, continueAndFeedbackStep_1.ContinueAndFeedbackStep);
    }
}
exports.ApplicationStatusStep = ApplicationStatusStep;
//# sourceMappingURL=applicationStatusStep.js.map