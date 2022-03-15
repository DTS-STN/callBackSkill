"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adaptiveCard = exports.addACard = void 0;
const botbuilder_1 = require("botbuilder");
__exportStar(require("./uiSchemaDirectDeposit"), exports);
__exportStar(require("./uiSchemaLookup"), exports);
__exportStar(require("./uiSchemaUtil"), exports);
// Helper function to attach adaptive card.
function addACard(schema) {
    let card;
    let message;
    card = botbuilder_1.CardFactory.adaptiveCard(schema);
    return (message = botbuilder_1.MessageFactory.attachment(card));
}
exports.addACard = addACard;
// Helper function to return an adaptive card.
function adaptiveCard(stepContext, card) {
    return stepContext.context.sendActivity(addACard(card));
}
exports.adaptiveCard = adaptiveCard;
//# sourceMappingURL=index.js.map