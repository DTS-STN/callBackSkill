"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileStep = exports.UPDATE_PROFILE_STEP = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const commonPromptValidatorModel_1 = require("../../../models/commonPromptValidatorModel");
const continueAndFeedbackStep_1 = require("../../common/continueAndFeedbackStep");
const feedBackStep_1 = require("../../common/feedBackStep");
const updateAddressStep_1 = require("./UpdateAddress/updateAddressStep");
const updateMyPhoneStep_1 = require("./UpdatePhoneNumber/updateMyPhoneStep");
const i18nConfig_1 = __importDefault(require("../../locales/i18nConfig"));
const updateMyEmailStep_1 = require("./UpdateEmail/updateMyEmailStep");
const addressDetails_1 = require("./UpdateAddress/addressDetails");
const commonChoiceCheckStep_1 = require("../../common/commonChoiceCheckStep");
const TEXT_PROMPT = 'TEXT_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
exports.UPDATE_PROFILE_STEP = 'UPDATE_PROFILE_STEP';
const UPDATE_PROFILE_WATERFALL_STEP = 'UPDATE_PROFILE_WATERFALL_STEP';
// Define the main dialog and its related components.
class UpdateProfileStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.UPDATE_PROFILE_STEP);
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(TEXT_PROMPT))
            .addDialog(new updateMyPhoneStep_1.UpdateMyPhoneStep())
            .addDialog(new updateAddressStep_1.UpdateAddressStep())
            .addDialog(new updateMyEmailStep_1.UpdateMyEmailStep())
            .addDialog(new continueAndFeedbackStep_1.ContinueAndFeedbackStep())
            .addDialog(new botbuilder_dialogs_1.ChoicePrompt(CHOICE_PROMPT, this.CustomChoiceValidator))
            .addDialog(new botbuilder_dialogs_1.WaterfallDialog(UPDATE_PROFILE_WATERFALL_STEP, [
            this.checkProfileStep.bind(this),
            this.routingStep.bind(this)
        ]));
        this.initialDialogId = UPDATE_PROFILE_WATERFALL_STEP;
    }
    async CustomChoiceValidator(promptContext) {
        return true;
    }
    /**
     * Passing intents list related to UpdateMyProfile dialog.
     * Passing master error count to common choice dialog.
     * Passing current dialog name to common choice dialog.
     */
    async checkProfileStep(stepContext) {
        const commonPromptValidatorModel = new commonPromptValidatorModel_1.CommonPromptValidatorModel(['UpdateMyAddress', 'UpdateMyPhoneNumber', 'UpdateMyEmail'], Number(i18nConfig_1.default.__('MaxRetryCount')), 'UpdateMyProfile', i18nConfig_1.default.__('UpdateMyProfilePromptMessage'));
        // call dialog
        return await stepContext.beginDialog(commonChoiceCheckStep_1.COMMON_CHOICE_CHECK_STEP, commonPromptValidatorModel);
    }
    /**
     * Selection step in the waterfall.bot chooses the different flows depends on user's input
     * If users selects Update My Address then bot will navigate to the UpdateAddressDialog workflow
     * If users selects Update My Phone Number then bot will navigate to the UpdateMyPhoneDialog workflow
     * If users selects Update My Email then bot will navigate to the UpdateMyEmail workflow
     */
    async routingStep(stepContext) {
        const commonPromptValidatorModel = stepContext.result;
        if (commonPromptValidatorModel != null && commonPromptValidatorModel.status) {
            switch (commonPromptValidatorModel.result) {
                case 'UpdateMyAddress':
                    const addressDetails = new addressDetails_1.AddressDetails();
                    return await stepContext.replaceDialog(updateAddressStep_1.UPDATE_ADDRESS_STEP, addressDetails);
                case 'UpdateMyPhoneNumber':
                    return await stepContext.replaceDialog(updateMyPhoneStep_1.UPDATE_PHONE_NUMBER_STEP, updateMyPhoneStep_1.UpdateMyPhoneStep);
                case 'UpdateMyEmail':
                    return await stepContext.replaceDialog(updateMyEmailStep_1.UPDATE_EMAIL_STEP, updateMyEmailStep_1.UpdateMyEmailStep);
            }
        }
        else {
            return stepContext.replaceDialog(feedBackStep_1.FEED_BACK_STEP, feedBackStep_1.FeedBackStep);
        }
    }
}
exports.UpdateProfileStep = UpdateProfileStep;
//# sourceMappingURL=updateProfileStep.js.map