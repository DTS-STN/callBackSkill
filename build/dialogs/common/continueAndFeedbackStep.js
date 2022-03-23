"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContinueAndFeedbackStep = exports.CONTINUE_AND_FEEDBACK_STEP = void 0;
const botbuilder_ai_1 = require("botbuilder-ai");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const commonPromptValidatorModel_1 = require("../../models/commonPromptValidatorModel");
const alwaysOnBotRecognizer_1 = require("../alwaysOnDialogs/alwaysOnBotRecognizer");
const i18nConfig_1 = __importDefault(require("../locales/i18nConfig"));
const commonChoiceCheckStep_1 = require("../common/commonChoiceCheckStep");
const feedBackStep_1 = require("./feedBackStep");
const alwaysOnBotDialog_1 = require("../alwaysOnDialogs/alwaysOnBotDialog");
const TEXT_PROMPT = 'TEXT_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
let isFeedBackStepPassed = false;
exports.CONTINUE_AND_FEEDBACK_STEP = 'CONTINUE_AND_FEEDBACK_STEP';
const CONTINUE_AND_FEEDBACK_WATERFALL_STEP = 'CONTINUE_AND_FEEDBACK_WATERFALL_STEP';
class ContinueAndFeedbackStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.CONTINUE_AND_FEEDBACK_STEP);
        this.addDialog(new commonChoiceCheckStep_1.CommonChoiceCheckStep());
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(TEXT_PROMPT))
            .addDialog(new botbuilder_dialogs_1.ChoicePrompt(CHOICE_PROMPT, this.CustomChoiceValidator))
            .addDialog(new feedBackStep_1.FeedBackStep())
            .addDialog(new botbuilder_dialogs_1.WaterfallDialog(CONTINUE_AND_FEEDBACK_WATERFALL_STEP, [
            this.continueStep.bind(this),
            this.confirmStep.bind(this)
        ]));
        this.initialDialogId = CONTINUE_AND_FEEDBACK_WATERFALL_STEP;
    }
    async CustomChoiceValidator(promptContext) {
        return true;
    }
    /**
     * Initial step in the waterfall. This will prompts Yes and No to the User like confirmation step.
     *
     * This is the end of the process,either user will go to the main flow or will end the process if there are no action required by the user.
     */
    async continueStep(stepContext) {
        const commonPromptValidatorModel = new commonPromptValidatorModel_1.CommonPromptValidatorModel(['promptConfirmYes', 'promptConfirmNo'], Number(i18nConfig_1.default.__('MaxRetryCount')), 'continueAndFeed', i18nConfig_1.default.__('continueAndFeedPromptMessage'));
        // call dialog
        return await stepContext.beginDialog(commonChoiceCheckStep_1.COMMON_CHOICE_CHECK_STEP, commonPromptValidatorModel);
    }
    /**
     * Confirmation step in the waterfall.bot chooses the different flows depends on user's input
     * If users selects 'Yes' then bot will navigate to the main workflow
     * If users selects 'No' then bot will navigate to the feedback flow
     */
    async confirmStep(stepContext) {
        const recognizer = alwaysOnBotRecognizer_1.LUISAlwaysOnBotSetup(stepContext);
        const recognizerResult = await recognizer.recognize(stepContext.context);
        const intent = botbuilder_ai_1.LuisRecognizer.topIntent(recognizerResult, 'None', 0.5);
        switch (intent) {
            case 'promptConfirmYes':
                return await stepContext.replaceDialog(alwaysOnBotDialog_1.ALWAYS_ON_BOT_DIALOG, null);
            case 'promptConfirmNo':
                return await stepContext.replaceDialog(feedBackStep_1.FEED_BACK_STEP, feedBackStep_1.FeedBackStep);
            default:
                isFeedBackStepPassed = true;
                return stepContext.replaceDialog(feedBackStep_1.FEED_BACK_STEP, feedBackStep_1.FeedBackStep);
        }
    }
}
exports.ContinueAndFeedbackStep = ContinueAndFeedbackStep;
//# sourceMappingURL=continueAndFeedbackStep.js.map