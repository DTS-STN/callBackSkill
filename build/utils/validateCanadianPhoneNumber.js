"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function validatePhoneNumber(response) {
    const cleaned = ('' + response).replace(/\D/g, '');
    const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        const intlCode = (match[1] ? '+1 ' : '');
        return [intlCode, match[2], '-', match[3], '-', match[4]].join('');
    }
    return null;
}
exports.default = validatePhoneNumber;
//# sourceMappingURL=validateCanadianPhoneNumber.js.map