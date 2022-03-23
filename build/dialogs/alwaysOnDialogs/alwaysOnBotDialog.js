"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlwaysOnBotDialog = exports.ALWAYS_ON_BOT_DIALOG = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const commonPromptValidatorModel_1 = require("../../models/commonPromptValidatorModel");
const feedBackStep_1 = require("../common/feedBackStep");
const oASBenefitStep_1 = require("./OASBenefit/oASBenefitStep");
const updateProfileStep_1 = require("./UpdateProfile/updateProfileStep");
const i18nConfig_1 = __importDefault(require("../locales/i18nConfig"));
const commonChoiceCheckStep_1 = require("../common/commonChoiceCheckStep");
const TEXT_PROMPT = 'TEXT_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const ALWAYS_ON_BOT_WATERFALL_DIALOG = 'ALWAYS_ON_BOT_WATERFALL_DIALOG';
exports.ALWAYS_ON_BOT_DIALOG = 'ALWAYS_ON_BOT_DIALOG';
class AlwaysOnBotDialog extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.ALWAYS_ON_BOT_DIALOG);
        if (!updateProfileStep_1.UpdateProfileStep)
            throw new Error('[MainDialog]: Missing parameter "updateProfileDialog" is required');
        // Define the main dialog and its related components.
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(TEXT_PROMPT));
        this.addDialog(new updateProfileStep_1.UpdateProfileStep());
        this.addDialog(new feedBackStep_1.FeedBackStep());
        this.addDialog(new commonChoiceCheckStep_1.CommonChoiceCheckStep());
        this.addDialog(new oASBenefitStep_1.OASBenefitStep());
        this.addDialog(new botbuilder_dialogs_1.ChoicePrompt(CHOICE_PROMPT, this.CustomChoiceValidator));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(ALWAYS_ON_BOT_WATERFALL_DIALOG, [
            this.introStep.bind(this),
            this.actStep.bind(this)
        ]));
        this.initialDialogId = ALWAYS_ON_BOT_WATERFALL_DIALOG;
    }
    /**
     * The run method handles the incoming activity (in the form of a DialogContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {TurnContext} context
     */
    async run(context, accessor) {
        const dialogSet = new botbuilder_dialogs_1.DialogSet(accessor);
        dialogSet.add(this);
        const dialogContext = await dialogSet.createContext(context);
        const results = await dialogContext.continueDialog();
        if (results.status === botbuilder_dialogs_1.DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }
    /**
     * First step in the waterfall dialog. Prompts the user for a command.
     */
    // validates all the prompts
    async CustomChoiceValidator(promptContext) {
        return true;
    }
    /**
     * Passing intents list related to main dialog.
     * Passing master error count to common choice dialog.
     * Passing current dialog name to common choice dialog.
     */
    async introStep(stepContext) {
        const commonPromptValidatorModel = new commonPromptValidatorModel_1.CommonPromptValidatorModel(['IWantToUpdateMyPersonalInformation', 'IHaveQuestionAboutOASPension'], Number(i18nConfig_1.default.__('MaxRetryCount')), 'AlwaysOnBot', i18nConfig_1.default.__('AlwaysOnBotPromptMessage'));
        // call dialog
        return await stepContext.beginDialog(commonChoiceCheckStep_1.COMMON_CHOICE_CHECK_STEP, commonPromptValidatorModel);
    }
    /**
     * This is the final step in waterfall.bot displays the main workflow prompt suggestions to the user.(I Want To Update My Personal Information and I Have a Question About OASPension)
     */
    async actStep(stepContext) {
        const commonPromptValidatorModel = stepContext.result;
        if (commonPromptValidatorModel != null && commonPromptValidatorModel.status) {
            switch (commonPromptValidatorModel.result) {
                case 'IWantToUpdateMyPersonalInformation':
                    return await stepContext.replaceDialog(updateProfileStep_1.UPDATE_PROFILE_STEP, updateProfileStep_1.UpdateProfileStep);
                case 'IHaveQuestionAboutOASPension':
                    return await stepContext.replaceDialog(oASBenefitStep_1.OAS_BENEFIT_STEP, oASBenefitStep_1.OASBenefitStep);
            }
        }
        else {
            return stepContext.replaceDialog(feedBackStep_1.FEED_BACK_STEP, feedBackStep_1.FeedBackStep);
        }
    }
}
exports.AlwaysOnBotDialog = AlwaysOnBotDialog;
//# sourceMappingURL=alwaysOnBotDialog.js.map