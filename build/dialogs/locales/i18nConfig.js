"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLocale = void 0;
const { I18n } = require('i18n');
const path_1 = require("path");
// Initialise the local
// Configure i18n
const i18n = new I18n();
i18n.configure({
    locales: ['en', 'fr'],
    directory: path_1.join(__dirname),
    defaultLocale: 'en'
});
exports.setLocale = (locale) => {
    console.log('language/locale: ', locale);
    if (locale) {
        if (locale.toLowerCase() === 'fr-ca' ||
            locale.toLowerCase() === 'fr-fr' ||
            locale.toLowerCase() === 'fr') {
            i18n.setLocale('fr');
        }
        else {
            i18n.setLocale('en');
        }
    }
};
exports.default = i18n;
//# sourceMappingURL=i18nConfig.js.map