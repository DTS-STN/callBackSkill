"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainDialog = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const i18nConfig_1 = __importDefault(require("./locales/i18nConfig"));
const unblockBotDialog_1 = require("./unblockDialogs/unblockBotDialog");
const callbackBotDetails_1 = require("./callbackDialogs/callbackBotDetails");
const callbackBotDialog_1 = require("./callbackDialogs/callbackBotDialog");
const CHOICE_PROMPT = 'CHOICE_PROMPT';
// The String ID name for the main dialog
const MAIN_DIALOG = 'MAIN_DIALOG';
// The String ID of the waterfall dialog that exists in the main dialog
const MAIN_WATERFALL_DIALOG = 'MAIN_WATERFALL_DIALOG';
class MainDialog extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(MAIN_DIALOG);
        // Add the unblockBot dialog to the dialog
        this.addDialog(new callbackBotDialog_1.CallbackBotDialog());
        this.addDialog(new unblockBotDialog_1.UnblockBotDialog());
        this.addDialog(new botbuilder_dialogs_1.ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(MAIN_WATERFALL_DIALOG, [
            this.initialStep.bind(this),
            this.rateStep.bind(this),
            this.finalStep.bind(this)
        ]));
        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }
    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new botbuilder_dialogs_1.DialogSet(accessor);
        dialogSet.add(this);
        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === botbuilder_dialogs_1.DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }
    /**
     * Initial step in the waterfall. This will kick of the callbackBot dialog
     */
    async initialStep(stepContext) {
        // Here we are start the unblock dialog in the prototype,
        // in the real case, the callback flow will trigger from unblock bot, which
        // should run in a different instance
        const callbackBotDetails = new callbackBotDetails_1.CallbackBotDetails();
        return await stepContext.beginDialog(callbackBotDialog_1.CALLBACK_BOT_DIALOG, callbackBotDetails);
    }
    /**
     * Rate step in the waterfall.
     * ask users to review the user experience for future improvement
     */
    async rateStep(stepContext) {
        const feedbackMsg = i18nConfig_1.default.__('mainDialogFeedbackMsg');
        // Running a prompt here means the next WaterfallStep will be run when the user's response is received.
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: feedbackMsg,
            choices: botbuilder_dialogs_1.ChoiceFactory.toChoices(['1 = 😡', '2 = 🙁', '3 = 😐', '4 = 🙂', '5 = 😄'])
        });
    }
    /**
     * This is the final step in the main waterfall dialog.
     */
    async finalStep(stepContext) {
        const greatDayMsg = i18nConfig_1.default.__('mainDialogGreatDayMsg');
        await stepContext.context.sendActivity(greatDayMsg);
        // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is the end.
        return await stepContext.endDialog();
    }
}
exports.MainDialog = MainDialog;
//# sourceMappingURL=mainDialog.js.map