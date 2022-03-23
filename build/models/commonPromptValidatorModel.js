"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonPromptValidatorModel = void 0;
class CommonPromptValidatorModel {
    constructor(intents, maxRetryCount, promptCode, initialPrompt) {
        this.retryCount = 0;
        this.intents = intents;
        this.maxRetryCount = maxRetryCount !== null && maxRetryCount !== void 0 ? maxRetryCount : 2;
        this.promptCode = promptCode;
        this.initialPrompt = initialPrompt;
    }
}
exports.CommonPromptValidatorModel = CommonPromptValidatorModel;
//# sourceMappingURL=commonPromptValidatorModel.js.map