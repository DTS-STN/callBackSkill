"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedBackStep = exports.FEED_BACK_STEP = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const i18nConfig_1 = __importDefault(require("../locales/i18nConfig"));
const TEXT_PROMPT = 'TEXT_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
exports.FEED_BACK_STEP = 'FEED_BACK_STEP';
const FEED_BACK_WATERFALL_STEP = 'FEED_BACK_WATERFALL_STEP';
class FeedBackStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.FEED_BACK_STEP);
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(TEXT_PROMPT))
            .addDialog(new botbuilder_dialogs_1.ChoicePrompt(CHOICE_PROMPT, this.CustomChoiceValidator))
            .addDialog(new botbuilder_dialogs_1.WaterfallDialog(FEED_BACK_WATERFALL_STEP, [
            this.feedbackStep.bind(this),
            this.finalStep.bind(this)
        ]));
        this.initialDialogId = FEED_BACK_WATERFALL_STEP;
    }
    async CustomChoiceValidator(promptContext) {
        return true;
    }
    /**
     * Initial step in the waterfall. This will prompts service rate card choices to the user.
     */
    async feedbackStep(stepContext) {
        const promptText = i18nConfig_1.default.__('continueAndFeedRating');
        let choices = Array();
        choices = i18nConfig_1.default.__('continueAndFeedRatingChoices');
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: promptText,
            choices: botbuilder_dialogs_1.ChoiceFactory.toChoices(choices)
        });
    }
    /**
     * This is the final step in waterfall.bot displays thank you message to the user end of the bot.
     */
    async finalStep(stepContext) {
        await stepContext.context.sendActivity(i18nConfig_1.default.__('continueAndFeedExcellent'));
        return await stepContext.parent.cancelAllDialogs(true);
    }
}
exports.FeedBackStep = FeedBackStep;
//# sourceMappingURL=feedBackStep.js.map