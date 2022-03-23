"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressDetails = void 0;
class AddressDetails {
    constructor() {
        this.masterError = null;
        this.PostalCode = null;
        this.UnitNumber = null;
        this.FullAddress = null;
        this.AddressType = null;
        this.currentStep = null;
        this.maxCount = 3;
        this.currentCount = 0;
        this.getAddressesStep = null;
        this.updateAddressStep = null;
        this.manyAddresses = null;
        this.numberValidationStep = null;
        this.promptMessage = null;
        this.promptRetryMessage = null;
        // State machine that stores the error counts of each step
        this.errorCount = {
            getAddressesStep: 0,
            updateAddressStep: -1,
            numberValidationStep: 0
        };
    }
}
exports.AddressDetails = AddressDetails;
//# sourceMappingURL=addressDetails.js.map