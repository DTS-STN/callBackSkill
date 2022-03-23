"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateNumberStep = exports.VALIDATE_NUMBER_STEP = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const commonPromptValidatorModel_1 = require("../../../../models/commonPromptValidatorModel");
const continueAndFeedbackStep_1 = require("../../../common/continueAndFeedbackStep");
const i18nConfig_1 = __importDefault(require("../../../locales/i18nConfig"));
const commonCallBackStep_1 = require("../commonCallBackStep");
const TEXT_PROMPT = 'TEXT_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
exports.VALIDATE_NUMBER_STEP = 'VALIDATE_NUMBER_STEP';
const VALIDATE_NUMBER_STEP_WATERFALL_STEP = 'VALIDATE_NUMBER_STEP_WATERFALL_STEP';
// Define the main dialog and its related components.
class ValidateNumberStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.VALIDATE_NUMBER_STEP);
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(TEXT_PROMPT))
            .addDialog(new botbuilder_dialogs_1.ChoicePrompt(CHOICE_PROMPT, this.CustomChoiceValidator))
            .addDialog(new continueAndFeedbackStep_1.ContinueAndFeedbackStep())
            .addDialog(new commonCallBackStep_1.CommonCallBackStep())
            .addDialog(new botbuilder_dialogs_1.WaterfallDialog(VALIDATE_NUMBER_STEP_WATERFALL_STEP, [
            this.initPrompt.bind(this),
            this.checkNumberStep.bind(this)
        ]));
        this.initialDialogId = VALIDATE_NUMBER_STEP_WATERFALL_STEP;
    }
    async CustomChoiceValidator(promptContext) {
        return true;
    }
    // First step in the waterfall dialog. Prompts the user for a command.
    async initPrompt(stepContext) {
        const addressDetails = stepContext.options;
        if (addressDetails.errorCount.numberValidationStep === 0) {
            // call dialog
            return await stepContext.prompt(TEXT_PROMPT, addressDetails.promptMessage);
        }
        else {
            return await stepContext.prompt(TEXT_PROMPT, addressDetails.promptRetryMessage);
        }
    }
    async checkNumberStep(stepContext) {
        const addressDetails = stepContext.options;
        let isValidNumber;
        isValidNumber = this.validateNumber(stepContext.context.activity.text);
        if (!isValidNumber) {
            addressDetails.errorCount.numberValidationStep++;
            if (addressDetails.errorCount.numberValidationStep >= Number(i18nConfig_1.default.__('MaxRetryCount'))) {
                const commonPromptValidatorModel = new commonPromptValidatorModel_1.CommonPromptValidatorModel(['YesIWantToRequestCall', 'NoNotForNow'], Number(i18nConfig_1.default.__('MaxRetryCount')), 'ServiceRepresentative', i18nConfig_1.default.__('ServiceRepresentativePromptMessage'));
                return await stepContext.replaceDialog(commonCallBackStep_1.COMMON_CALL_BACK_STEP, commonPromptValidatorModel);
            }
            else {
                return await stepContext.replaceDialog(exports.VALIDATE_NUMBER_STEP, addressDetails);
            }
        }
        else {
            return await stepContext.next();
        }
    }
    validateNumber(response) {
        let reg = /^[0-9]*$/;
        let validNumber = false;
        reg = new RegExp(reg);
        if (response.match(reg)) {
            validNumber = true;
        }
        return validNumber;
    }
}
exports.ValidateNumberStep = ValidateNumberStep;
//# sourceMappingURL=validateNumberStep.js.map