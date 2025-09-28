interface CardDetails {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
}
interface CardDetailsFormProps {
    cardDetails: CardDetails;
    onCardDetailsChange: (details: CardDetails) => void;
    onGoBack: () => void;
    onSubmit: () => void;
    isValid: boolean;
}
export default function CardDetailsForm({ cardDetails, onCardDetailsChange, onGoBack, onSubmit, isValid }: CardDetailsFormProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=CardDetailsForm.d.ts.map