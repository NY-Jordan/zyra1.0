import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '@zyra/ui/components/button';
import { Input } from '@zyra/ui/components/input';
export default function CardDetailsForm({ cardDetails, onCardDetailsChange, onGoBack, onSubmit, isValid }) {
    // Formater le numéro de carte
    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        }
        else {
            return v;
        }
    };
    // Formater la date d'expiration
    const formatExpiryDate = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
        }
        return v;
    };
    const handleCardNumberChange = (value) => {
        onCardDetailsChange({
            ...cardDetails,
            cardNumber: formatCardNumber(value)
        });
    };
    const handleExpiryDateChange = (value) => {
        onCardDetailsChange({
            ...cardDetails,
            expiryDate: formatExpiryDate(value)
        });
    };
    const handleCvvChange = (value) => {
        onCardDetailsChange({
            ...cardDetails,
            cvv: value.replace(/\D/g, '')
        });
    };
    const handleCardholderNameChange = (value) => {
        onCardDetailsChange({
            ...cardDetails,
            cardholderName: value
        });
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800", children: "Informations de la carte" }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Vos donn\u00E9es sont s\u00E9curis\u00E9es et chiffr\u00E9es" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Nom du titulaire" }), _jsx(Input, { type: "text", placeholder: "Jean Dupont", value: cardDetails.cardholderName, onChange: (e) => handleCardholderNameChange(e.target.value), className: "w-full p-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Num\u00E9ro de carte" }), _jsx(Input, { type: "text", placeholder: "1234 5678 9012 3456", value: cardDetails.cardNumber, onChange: (e) => handleCardNumberChange(e.target.value), className: "w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono", maxLength: 19 })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Date d'expiration" }), _jsx(Input, { type: "text", placeholder: "MM/YY", value: cardDetails.expiryDate, onChange: (e) => handleExpiryDateChange(e.target.value), className: "w-full p-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono", maxLength: 5 })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "CVV" }), _jsx(Input, { type: "text", placeholder: "123", value: cardDetails.cvv, onChange: (e) => handleCvvChange(e.target.value), className: "w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono", maxLength: 4 })] })] })] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx(Button, { variant: "outline", onClick: onGoBack, className: "flex-1 py-3 border hover:cursor-pointer hover:text-black text-black border-gray-300 hover:bg-gray-400", children: "Retour" }), _jsx(Button, { onClick: onSubmit, disabled: !isValid, className: "flex-1 py-3  bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold shadow-lg disabled:shadow-none", children: "\uD83D\uDCB3 Payer" })] })] }));
}
