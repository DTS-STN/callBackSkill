"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChoiceCheckUpdateAddressStep = exports.CHOICE_CHECK_UPDATE_ADDRESS_STEP = void 0;
const botbuilder_ai_1 = require("botbuilder-ai");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const alwaysOnBotRecognizer_1 = require("../../alwaysOnBotRecognizer");
const i18nConfig_1 = __importDefault(require("../../../locales/i18nConfig"));
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const TEXT_PROMPT = 'TEXT_PROMPT';
exports.CHOICE_CHECK_UPDATE_ADDRESS_STEP = 'CHOICE_CHECK_UPDATE_ADDRESS_STEP';
const CHOICE_CHECK_UPDATE_ADDRESS_WATERFALL_STEP = 'CHOICE_CHECK_UPDATE_ADDRESS_WATERFALL_STEP';
class ChoiceCheckUpdateAddressStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.CHOICE_CHECK_UPDATE_ADDRESS_STEP);
        this.addDialog(new botbuilder_dialogs_1.ChoicePrompt(CHOICE_PROMPT, this.CustomChoiceValidator))
            .addDialog(new botbuilder_dialogs_1.WaterfallDialog(CHOICE_CHECK_UPDATE_ADDRESS_WATERFALL_STEP, [
            this.promptStep.bind(this),
            this.finalStep.bind(this)
        ]));
        this.initialDialogId = CHOICE_CHECK_UPDATE_ADDRESS_WATERFALL_STEP;
    }
    async CustomChoiceValidator(promptContext) {
        return true;
    }
    /**
     * 1. Initial step in the waterfall.
     * 2. prompt user with a message based on the step in the flow
     */
    async promptStep(stepContext) {
        const commonPromptValidatorModel = stepContext.options;
        let promptMessage;
        // displays initial prompt message to the user
        if (commonPromptValidatorModel.retryCount === 0) {
            if (!(commonPromptValidatorModel.initialPrompt === '')) {
                promptMessage = commonPromptValidatorModel.initialPrompt;
            }
        }
        // shows the Master error message when user reaches max retry attempts
        else if (commonPromptValidatorModel.retryCount === commonPromptValidatorModel.maxRetryCount) {
            commonPromptValidatorModel.status = false;
            return await stepContext.endDialog(commonPromptValidatorModel);
        }
        // on every rerty attempt made by the user
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
        return await stepContext.replaceDialog(exports.CHOICE_CHECK_UPDATE_ADDRESS_STEP, commonPromptValidatorModel);
    }
}
exports.ChoiceCheckUpdateAddressStep = ChoiceCheckUpdateAddressStep;
//# sourceMappingURL=choiceCheckUpdateAddressStep.js.map