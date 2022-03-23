"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmEmailStep = exports.CONFIRM_EMAIL_STEP = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const commonPromptValidatorModel_1 = require("../../../../models/commonPromptValidatorModel");
const i18nConfig_1 = __importDefault(require("../../../locales/i18nConfig"));
const continueAndFeedbackStep_1 = require("../../../common/continueAndFeedbackStep");
const feedBackStep_1 = require("../../../common/feedBackStep");
const commonCallBackStep_1 = require("../commonCallBackStep");
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const TEXT_PROMPT = 'TEXT_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
exports.CONFIRM_EMAIL_STEP = 'CONFIRM_EMAIL_STEP';
const CONFIRM_EMAIL_WATERFALL_STEP = 'CONFIRM_EMAIL_WATERFALL_STEP';
// Define the main dialog and its related components.
class ConfirmEmailStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.CONFIRM_EMAIL_STEP);
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(TEXT_PROMPT))
            .addDialog(new botbuilder_dialogs_1.ChoicePrompt(CHOICE_PROMPT, this.CustomChoiceValidator))
            .addDialog(new continueAndFeedbackStep_1.ContinueAndFeedbackStep())
            .addDialog(new feedBackStep_1.FeedBackStep())
            .addDialog(new commonCallBackStep_1.CommonCallBackStep())
            .addDialog(new botbuilder_dialogs_1.ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new botbuilder_dialogs_1.WaterfallDialog(CONFIRM_EMAIL_WATERFALL_STEP, [
            this.askEmailStep.bind(this),
            this.updatedStep.bind(this)
        ]));
        this.initialDialogId = CONFIRM_EMAIL_WATERFALL_STEP;
    }
    async CustomChoiceValidator(promptContext) {
        return true;
    }
    /**
     *  Initial step in the waterfall. This will kick off the confirmPhoneNumberStep
     *  prompt user to enter the phone number and covers the case where user enters invalid phone number
     */
    async askEmailStep(stepContext) {
        const details = stepContext.options;
        if (details.retryCount === 0) {
            return await stepContext.prompt(TEXT_PROMPT, i18nConfig_1.default.__('AskEmailAddress'));
        }
        else if (details.retryCount < details.maxRetryCount) {
            return await stepContext.prompt(TEXT_PROMPT, i18nConfig_1.default.__('ConfirmEmailRetryPromptMessage'));
        }
        else if (details.retryCount === details.maxRetryCount) {
            const commonPromptValidatorModel = new commonPromptValidatorModel_1.CommonPromptValidatorModel(['YesIWantToRequestCall', 'NoNotForNow'], 2, 'ConfirmEmailCallBack', i18nConfig_1.default.__('ConfirmEmailCallBackPromptMessage'));
            return await stepContext.replaceDialog(commonCallBackStep_1.COMMON_CALL_BACK_STEP, commonPromptValidatorModel);
        }
    }
    // confirm the users intent to proceed with the step
    async updatedStep(stepContext) {
        const details = stepContext.options;
        // ask the user to confirm the phone number and save it to the system
        const Emailaddress = stepContext.result;
        if (Emailaddress) {
            let validEmailaddress;
            let updatedstatement = i18nConfig_1.default.__('EmailAddressConfirmStep');
            validEmailaddress = this.validateEmailaddress(Emailaddress);
            if (validEmailaddress) {
                updatedstatement = updatedstatement.replace('@email', Emailaddress);
                await stepContext.context.sendActivity(updatedstatement);
                await stepContext.context.sendActivity(i18nConfig_1.default.__('SetStep'));
                return stepContext.replaceDialog(continueAndFeedbackStep_1.CONTINUE_AND_FEEDBACK_STEP, null);
            }
            else {
                details.retryCount = details.retryCount + 1;
                return stepContext.replaceDialog(exports.CONFIRM_EMAIL_STEP, details);
            }
        }
        else {
            return await stepContext.beginDialog(feedBackStep_1.FEED_BACK_STEP, null);
        }
    }
    validateEmailaddress(response) {
        let reg = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/;
        let validEmail = false;
        reg = new RegExp(reg);
        if (response.match(reg)) {
            validEmail = true;
        }
        return validEmail;
    }
}
exports.ConfirmEmailStep = ConfirmEmailStep;
//# sourceMappingURL=confirmEmailStep.js.map