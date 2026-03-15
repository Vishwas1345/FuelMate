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
            <DialogContent className="bg-[#0a101f] border-slate-800/60 text-white max-w-[95vw] md:max-w-md rounded-2xl shadow-2xl overflow-hidden p-0 gap-0">
                <DialogHeader className="p-6 border-b border-slate-800/50 bg-[#020817]/30">
                    <DialogTitle className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                        <Smartphone className="w-4 h-4 text-[#f97316]" />
                        Transaction Protocol
                    </DialogTitle>
                    <DialogDescription className="text-[11px] text-slate-500 font-medium">
                        Secure authorization for total manifest value: <span className="text-white font-bold tracking-tight ml-1">₹{amount.toFixed(2)}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-4">
                    <RadioGroup
                        value={selectedMethod}
                        onValueChange={setSelectedMethod}
                        className="grid grid-cols-1 gap-3"
                        disabled={isSubmitting}
                    >
                        {methods.map((method) => (
                            <div key={method.id} className="relative">
                                <RadioGroupItem
                                    value={method.id}
                                    id={method.id}
                                    className="peer sr-only"
                                />
                                <Label
                                    htmlFor={method.id}
                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                                        selectedMethod === method.id
                                            ? 'border-[#f97316] bg-[#f97316]/5 shadow-lg shadow-orange-500/10'
                                            : 'border-slate-800/40 bg-[#020817] hover:border-slate-700/60 hover:bg-[#020817]/80'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-inner border transition-all duration-300 ${
                                        selectedMethod === method.id 
                                            ? 'bg-[#f97316]/20 border-[#f97316]/30' 
                                            : 'bg-[#0a101f] border-slate-800 group-hover:bg-slate-800/50'
                                    }`}>
                                        <method.icon className={`w-5 h-5 ${selectedMethod === method.id ? 'text-[#f97316]' : 'text-slate-500'}`} />
                                    </div>
                                    <div className="flex-1 space-y-0.5">
                                        <p className={`text-xs font-bold uppercase tracking-widest ${selectedMethod === method.id ? 'text-white' : 'text-slate-400'}`}>
                                            {method.label}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-medium opacity-80">{method.desc}</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                        selectedMethod === method.id 
                                            ? 'bg-[#f97316] border-[#f97316] scale-100' 
                                            : 'border-slate-800 scale-90 group-hover:border-slate-700'
                                    }`}>
                                        {selectedMethod === method.id && (
                                            <Check className="w-3 h-3 text-white stroke-[4px]" />
                                        )}
                                    </div>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                <DialogFooter className="p-6 bg-[#020817]/20 border-t border-slate-800/50 flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white hover:bg-slate-800/30 transition-all h-11 px-6"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onConfirm(selectedMethod)}
                        disabled={isSubmitting}
                        className="flex-1 bg-[#f97316] hover:bg-[#f97316]/90 text-white text-[10px] font-bold uppercase tracking-widest h-11 px-8 shadow-lg shadow-orange-500/20 border-none transition-all hover:scale-[1.02] active:scale-95"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>Authorize Protocol <Check className="w-3.5 h-3.5 ml-2" /></>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentDialog;
