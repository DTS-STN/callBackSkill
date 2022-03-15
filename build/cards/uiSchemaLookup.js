"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupUpdateSchema = void 0;
const i18nConfig_1 = __importDefault(require("../dialogs/locales/i18nConfig"));
// In practice you'll probably get this from a service
exports.lookupUpdateSchema = (reason) => {
    return {
        '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
        'type': 'AdaptiveCard',
        'version': '1.0',
        'body': [
            {
                'type': 'TextBlock',
                'text': `${i18nConfig_1.default.__('unblock_lookup_update_msg')}`,
                'wrap': true,
                'fontType': 'default'
            },
            {
                'type': 'RichTextBlock',
                'wrap': true,
                'fontType': 'default',
                'inlines': [
                    {
                        'type': 'TextRun',
                        'text': `${i18nConfig_1.default.__('unblock_lookup_update_details')}`
                    },
                    {
                        'type': 'TextRun',
                        'text': ` ${reason}`,
                        'weight': 'bolder'
                    },
                    {
                        'type': 'TextRun',
                        'text': `.`
                    }
                ]
            }
        ]
    };
};
//# sourceMappingURL=uiSchemaLookup.js.map