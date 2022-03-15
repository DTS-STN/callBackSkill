"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoTextBlock = exports.TextBlockWithLink = exports.TextBlock = void 0;
// In practice you'll probably get this from a service
exports.TextBlock = (text) => {
    return {
        '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
        'type': 'AdaptiveCard',
        'version': '1.0',
        'body': [
            {
                'type': 'TextBlock',
                'text': `${text}`,
                'wrap': true,
                'fontType': 'default'
            }
        ]
    };
};
exports.TextBlockWithLink = (text, link, linkText) => {
    return {
        '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
        'type': 'AdaptiveCard',
        'version': '1.0',
        'body': [
            {
                'type': 'TextBlock',
                'text': `${text}`,
                'wrap': true
            }
        ],
        'actions': [
            {
                'type': 'Action.OpenUrl',
                'title': `${linkText}`,
                'url': `${link}`,
                'spacing': 'medium',
                'style': 'positive',
                'wrap': true
            }
        ]
    };
};
exports.TwoTextBlock = (one, two) => {
    return {
        '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
        'type': 'AdaptiveCard',
        'version': '1.0',
        'body': [
            {
                'type': 'TextBlock',
                'text': `${one}`,
                'wrap': true
            },
            {
                'spacing': 'medium',
                'type': 'TextBlock',
                'text': `${two}`,
                'wrap': true
            }
        ]
    };
};
//# sourceMappingURL=uiSchemaUtil.js.map