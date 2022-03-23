"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressAPI = void 0;
class AddressAPI {
    async getAddress(postalCode, langAPI, subscriptionKey) {
        const query = {
            AddressPostalCode: postalCode
        };
        const url = new URL(process.env.AddressAPIUrl);
        url.search = new URLSearchParams(query).toString();
        const headers = {
            'Ocp-Apim-Subscription-Key': subscriptionKey,
            'Accept-Language': langAPI
        };
        const response = await fetch(url.toString(), { headers });
        return await response.json();
    }
    ;
}
exports.AddressAPI = AddressAPI;
//# sourceMappingURL=addressAPI.js.map