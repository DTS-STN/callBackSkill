"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmPhoneNumberStep = exports.CONFIRM_PHONE_NUMBER_STEP = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const commonPromptValidatorModel_1 = require("../../../../models/commonPromptValidatorModel");
const i18nConfig_1 = __importDefault(require("../../../locales/i18nConfig"));
const continueAndFeedbackStep_1 = require("../../../common/continueAndFeedbackStep");
const commonCallBackStep_1 = require("../commonCallBackStep");
const validateCanadianPhoneNumber_1 = __importDefault(require("../../../../utils/validateCanadianPhoneNumber"));
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const TEXT_PROMPT = 'TEXT_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PHONE_NUMBER_WATERFALL_STEP = 'CONFIRM_PHONE_NUMBER_WATERFALL_STEP';
exports.CONFIRM_PHONE_NUMBER_STEP = 'CONFIRM_PHONE_NUMBER_STEP';
// Define the main dialog and its related components.
class ConfirmPhoneNumberStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.CONFIRM_PHONE_NUMBER_STEP);
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(TEXT_PROMPT))
            .addDialog(new botbuilder_dialogs_1.ChoicePrompt(CHOICE_PROMPT, this.CustomChoiceValidator))
            .addDialog(new continueAndFeedbackStep_1.ContinueAndFeedbackStep())
            .addDialog(new botbuilder_dialogs_1.ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new commonCallBackStep_1.CommonCallBackStep())
            .addDialog(new botbuilder_dialogs_1.WaterfallDialog(CONFIRM_PHONE_NUMBER_WATERFALL_STEP, [
            this.askPhoneNumberStep.bind(this),
            this.updatedStep.bind(this)
        ]));
        this.initialDialogId = CONFIRM_PHONE_NUMBER_WATERFALL_STEP;
    }
    async CustomChoiceValidator(promptContext) {
        return true;
    }
    /**
     *  Initial step in the waterfall. This will kick off the confirmPhoneNumberStep
     *  prompt user to enter the phone number and covers the case where user enters invalid phone number
     */
    async askPhoneNumberStep(stepContext) {
        const details = stepContext.options;
        if (details.retryCount === 0) {
            return await stepContext.prompt(TEXT_PROMPT, i18nConfig_1.default.__('AskPhoneNUmber'));
        }
        else if (details.retryCount < details.maxRetryCount) {
            return await stepContext.prompt(TEXT_PROMPT, i18nConfig_1.default.__('ConfirmPhoneNumberRetryPromptMessage'));
        }
        else if (details.retryCount >= details.maxRetryCount) {
            const exceededRetryMessage = i18nConfig_1.default.__('ConfirmPhoneNumberRetryExceededMessage');
            const commonPromptValidatorModel = new commonPromptValidatorModel_1.CommonPromptValidatorModel(['YesIWantToRequestCall', 'NoNotForNow'], Number(i18nConfig_1.default.__('MaxRetryCount')), 'ConfirmPhoneNumberCallBack', i18nConfig_1.default.__('ConfirmPhoneNumberCallBackPromptMessage'));
            return stepContext.replaceDialog(commonCallBackStep_1.COMMON_CALL_BACK_STEP, commonPromptValidatorModel);
        }
    }
    // confirm the users intent to proceed with the step
    async updatedStep(stepContext) {
        const details = stepContext.options;
        const PhoneNumber = stepContext.result;
        let validPhoneNumber;
        let updatedStatement = i18nConfig_1.default.__('PhoneNumberConfirmStep');
        validPhoneNumber = validateCanadianPhoneNumber_1.default(PhoneNumber);
        if (validPhoneNumber) {
            updatedStatement = updatedStatement.replace('@phoneNumber', validPhoneNumber);
            await stepContext.context.sendActivity(updatedStatement);
            await stepContext.context.sendActivity(i18nConfig_1.default.__('SetStep'));
            return stepContext.replaceDialog(continueAndFeedbackStep_1.CONTINUE_AND_FEEDBACK_STEP, continueAndFeedbackStep_1.ContinueAndFeedbackStep);
        }
        else {
            details.retryCount = details.retryCount + 1;
            return stepContext.replaceDialog(exports.CONFIRM_PHONE_NUMBER_STEP, details);
        }
    }
}
exports.ConfirmPhoneNumberStep = ConfirmPhoneNumberStep;
//# sourceMappingURL=confirmPhoneNumberStep.js.map