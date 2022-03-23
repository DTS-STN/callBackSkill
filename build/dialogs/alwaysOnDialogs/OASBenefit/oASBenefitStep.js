"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OASBenefitStep = exports.OAS_BENEFIT_STEP = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const i18nConfig_1 = __importDefault(require("../../locales/i18nConfig"));
const applicationStatusStep_1 = require("./applicationStatusStep");
const commonPromptValidatorModel_1 = require("../../../models/commonPromptValidatorModel");
const feedBackStep_1 = require("../../common/feedBackStep");
const commonChoiceCheckStep_1 = require("../../common/commonChoiceCheckStep");
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const TEXT_PROMPT = 'TEXT_PROMPT';
exports.OAS_BENEFIT_STEP = 'OAS_BENEFIT_STEP';
const OAS_BENEFIT_WATERFALL_STEP = 'OAS_BENEFIT_WATERFALL_STEP';
// Define the main dialog and its related components.
class OASBenefitStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.OAS_BENEFIT_STEP);
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(TEXT_PROMPT))
            .addDialog(new applicationStatusStep_1.ApplicationStatusStep())
            .addDialog(new botbuilder_dialogs_1.ChoicePrompt(CHOICE_PROMPT, this.CustomChoiceValidator))
            .addDialog(new botbuilder_dialogs_1.WaterfallDialog(OAS_BENEFIT_WATERFALL_STEP, [
            this.checkApplicationStatusStep.bind(this),
            this.selectionStep.bind(this)
        ]));
        this.initialDialogId = OAS_BENEFIT_WATERFALL_STEP;
    }
    async CustomChoiceValidator(promptContext) {
        return true;
    }
    /**
     * Passing intents list related to OASBenefit dialog.
     * Passing master error count to common choice dialog.
     * Passing current dialog name to common choice dialog.
     */
    async checkApplicationStatusStep(stepContext) {
        const commonPromptValidatorModel = new commonPromptValidatorModel_1.CommonPromptValidatorModel(['WhatIsMyApplicationStatus'], Number(i18nConfig_1.default.__('MaxRetryCount')), 'OASBenefit', i18nConfig_1.default.__('OASBenefitPromptMessage'));
        return await stepContext.beginDialog(commonChoiceCheckStep_1.COMMON_CHOICE_CHECK_STEP, commonPromptValidatorModel);
    }
    /**
     * This is the final step in the main waterfall dialog.
     * Bot prompts the "Date of Next Payment" and Application Status
     * Users selects the "What's My Application Status" prompt.
     */
    async selectionStep(stepContext) {
        const commonPromptValidatorModel = stepContext.result;
        if (commonPromptValidatorModel != null && commonPromptValidatorModel.status) {
            switch (commonPromptValidatorModel.result) {
                case 'WhatIsMyApplicationStatus':
                    return await stepContext.replaceDialog(applicationStatusStep_1.APPLICATION_STATUS_STEP, applicationStatusStep_1.ApplicationStatusStep);
            }
        }
        else {
            return stepContext.replaceDialog(feedBackStep_1.FEED_BACK_STEP, feedBackStep_1.FeedBackStep);
        }
    }
}
exports.OASBenefitStep = OASBenefitStep;
//# sourceMappingURL=oASBenefitStep.js.map