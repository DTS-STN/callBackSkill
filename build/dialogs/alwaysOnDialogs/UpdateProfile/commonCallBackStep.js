"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonCallBackStep = exports.COMMON_CALL_BACK_STEP = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const commonPromptValidatorModel_1 = require("../../../models/commonPromptValidatorModel");
const continueAndFeedbackStep_1 = require("../../common/continueAndFeedbackStep");
const feedBackStep_1 = require("../../common/feedBackStep");
const i18nConfig_1 = __importDefault(require("../../locales/i18nConfig"));
const callbackBotDetails_1 = require("../../callbackDialogs/callbackBotDetails");
const callbackBotDialog_1 = require("../../callbackDialogs/callbackBotDialog");
const commonChoiceCheckStep_1 = require("../../common/commonChoiceCheckStep");
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const TEXT_PROMPT = 'TEXT_PROMPT';
exports.COMMON_CALL_BACK_STEP = 'COMMON_CALL_BACK_STEP';
const COMMON_CALL_BACK_WATERFALL_STEP = 'COMMON_CALL_BACK_WATERFALL_STEP';
// Define the main dialog and its related components.
class CommonCallBackStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.COMMON_CALL_BACK_STEP);
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(TEXT_PROMPT))
            .addDialog(new botbuilder_dialogs_1.ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new continueAndFeedbackStep_1.ContinueAndFeedbackStep())
            .addDialog(new feedBackStep_1.FeedBackStep())
            .addDialog(new callbackBotDialog_1.CallbackBotDialog())
            .addDialog(new commonChoiceCheckStep_1.CommonChoiceCheckStep())
            .addDialog(new botbuilder_dialogs_1.WaterfallDialog(COMMON_CALL_BACK_WATERFALL_STEP, [
            this.continueStep.bind(this),
            this.selectionStep.bind(this)
        ]));
        this.initialDialogId = COMMON_CALL_BACK_WATERFALL_STEP;
    }
    async CustomChoiceValidator(promptContext) {
        return true;
    }
    /**
     * First step in the waterfall dialog. Prompts the user for a command
     */
    async continueStep(stepContext) {
        const details = stepContext.options;
        const commonPromptValidatorModel = new commonPromptValidatorModel_1.CommonPromptValidatorModel(['YesIWantToRequestCall', 'NoNotForNow'], Number(i18nConfig_1.default.__('MaxRetryCount')), details.promptCode, details.promptCode + 'PromptMessage');
        // call dialog
        return await stepContext.beginDialog(commonChoiceCheckStep_1.COMMON_CHOICE_CHECK_STEP, commonPromptValidatorModel);
    }
    /**
     * User selection step in the waterfall.
     * User selects the "Yes" prompt to navigate to the call back flow.
     * User selects the "No" prompt to navigate to initial dialog in the flow.
     */
    async selectionStep(stepContext) {
        const commonPromptValidatorModel = stepContext.result;
        if (commonPromptValidatorModel !== null && commonPromptValidatorModel.status) {
            switch (commonPromptValidatorModel.result) {
                case 'YesIWantToRequestCall':
                    const callbackBotDetails = new callbackBotDetails_1.CallbackBotDetails();
                    return await stepContext.beginDialog(callbackBotDialog_1.CALLBACK_BOT_DIALOG, callbackBotDetails);
                case 'NoNotForNow':
                    return await stepContext.replaceDialog(continueAndFeedbackStep_1.CONTINUE_AND_FEEDBACK_STEP, continueAndFeedbackStep_1.ContinueAndFeedbackStep);
            }
        }
        else {
            return stepContext.beginDialog(feedBackStep_1.FEED_BACK_STEP, feedBackStep_1.FeedBackStep);
        }
    }
}
exports.CommonCallBackStep = CommonCallBackStep;
//# sourceMappingURL=commonCallBackStep.js.map