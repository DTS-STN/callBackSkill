"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonChoiceCheckStep = exports.COMMON_CHOICE_CHECK_STEP = void 0;
const botbuilder_ai_1 = require("botbuilder-ai");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const cards_1 = require("../../cards");
const callbackCard_1 = require("../../cards/callbackCard");
const i18nConfig_1 = __importDefault(require("../locales/i18nConfig"));
const alwaysOnBotRecognizer_1 = require("../alwaysOnDialogs/alwaysOnBotRecognizer");
const CHOICE_PROMPT = 'CHOICE_PROMPT';
exports.COMMON_CHOICE_CHECK_STEP = 'COMMON_CHOICE_CHECK_STEP';
const COMMON_CHOICE_CHECK_WATERFALL_STEP = 'COMMON_CHOICE_CHECK_WATERFALL_STEP';
class CommonChoiceCheckStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.COMMON_CHOICE_CHECK_STEP);
        this.addDialog(new botbuilder_dialogs_1.ChoicePrompt(CHOICE_PROMPT, this.CustomChoiceValidator))
            .addDialog(new botbuilder_dialogs_1.WaterfallDialog(COMMON_CHOICE_CHECK_WATERFALL_STEP, [
            this.promptStep.bind(this),
            this.finalStep.bind(this)
        ]));
        this.initialDialogId = COMMON_CHOICE_CHECK_WATERFALL_STEP;
    }
    async CustomChoiceValidator(promptContext) {
        return true;
    }
    /**
     * 1.Initial step in the waterfall.
     * 2.prompt user with a message based on the step in the flow
     */
    async promptStep(stepContext) {
        const commonPromptValidatorModel = stepContext.options;
        let promptMessage;
        // displays initial prompt message to the user
        if (commonPromptValidatorModel.retryCount === 0) {
            if (!(commonPromptValidatorModel.initialPrompt === '')) {
                promptMessage = i18nConfig_1.default.__(`${commonPromptValidatorModel.promptCode}PromptMessage`);
            }
        }
        // shows the Master error message when user reaches max retry attempts
        else if (commonPromptValidatorModel.retryCount === commonPromptValidatorModel.maxRetryCount) {
            commonPromptValidatorModel.status = false;
            const exceededRetryMessage = i18nConfig_1.default.__(`MasterRetryExceededMessage`);
            await cards_1.adaptiveCard(stepContext, callbackCard_1.callbackCard(stepContext.context.activity.locale, exceededRetryMessage));
            return await stepContext.endDialog(commonPromptValidatorModel);
        }
        // on every retry attempt made by the user
        else {
            promptMessage = i18nConfig_1.default.__(`${commonPromptValidatorModel.promptCode}RetryPromptMessage`);
        }
        // displays prompt options to the user
        const promptOptions = i18nConfig_1.default.__(`${commonPromptValidatorModel.promptCode}PromptOptions`);
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: promptMessage,
            choices: botbuilder_dialogs_1.ChoiceFactory.toChoices(promptOptions),
            style: botbuilder_dialogs_1.ListStyle.suggestedAction
        });
    }
    // storing the intent value to the result and passing it to the common prompt validator class
    async finalStep(stepContext) {
        const recognizer = alwaysOnBotRecognizer_1.LUISAlwaysOnBotSetup(stepContext);
        const recognizerResult = await recognizer.recognize(stepContext.context);
        const intent = botbuilder_ai_1.LuisRecognizer.topIntent(recognizerResult, 'None', 0.5);
        const commonPromptValidatorModel = stepContext.options;
        const matchFound = commonPromptValidatorModel.intents.includes(intent);
        if (matchFound) {
            commonPromptValidatorModel.result = intent;
            commonPromptValidatorModel.status = true;
            return await stepContext.endDialog(commonPromptValidatorModel);
        }
        commonPromptValidatorModel.result = intent;
        commonPromptValidatorModel.retryCount++;
        return await stepContext.replaceDialog(exports.COMMON_CHOICE_CHECK_STEP, commonPromptValidatorModel);
    }
}
exports.CommonChoiceCheckStep = CommonChoiceCheckStep;
//# sourceMappingURL=commonChoiceCheckStep.js.map