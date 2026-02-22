import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Wallet, Banknote, Smartphone, Check, Loader2 } from 'lucide-react';

interface PaymentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (method: string) => void;
    amount: number;
    isSubmitting?: boolean;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({ isOpen, onClose, onConfirm, amount, isSubmitting }) => {
    const [selectedMethod, setSelectedMethod] = React.useState('upi');

    const methods = [
        { id: 'razorpay', label: 'Razorpay / Card', icon: CreditCard, color: 'text-blue-500', desc: 'Secure online payment' },
        { id: 'upi', label: 'UPI (GPay / PhonePe)', icon: Smartphone, color: 'text-purple-500', desc: 'Scan or use UPI ID' },
        { id: 'cash', label: 'Cash on Delivery', icon: Banknote, color: 'text-green-500', desc: 'Pay when fuel arrives' },
        { id: 'netbanking', label: 'Credit / Debit Card', icon: Wallet, color: 'text-orange-500', desc: 'Direct bank payment' },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
            <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Select Payment Mode</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Choose how you'd like to pay for your fuel order of <span className="text-orange-500 font-bold">₹{amount.toFixed(2)}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    <RadioGroup
                        value={selectedMethod}
                        onValueChange={setSelectedMethod}
                        className="grid grid-cols-1 gap-3"
                        disabled={isSubmitting}
                    >
                        {methods.map((method) => (
                            <div key={method.id}>
                                <RadioGroupItem
                                    value={method.id}
                                    id={method.id}
                                    className="peer sr-only"
                                />
                                <Label
                                    htmlFor={method.id}
                                    className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${selectedMethod === method.id
                                        ? 'border-orange-500 bg-orange-500/5 ring-1 ring-orange-500'
                                        : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900'
                                        }`}
                                >
                                    <div className={`p-2 rounded-md bg-slate-800 ${method.color}`}>
                                        <method.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">{method.label}</p>
                                        <p className="text-xs text-gray-500">{method.desc}</p>
                                    </div>
                                    {selectedMethod === method.id && (
                                        <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center animate-in zoom-in duration-300">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-gray-400 hover:text-white hover:bg-slate-900"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onConfirm(selectedMethod)}
                        disabled={isSubmitting}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold h-12"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                            'Confirm Order'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentDialog;
