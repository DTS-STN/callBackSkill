"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.howToFindNumbersSchema = exports.whatNumbersToFindSchema = void 0;
const i18nConfig_1 = __importDefault(require("../dialogs/locales/i18nConfig"));
// In practice you'll probably get this from a service
exports.whatNumbersToFindSchema = () => {
    return {
        '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
        'type': 'AdaptiveCard',
        'version': '1.0',
        'body': [
            {
                'type': 'TextBlock',
                'text': `${i18nConfig_1.default.__('unblock_direct_deposit_msg')}`,
                'wrap': true,
                'fontType': 'default'
            },
            { 'type': 'FactSet',
                'facts': [
                    {
                        'title': '1',
                        'value': `${i18nConfig_1.default.__('unblock_direct_deposit_transit_name')}`
                    },
                    {
                        'title': '2',
                        'value': `${i18nConfig_1.default.__('unblock_direct_deposit_institution_name')}`
                    },
                    {
                        'title': '3',
                        'value': `${i18nConfig_1.default.__('unblock_direct_deposit_account_name')}`
                    }
                ]
            }
        ]
    };
};
exports.howToFindNumbersSchema = () => {
    return {
        '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
        'type': 'AdaptiveCard',
        'version': '1.0',
        'body': [
            {
                'type': 'TextBlock',
                'text': `${i18nConfig_1.default.__('unblock_direct_deposit_how_to_cheques')}`,
                'wrap': true
            },
            {
                'type': 'TextBlock',
                'text': `${i18nConfig_1.default.__('unblock_direct_deposit_how_to_bank')}`,
                'wrap': true
            },
            {
                'type': 'Image',
                'url': `${i18nConfig_1.default.__('unblock_direct_deposit_cheque_path')}`,
                'altText': `${i18nConfig_1.default.__('unblock_direct_deposit_cheque_altText')}`
            }
        ]
    };
};
//# sourceMappingURL=uiSchemaDirectDeposit.js.map