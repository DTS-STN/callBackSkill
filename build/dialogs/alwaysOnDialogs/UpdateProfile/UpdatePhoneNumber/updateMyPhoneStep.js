"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMyPhoneStep = exports.UPDATE_PHONE_NUMBER_STEP = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const commonPromptValidatorModel_1 = require("../../../../models/commonPromptValidatorModel");
const continueAndFeedbackStep_1 = require("../../../common/continueAndFeedbackStep");
const i18nConfig_1 = __importDefault(require("../../../locales/i18nConfig"));
const confirmPhoneNumberStep_1 = require("./confirmPhoneNumberStep");
const feedBackStep_1 = require("../../../common/feedBackStep");
const commonChoiceCheckStep_1 = require("../../../common/commonChoiceCheckStep");
const TEXT_PROMPT = 'TEXT_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const UPDATE_PHONE_NUMBER_WATERFALL_STEP = 'UPDATE_PHONE_NUMBER_WATERFALL_STEP';
exports.UPDATE_PHONE_NUMBER_STEP = 'UPDATE_PHONE_NUMBER_STEP';
// Define the main dialog and its related components.
class UpdateMyPhoneStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.UPDATE_PHONE_NUMBER_STEP);
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(TEXT_PROMPT))
            .addDialog(new botbuilder_dialogs_1.ChoicePrompt(CHOICE_PROMPT, this.CustomChoiceValidator))
            .addDialog(new confirmPhoneNumberStep_1.ConfirmPhoneNumberStep())
            .addDialog(new continueAndFeedbackStep_1.ContinueAndFeedbackStep())
            .addDialog(new botbuilder_dialogs_1.WaterfallDialog(UPDATE_PHONE_NUMBER_WATERFALL_STEP, [
            this.checkPhoneNumberStep.bind(this),
            this.routingStep.bind(this)
        ]));
        this.initialDialogId = UPDATE_PHONE_NUMBER_WATERFALL_STEP;
    }
    async CustomChoiceValidator(promptContext) {
        return true;
    }
    // First step in the waterfall dialog. Prompts the user for a command.
    async checkPhoneNumberStep(stepContext) {
        const commonPromptValidatorModel = new commonPromptValidatorModel_1.CommonPromptValidatorModel(['promptConfirmYes', 'promptConfirmNo'], Number(i18nConfig_1.default.__('MaxRetryCount')), 'UpdateMyPhoneNumber', i18nConfig_1.default.__('UpdateMyPhoneNumberPromptMessage'));
        // call dialog
        return await stepContext.beginDialog(commonChoiceCheckStep_1.COMMON_CHOICE_CHECK_STEP, commonPromptValidatorModel);
    }
    /**
     * Selection step in the waterfall.
     * Bot chooses the flows(CONFIRM_PHONE_NUMBER_DIALOG_STEP,CONTINUE_AND_FEEDBACK_DIALOG_STEP) based on user"s input.
     */
    async routingStep(stepContext) {
        const commonPromptValidatorModel = stepContext.result;
        if (commonPromptValidatorModel != null && commonPromptValidatorModel.status) {
            switch (commonPromptValidatorModel.result) {
                case 'promptConfirmYes':
                    commonPromptValidatorModel.retryCount = 0;
                    return await stepContext.beginDialog(confirmPhoneNumberStep_1.CONFIRM_PHONE_NUMBER_STEP, commonPromptValidatorModel);
                case 'promptConfirmNo':
                    await stepContext.context.sendActivity(i18nConfig_1.default.__('NoStatementPhoneNumber'));
                    return stepContext.replaceDialog(continueAndFeedbackStep_1.CONTINUE_AND_FEEDBACK_STEP, continueAndFeedbackStep_1.ContinueAndFeedbackStep);
            }
        }
        else {
            return stepContext.replaceDialog(feedBackStep_1.FEED_BACK_STEP, feedBackStep_1.FeedBackStep);
        }
    }
}
exports.UpdateMyPhoneStep = UpdateMyPhoneStep;
//# sourceMappingURL=updateMyPhoneStep.js.map