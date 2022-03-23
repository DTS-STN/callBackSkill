"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMyEmailStep = exports.UPDATE_EMAIL_STEP = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const commonPromptValidatorModel_1 = require("../../../../models/commonPromptValidatorModel");
const i18nConfig_1 = __importDefault(require("../../../locales/i18nConfig"));
const continueAndFeedbackStep_1 = require("../../../common/continueAndFeedbackStep");
const feedBackStep_1 = require("../../../common/feedBackStep");
const commonChoiceCheckStep_1 = require("../../../common/commonChoiceCheckStep");
const confirmEmailStep_1 = require("./confirmEmailStep");
const TEXT_PROMPT = 'TEXT_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
exports.UPDATE_EMAIL_STEP = 'UPDATE_EMAIL_STEP';
const UPDATE_EMAIL_WATERFALL_STEP = 'UPDATE_EMAIL_WATERFALL_STEP';
// Define the main dialog and its related components.
class UpdateMyEmailStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.UPDATE_EMAIL_STEP);
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(TEXT_PROMPT))
            .addDialog(new botbuilder_dialogs_1.ChoicePrompt(CHOICE_PROMPT, this.CustomChoiceValidator))
            .addDialog(new confirmEmailStep_1.ConfirmEmailStep())
            .addDialog(new continueAndFeedbackStep_1.ContinueAndFeedbackStep())
            .addDialog(new botbuilder_dialogs_1.WaterfallDialog(UPDATE_EMAIL_WATERFALL_STEP, [
            this.checkPhoneNumberStep.bind(this),
            this.routingStep.bind(this)
        ]));
        this.initialDialogId = UPDATE_EMAIL_WATERFALL_STEP;
    }
    async CustomChoiceValidator(promptContext) {
        return true;
    }
    // First step in the waterfall dialog. Prompts the user for a command.
    async checkPhoneNumberStep(stepContext) {
        const commonPromptValidatorModel = new commonPromptValidatorModel_1.CommonPromptValidatorModel(['promptConfirmYes', 'promptConfirmNo'], Number(i18nConfig_1.default.__('MaxRetryCount')), 'UpdateMyEmail', i18nConfig_1.default.__('UpdateMyEmailPromptMessage'));
        // call dialog
        return await stepContext.beginDialog(commonChoiceCheckStep_1.COMMON_CHOICE_CHECK_STEP, commonPromptValidatorModel);
    }
    /**
     * Selection step in the waterfall.
     * Bot chooses the flows based on user"s input.
     */
    async routingStep(stepContext) {
        const commonPromptValidatorModel = stepContext.result;
        if (commonPromptValidatorModel != null && commonPromptValidatorModel.status) {
            switch (commonPromptValidatorModel.result) {
                case 'promptConfirmYes':
                    commonPromptValidatorModel.retryCount = 0;
                    return await stepContext.beginDialog(confirmEmailStep_1.CONFIRM_EMAIL_STEP, commonPromptValidatorModel);
                case 'promptConfirmNo':
                    await stepContext.context.sendActivity(i18nConfig_1.default.__('NoStatementEmail'));
                    return stepContext.replaceDialog(continueAndFeedbackStep_1.CONTINUE_AND_FEEDBACK_STEP, continueAndFeedbackStep_1.ContinueAndFeedbackStep);
            }
        }
        else {
            return stepContext.replaceDialog(feedBackStep_1.FEED_BACK_STEP, feedBackStep_1.FeedBackStep);
        }
    }
}
exports.UpdateMyEmailStep = UpdateMyEmailStep;
//# sourceMappingURL=updateMyEmailStep.js.map