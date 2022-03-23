"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAddressesStep = exports.GET_ADDRESS_STEP = void 0;
const botbuilder_ai_1 = require("botbuilder-ai");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const commonPromptValidatorModel_1 = require("../../../../models/commonPromptValidatorModel");
const addressAPI_1 = require("../../../../utils/addressAPI");
const i18nConfig_1 = __importDefault(require("../../../locales/i18nConfig"));
const alwaysOnBotRecognizer_1 = require("../../alwaysOnBotRecognizer");
const continueAndFeedbackStep_1 = require("../../../common/continueAndFeedbackStep");
const commonCallBackStep_1 = require("../commonCallBackStep");
const choiceCheckUpdateAddressStep_1 = require("./choiceCheckUpdateAddressStep");
const updateAddressStep_1 = require("./updateAddressStep");
const validateNumberStep_1 = require("./validateNumberStep");
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const TEXT_PROMPT = 'TEXT_PROMPT';
let fullAddress;
let isCallBackPassed = false;
exports.GET_ADDRESS_STEP = 'GET_ADDRESS_STEP';
const GET_ADDRESS_WATERFALL_STEP = 'GET_ADDRESS_WATERFALL_STEP';
// Define the main dialog and its related components.
class GetAddressesStep extends botbuilder_dialogs_1.ComponentDialog {
    constructor() {
        super(exports.GET_ADDRESS_STEP);
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(TEXT_PROMPT))
            .addDialog(new botbuilder_dialogs_1.ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new continueAndFeedbackStep_1.ContinueAndFeedbackStep())
            .addDialog(new choiceCheckUpdateAddressStep_1.ChoiceCheckUpdateAddressStep())
            .addDialog(new validateNumberStep_1.ValidateNumberStep())
            .addDialog(new commonCallBackStep_1.CommonCallBackStep())
            .addDialog(new botbuilder_dialogs_1.WaterfallDialog(GET_ADDRESS_WATERFALL_STEP, [
            this.initialStep.bind(this),
            this.continueStep.bind(this),
            this.checkSelectedAddressStep.bind(this),
            this.streetNameStep.bind(this),
            this.streetNumberStep.bind(this),
            this.streetAddressUnitStep.bind(this),
            this.finalStep.bind(this)
        ]));
        this.initialDialogId = GET_ADDRESS_WATERFALL_STEP;
    }
    async CustomChoiceValidator(promptContext) {
        return true;
    }
    /**
     * First step in the waterfall dialog. Prompts the user for enter the postal code of new address.
     */
    async initialStep(stepContext) {
        return await stepContext.prompt(TEXT_PROMPT, i18nConfig_1.default.__('updateAddressPostalCodePrompt'));
    }
    /**
     * Continue step in the waterfall.Once User Key-In the postal code then bot will try to get the full address from Address API
     * Call getAddress() Method to make a API call
     */
    async continueStep(stepContext) {
        const addressDetails = stepContext.options;
        addressDetails.PostalCode = stepContext.context.activity.text;
        addressDetails.masterError = false;
        addressDetails.currentStep = '';
        const addressAPI = new addressAPI_1.AddressAPI();
        let addressResults;
        const data = await addressAPI.getAddress(stepContext.context.activity.text, i18nConfig_1.default.__('APILanguage'), i18nConfig_1.default.__('subscriptionKey'));
        let addressMatches;
        try {
            addressResults = data['wsaddr:SearchResults'];
            const addressRecordInfo = addressResults['wsaddr:Information'];
            let isStreetNumberRequired = false;
            if (Number(addressRecordInfo['nc:MessageText']) > 1) {
                isStreetNumberRequired = true;
            }
            addressMatches = addressResults['wsaddr:AddressMatches'];
            const addressCategoryText = addressMatches[0]['nc:AddressCategoryText'];
            if (addressCategoryText === 'RuralLockBox') {
                const cityName = addressMatches[0]['nc:AddressCityName'];
                const province = addressMatches[0]['can:ProvinceCode'];
                const addressPostalCode = addressMatches[0]['nc:AddressPostalCode'];
                const streetMinText = addressMatches[0]['wsaddr:LockBoxNumberMinimumText'];
                const streetMaxText = addressMatches[0]['wsaddr:LockBoxNumberMaximumText'];
                const streetCategoryCode = addressMatches[0]['can:StreetCategoryCode'];
                const streetName = addressMatches[0]['nc:StreetName'];
                const deliveryInstallationDescritpion = addressMatches[0]['wsaddr:DeliveryInstallationDescription'];
                const deliveryInstallationQualifierName = addressMatches[0]['wsaddr:DeliveryInstallationQualifierName'];
                const deliveryInstallationAreaName = addressMatches[0]['wsaddr:DeliveryInstallationAreaName'];
                fullAddress = deliveryInstallationDescritpion + ' ' + deliveryInstallationQualifierName + ' ' + deliveryInstallationAreaName;
                addressDetails.FullAddress = this.getSentence(fullAddress) + ' ' + String(province).toUpperCase() + ' ' + String(addressDetails.PostalCode).toUpperCase();
                addressDetails.AddressType = 'PO BOX';
                addressDetails.promptMessage = i18nConfig_1.default.__('PoNumberPromptMessage');
                addressDetails.promptRetryMessage = i18nConfig_1.default.__('PoNumberPromptRetryMessage');
                return await stepContext.beginDialog(validateNumberStep_1.VALIDATE_NUMBER_STEP, addressDetails);
            }
            else {
                addressResults = data['wsaddr:SearchResults'];
                addressMatches = addressResults['wsaddr:AddressMatches'];
                const manyAddresses = new Array();
                if (isStreetNumberRequired) {
                    addressDetails.AddressType = 'MULTIPLE';
                    for (let i = 0; i < addressMatches.length; i++) {
                        fullAddress = this.getSentence(addressMatches[i]['nc:StreetName']) + ' ' + this.getSentence(addressMatches[i]['can:StreetCategoryCode']) + ' ' + this.getSentence(addressMatches[i]['nc:AddressCityName']) + ' ' + addressMatches[i]['can:ProvinceCode'] + ' ' + String(addressDetails.PostalCode).toUpperCase();
                        if (!manyAddresses.includes(fullAddress)) {
                            manyAddresses.push(fullAddress);
                        }
                    }
                    const promptmsg = i18nConfig_1.default.__('MoreStreetNumbersPrompt');
                    manyAddresses.push(i18nConfig_1.default.__('CannotFindMyAddress'));
                    if (manyAddresses.length > 4) {
                        addressDetails.manyAddresses = manyAddresses;
                        return await stepContext.next();
                    }
                    else {
                        return await stepContext.prompt(CHOICE_PROMPT, {
                            prompt: promptmsg,
                            choices: botbuilder_dialogs_1.ChoiceFactory.toChoices(manyAddresses),
                            style: botbuilder_dialogs_1.ListStyle.heroCard
                        });
                    }
                }
                else {
                    const cityName = addressMatches[0]['nc:AddressCityName'];
                    const province = addressMatches[0]['can:ProvinceCode'];
                    const addressPostalCode = addressMatches[0]['nc:AddressPostalCode'];
                    const streetMinText = addressMatches[0]['wsaddr:StreetNumberMinimumText'];
                    const streetMaxText = addressMatches[0]['wsaddr:StreetNumberMaximumText'];
                    const streetCategoryCode = addressMatches[0]['can:StreetCategoryCode'];
                    const streetName = addressMatches[0]['nc:StreetName'];
                    if (streetMinText === streetMaxText) {
                        fullAddress = streetMinText + ' ' + streetName + ' ' + streetCategoryCode + ' ' + cityName;
                    }
                    else {
                        fullAddress = streetName + ' ' + streetCategoryCode + ' ' + cityName;
                    }
                    addressDetails.FullAddress = this.getSentence(fullAddress) + ' ' + String(province).toUpperCase() + ' ' + String(addressDetails.PostalCode).toUpperCase();
                    addressDetails.AddressType = '';
                    if (streetMinText === streetMaxText) {
                        addressDetails.promptMessage = i18nConfig_1.default.__('UnitORApartmentPrompt');
                        addressDetails.promptRetryMessage = i18nConfig_1.default.__('UnitORApartmentRetryPrompt');
                        return await stepContext.beginDialog(validateNumberStep_1.VALIDATE_NUMBER_STEP, addressDetails);
                    }
                    else {
                        addressDetails.promptMessage = i18nConfig_1.default.__('NewStreetNumberPrompt');
                        addressDetails.promptRetryMessage = i18nConfig_1.default.__('NewStreetNumberRetryPrompt');
                        return await stepContext.beginDialog(validateNumberStep_1.VALIDATE_NUMBER_STEP, addressDetails);
                    }
                }
            }
        }
        catch (e) {
            addressDetails.errorCount.getAddressesStep++;
            addressDetails.masterError = true;
            return await stepContext.next();
        }
    }
    /**
     * Check selected address step in the waterfall.
     * if we found more than one street addresses then bot asks the street number to the user.
     * if any errors found in previous step bot repeats this step until it reaches the max error count
     */
    async checkSelectedAddressStep(stepContext) {
        const addressDetails = stepContext.options;
        if (addressDetails.AddressType === 'MULTIPLE') {
            addressDetails.currentStep = 'street number';
            if (addressDetails.manyAddresses === null) {
                addressDetails.FullAddress = stepContext.context.activity.text;
                if (stepContext.context.activity.text === i18nConfig_1.default.__('CannotFindMyAddress')) {
                    await stepContext.context.sendActivity(i18nConfig_1.default.__('StreetAddressNotFoundMessage'));
                    const commonPromptValidatorModel = new commonPromptValidatorModel_1.CommonPromptValidatorModel(['YesIWantToRequestCall', 'NoNotForNow'], Number(i18nConfig_1.default.__('MaxRetryCount')), 'StreetAddressNotFound', i18nConfig_1.default.__('StreetAddressNotFoundPromptMessage'));
                    return await stepContext.replaceDialog(commonCallBackStep_1.COMMON_CALL_BACK_STEP, commonPromptValidatorModel);
                }
                else {
                    addressDetails.promptMessage = i18nConfig_1.default.__('StreetNumbersPrompt');
                    addressDetails.promptRetryMessage = i18nConfig_1.default.__('NewStreetNumberRetryPrompt');
                    return await stepContext.beginDialog(validateNumberStep_1.VALIDATE_NUMBER_STEP, addressDetails);
                }
            }
            else {
                return await stepContext.prompt(TEXT_PROMPT, i18nConfig_1.default.__('StreetNamePromptMessage'));
            }
        }
        else if (addressDetails.masterError === true) {
            if (addressDetails.errorCount.getAddressesStep >= Number(i18nConfig_1.default.__('MaxRetryCount'))) {
                isCallBackPassed = true;
                const commonPromptValidatorModel = new commonPromptValidatorModel_1.CommonPromptValidatorModel(['YesIWantToRequestCall', 'NoNotForNow'], Number(i18nConfig_1.default.__('MaxRetryCount')), 'ServiceRepresentative', i18nConfig_1.default.__('ServiceRepresentativePromptMessage'));
                return await stepContext.replaceDialog(commonCallBackStep_1.COMMON_CALL_BACK_STEP, commonPromptValidatorModel);
            }
            else {
                await stepContext.context.sendActivity(i18nConfig_1.default.__('IncorrectPostalCodePrompt'));
                return await stepContext.beginDialog(exports.GET_ADDRESS_STEP, addressDetails);
            }
        }
        else {
            const getAddresses = stepContext.options;
            if (getAddresses.AddressType === 'PO BOX') {
                getAddresses.UnitNumber = 'PO BOX' + ' ' + stepContext.context.activity.text;
            }
            else {
                getAddresses.UnitNumber = stepContext.context.activity.text;
            }
            const promptMsg = this.getEditedResponse(i18nConfig_1.default.__('AddressFoundCheck'), getAddresses);
            const commonPromptValidatorModel = new commonPromptValidatorModel_1.CommonPromptValidatorModel(['promptConfirmYes', 'promptConfirmNo'], Number(i18nConfig_1.default.__('MaxRetryCount')), 'AddressFound', promptMsg);
            return await stepContext.beginDialog(choiceCheckUpdateAddressStep_1.CHOICE_CHECK_UPDATE_ADDRESS_STEP, commonPromptValidatorModel);
        }
    }
    async streetNameStep(stepContext) {
        const addressDetails = stepContext.options;
        if (addressDetails.manyAddresses === null) {
            return await stepContext.next();
        }
        else {
            const inputStreetName = stepContext.context.activity.text;
            const manyAddresses = addressDetails.manyAddresses;
            let outAddress = '';
            for (let i = 0; i < manyAddresses.length; i++) {
                const streetName = manyAddresses[i];
                if (this.getRemoveSpaceSentence(String(streetName)).includes(this.getRemoveSpaceSentence(String(inputStreetName)))) {
                    outAddress = manyAddresses[i];
                    break;
                }
            }
            if (outAddress === '') {
                await stepContext.context.sendActivity(i18nConfig_1.default.__('StreetAddressNotFoundMessage'));
                const commonPromptValidatorModel = new commonPromptValidatorModel_1.CommonPromptValidatorModel(['YesIWantToRequestCall', 'NoNotForNow'], Number(i18nConfig_1.default.__('MaxRetryCount')), 'StreetAddressNotFound', i18nConfig_1.default.__('StreetAddressNotFoundPromptMessage'));
                return await stepContext.replaceDialog(commonCallBackStep_1.COMMON_CALL_BACK_STEP, commonPromptValidatorModel);
            }
            else {
                addressDetails.FullAddress = outAddress;
                addressDetails.promptMessage = i18nConfig_1.default.__('StreetNumbersPrompt');
                addressDetails.promptRetryMessage = i18nConfig_1.default.__('NewStreetNumberRetryPrompt');
                return await stepContext.beginDialog(validateNumberStep_1.VALIDATE_NUMBER_STEP, addressDetails);
            }
        }
    }
    async streetNumberStep(stepContext) {
        const addressDetails = stepContext.options;
        if (addressDetails.errorCount.confirmEmailStep >= Number(i18nConfig_1.default.__('MaxRetryCount'))) {
            // Throw the master error flag
            if (!isCallBackPassed) {
                addressDetails.masterError = true;
                isCallBackPassed = true;
                const commonPromptValidatorModel = new commonPromptValidatorModel_1.CommonPromptValidatorModel(['YesIWantToRequestCall', 'NoNotForNow'], Number(i18nConfig_1.default.__('MaxRetryCount')), 'ServiceRepresentative', i18nConfig_1.default.__('ServiceRepresentativePromptMessage'));
                return await stepContext.replaceDialog(commonCallBackStep_1.COMMON_CALL_BACK_STEP, commonPromptValidatorModel);
            }
        }
        else {
            if (addressDetails.currentStep === 'street number') {
                addressDetails.FullAddress = stepContext.context.activity.text + ' ' + addressDetails.FullAddress;
                addressDetails.promptMessage = i18nConfig_1.default.__('UnitORApartmentPrompt');
                addressDetails.promptRetryMessage = i18nConfig_1.default.__('UnitORApartmentRetryPrompt');
                return await stepContext.beginDialog(validateNumberStep_1.VALIDATE_NUMBER_STEP, addressDetails);
            }
            else {
                return await stepContext.next();
            }
        }
    }
    async streetAddressUnitStep(stepContext) {
        const addressDetails = stepContext.options;
        if (addressDetails.currentStep === 'street number') {
            addressDetails.UnitNumber = stepContext.context.activity.text;
            const promptMsg = this.getEditedResponse(i18nConfig_1.default.__('AddressFoundCheck'), addressDetails);
            const commonPromptValidatorModel = new commonPromptValidatorModel_1.CommonPromptValidatorModel(['promptConfirmYes', 'promptConfirmNo'], Number(i18nConfig_1.default.__('MaxRetryCount')), 'AddressFound', promptMsg);
            return await stepContext.beginDialog(choiceCheckUpdateAddressStep_1.CHOICE_CHECK_UPDATE_ADDRESS_STEP, commonPromptValidatorModel);
        }
        else {
            return await stepContext.next();
        }
    }
    /**
     * This is the final step in the waterfall.
     * User selects the "Yes" prompt then navigate to the users"s continue and feedback flow.
     * User selects the "No" prompt then bot again calls the update address flow.
     */
    async finalStep(stepContext) {
        const addressDetails = stepContext.options;
        const recognizer = alwaysOnBotRecognizer_1.LUISAlwaysOnBotSetup(stepContext);
        const recognizerResult = await recognizer.recognize(stepContext.context);
        const intent = botbuilder_ai_1.LuisRecognizer.topIntent(recognizerResult, 'None', 0.5);
        switch (intent) {
            case 'promptConfirmYes':
                await stepContext.context.sendActivity(i18nConfig_1.default.__('UpdateAddress') + this.getEditedResponse(i18nConfig_1.default.__('FullAddress'), addressDetails));
                await stepContext.context.sendActivity(i18nConfig_1.default.__('UpdateAddressFinalMessage'));
                return await stepContext.replaceDialog(continueAndFeedbackStep_1.CONTINUE_AND_FEEDBACK_STEP, continueAndFeedbackStep_1.ContinueAndFeedbackStep);
            case 'promptConfirmNo':
                return await stepContext.replaceDialog(updateAddressStep_1.UPDATE_ADDRESS_STEP, addressDetails);
            default:
                if (!isCallBackPassed) {
                    const commonPromptValidatorModel = new commonPromptValidatorModel_1.CommonPromptValidatorModel(['YesIWantToRequestCall', 'NoNotForNow'], Number(i18nConfig_1.default.__('MaxRetryCount')), 'ServiceRepresentative', i18nConfig_1.default.__('ServiceRepresentativePromptMessage'));
                    return stepContext.replaceDialog(commonCallBackStep_1.COMMON_CALL_BACK_STEP, commonPromptValidatorModel);
                }
                else {
                    return stepContext.endDialog(this.id);
                }
        }
    }
    /**
     * This is GetEditResponce Method to create a Full address for the postal code.
     */
    getEditedResponse(response, postalCode) {
        if (postalCode.PostalCode != null) {
            response = response.replace('@Postal_Code', postalCode.FullAddress);
            response = response.replace('null', '').replace('Null', '').replace('Po', '');
            response = response.replace(',', ' ');
        }
        else {
            response = response.replace('@Postal_Code', '');
            response = response.replace('null', '');
            response = response.replace(',', ' ');
        }
        if (postalCode.UnitNumber != null) {
            response = response.replace('#Unit_Number', '#' + postalCode.UnitNumber);
        }
        else {
            response = response.replace('#Unit_Number', '');
        }
        return response;
    }
    /**
     * This is GetSentence Method to create a full address in sentence format.
     */
    getSentence(word) {
        const sentence = word.toLowerCase().split(' ');
        let outSentence = '';
        for (let i = 0; i < sentence.length; i++) {
            outSentence = outSentence + sentence[i][0].toUpperCase() + sentence[i].slice(1) + ' ';
        }
        return outSentence;
    }
    getRemoveSpaceSentence(word) {
        let sentence = word.toLowerCase();
        while (sentence.includes(' ')) {
            sentence = sentence.replace('  ', '');
            sentence = sentence.replace(' ', '');
        }
        return sentence;
    }
}
exports.GetAddressesStep = GetAddressesStep;
//# sourceMappingURL=getAddressesStep.js.map