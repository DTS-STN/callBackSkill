"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAddressStep = exports.UPDATE_ADDRESS_STEP = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const commonPromptValidatorModel_1 = require("../../../../models/commonPromptValidatorModel");
const continueAndFeedbackStep_1 = require("../../../common/continueAndFeedbackStep");
const feedBackStep_1 = require("../../../common/feedBackStep");
const getAddressesStep_1 = require("./getAddressesStep");
const i18nConfig_1 = __importDefault(require("../../../locales/i18nConfig"));
const commonCallBackStep_1 = require("../commonCallBackStep");
const commonChoiceCheckStep_1 = require("../../../common/commonChoiceCheckStep");
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
exports.UPDATE_ADDRESS_STEP = 'UPDATE_ADDRESS_STEP';
const UPDATE_ADDRESS_WATERFALL_STEP = 'UPDATE_ADDRESS_WATERFALL_STEP';
let isCallBackPassed = false;
// Define the main dialog and its related components.
class UpdateAddressStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.UPDATE_ADDRESS_STEP);
        this.addDialog(new botbuilder_dialogs_1.ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new botbuilder_dialogs_1.ChoicePrompt(CHOICE_PROMPT, this.CustomChoiceValidator))
            .addDialog(new continueAndFeedbackStep_1.ContinueAndFeedbackStep())
            .addDialog(new getAddressesStep_1.GetAddressesStep())
            .addDialog(new botbuilder_dialogs_1.WaterfallDialog(UPDATE_ADDRESS_WATERFALL_STEP, [
            this.checkAddressStep.bind(this),
            this.selectionStep.bind(this)
        ]));
        this.initialDialogId = UPDATE_ADDRESS_WATERFALL_STEP;
    }
    async CustomChoiceValidator(promptContext) {
        return true;
    }
    /**
     * Passing intents list related to UpdateAddress dialog.
     * Passing master error count to common choice dialog.
     * Passing current dialog name to common choice dialog.
     */
    async checkAddressStep(stepContext) {
        let addressDetails = stepContext.options;
        addressDetails.errorCount.updateAddressStep++;
        if (addressDetails.errorCount.updateAddressStep >= Number(i18nConfig_1.default.__('MaxRetryCount'))) {
            const commonPromptValidatorModel = new commonPromptValidatorModel_1.CommonPromptValidatorModel(['YesIWantToRequestCall', 'NoNotForNow'], Number(i18nConfig_1.default.__('MaxRetryCount')), 'ServiceRepresentative', i18nConfig_1.default.__('ServiceRepresentativePromptMessage'));
            isCallBackPassed = true;
            return await stepContext.replaceDialog(commonCallBackStep_1.COMMON_CALL_BACK_STEP, commonPromptValidatorModel);
        }
        else {
            if (addressDetails.errorCount.updateAddressStep === 0) {
                const commonPromptValidatorModel = new commonPromptValidatorModel_1.CommonPromptValidatorModel(['promptConfirmYes', 'promptConfirmNo'], Number(i18nConfig_1.default.__('MaxRetryCount')), 'UpdateAddress', i18nConfig_1.default.__('UpdateAddressPromptMessage'));
                return await stepContext.beginDialog(commonChoiceCheckStep_1.COMMON_CHOICE_CHECK_STEP, commonPromptValidatorModel);
            }
            else {
                isCallBackPassed = true;
                await stepContext.context.sendActivity(i18nConfig_1.default.__('AddressNotFoundMessage'));
                addressDetails = stepContext.options;
                return await stepContext.replaceDialog(getAddressesStep_1.GET_ADDRESS_STEP, addressDetails);
            }
        }
    }
    /**
     * Selection step in the waterfall.bot chooses the different flows depends on user's input
     * If users selects 'Yes' then bot will navigate to the Get Address workflow
     * If users selects 'No' then bot will navigate to the continue and feedback flow
     */
    async selectionStep(stepContext) {
        const commonPromptValidatorModel = stepContext.result;
        if (commonPromptValidatorModel != null && commonPromptValidatorModel.status) {
            switch (commonPromptValidatorModel.result) {
                case 'promptConfirmYes':
                    const addressDetails = stepContext.options;
                    return await stepContext.replaceDialog(getAddressesStep_1.GET_ADDRESS_STEP, addressDetails);
                case 'promptConfirmNo':
                    await stepContext.context.sendActivity(i18nConfig_1.default.__('UpdateAddressNoMessage'));
                    return await stepContext.replaceDialog(continueAndFeedbackStep_1.CONTINUE_AND_FEEDBACK_STEP, continueAndFeedbackStep_1.ContinueAndFeedbackStep);
            }
        }
        else {
            if (!isCallBackPassed) {
                return stepContext.replaceDialog(feedBackStep_1.FEED_BACK_STEP, feedBackStep_1.FeedBackStep);
            }
        }
    }
}
exports.UpdateAddressStep = UpdateAddressStep;
//# sourceMappingURL=updateAddressStep.js.map