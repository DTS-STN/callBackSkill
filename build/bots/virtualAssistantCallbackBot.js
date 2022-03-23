"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualAssistantCallbackBot = void 0;
const botbuilder_1 = require("botbuilder");
const mainDialog_1 = require("../dialogs/mainDialog");
class VirtualAssistantCallbackBot extends botbuilder_1.ActivityHandler {
    constructor(conversationState, userState, dialogSet) {
        super();
        if (!conversationState) {
            throw new Error("[DialogBot]: Missing parameter. conversationState is required");
        }
        if (!userState) {
            throw new Error("[DialogBot]: Missing parameter. userState is required");
        }
        if (!dialogSet) {
            throw new Error("[DialogBot]: Missing parameter. dialogSet is required");
        }
        // Initialise private members for the bot
        this.conversationState = conversationState;
        this.userState = userState;
        this.dialogSet = dialogSet;
        this.dialog = new mainDialog_1.MainDialog();
        this.dialogState = this.conversationState.createProperty("DialogState");
        // Add the main dialog to the dialog set for the bot
        this.onEvent(async (context, next) => {
            if (context.activity.name === "requestWelcomeDialog") {
                await context.sendActivity("Back Channel Welcome Message!");
            }
            await next();
        });
        this.onMembersAdded(async (context, next) => {
            console.log("MEMBER ADDED:Running dialog with Message Activity.");
            // Send greeting and then activate dialog
            // await context.sendActivity(`Hi Mary, I’m your virtual concierge!`);
            // Run the Dialog with the new message Activity.
            await this.dialog.run(context, this.dialogState);
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
        this.onMessage(async (context, next) => {
            console.log("Running dialog with Message Activity.");
            // Run the Dialog with the new message Activity.
            await this.dialog.run(context, this.dialogState);
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
    addDialogs() {
        const mainDialog = new mainDialog_1.MainDialog();
        this.dialogSet.add(mainDialog);
    }
    /**
     * Override the ActivityHandler.run() method to save state changes after the bot logic completes.
     */
    async run(context) {
        await super.run(context);
        // Save any state changes. The load happened during the execution of the Dialog.
        await this.userState.saveChanges(context, false);
        await this.conversationState.saveChanges(context, false);
    }
}
exports.VirtualAssistantCallbackBot = VirtualAssistantCallbackBot;
//# sourceMappingURL=virtualAssistantCallbackBot.js.map