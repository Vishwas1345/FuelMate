
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { User as UserIcon, Store, Upload, ArrowRight, Loader2, ArrowLeft, Check, Navigation, Car, Calendar, Phone, MapPin, X, ZoomIn, ZoomOut } from 'lucide-react';
import { LogoIcon } from '@/components/Logo';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import getCroppedImg from '@/lib/canvasUtils';

export default function Onboarding() {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();

    // Step Management
    const [step, setStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isLocationLoading, setIsLocationLoading] = useState(false);
    const [role, setRole] = useState<'customer' | 'station'>('customer');

    const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | null>(null);

    // Image Upload & Crop State
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<{
        name: string;
        phone: string;
        dob: string;
        gender: string;
        vehicles: { type: string; model: string; plateNumber: string; }[];
        avatar: string; // Base64 string
        addresses: { label: string; addressLine: string; landmark?: string; city: string; state: string; country: string; zipCode: string; }[];
        businessName: string;
        businessPhone: string;
        gstNumber: string;
        fuelProvider: string;
        pumpLocation: { addressLine: string; city: string; state: string; country: string; zipCode: string; coordinates: { lat: number; lng: number } };
        trucksNeeded: number;
        driversNeeded: number;
    }>({
        name: '',
        phone: '',
        dob: '',
        gender: '',
        vehicles: [{ type: 'car', model: '', plateNumber: '' }],
        avatar: '',
        addresses: [
            { label: 'home', addressLine: '', landmark: '', city: '', state: '', country: '', zipCode: '' }
        ],
        businessName: '',
        businessPhone: '',
        gstNumber: '',
        fuelProvider: '',
        pumpLocation: { addressLine: '', city: '', state: '', country: '', zipCode: '', coordinates: { lat: 0, lng: 0 } },
        trucksNeeded: 0,
        driversNeeded: 0
    });

    useEffect(() => {
        if (user) {
            setRole((user.role as 'customer' | 'station') || 'customer');
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                phone: user.phone || '',
                dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
                gender: user.gender || '',
                vehicles: user.vehicles && user.vehicles.length > 0 ? user.vehicles : prev.vehicles,
                avatar: user.avatar || '',
                addresses: user.addresses?.length ? user.addresses : prev.addresses,
                businessName: user.businessName || '',
                businessPhone: user.businessPhone || '',
                fuelProvider: user.fuelProvider || '',
                pumpLocation: (user.pumpLocation && typeof user.pumpLocation === 'object') ? { ...user.pumpLocation, coordinates: user.pumpLocation.coordinates || { lat: 0, lng: 0 } } : prev.pumpLocation,
                trucksNeeded: user.trucksNeeded || 0,
                driversNeeded: user.driversNeeded || 0
            }));
        }
    }, [user]);

    const handleRoleSelect = (selectedRole: 'customer' | 'station') => {
        setRole(selectedRole);
        setStep(1);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressChange = (index: number, field: string, value: string) => {
        const newAddresses = [...formData.addresses];
        newAddresses[index] = { ...newAddresses[index], [field]: value };
        setFormData(prev => ({ ...prev, addresses: newAddresses }));
    };

    const handleVehicleChange = (index: number, field: string, value: string) => {
        const newVehicles = [...formData.vehicles];
        newVehicles[index] = { ...newVehicles[index], [field]: value };
        setFormData(prev => ({ ...prev, vehicles: newVehicles }));
    };

    // --- Image Upload Logic ---
    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

            if (file.size > MAX_FILE_SIZE) {
                toast.error("Image is too large. Please upload an image smaller than 5MB.");
                e.target.value = ''; // Reset input
                return;
            }

            const imageDataUrl = await readFile(file);
            setImageSrc(imageDataUrl as string);
            setIsCropDialogOpen(true);
            // Reset input so same file can be selected again if needed
            e.target.value = '';
        }
    };

    const readFile = (file: File) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => resolve(reader.result), false);
            reader.readAsDataURL(file);
        });
    };

    const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const showCroppedImage = async () => {
        try {
            if (!imageSrc || !croppedAreaPixels) return;
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            setFormData(prev => ({ ...prev, avatar: croppedImage }));
            setIsCropDialogOpen(false);
            setImageSrc(null); // Cleanup
        } catch (e) {
            console.error(e);
            toast.error("Failed to crop image");
        }
    };
    // --------------------------

    const handleSkip = async () => {
        setIsLoading(true);
        try {
            await updateProfile({
                role,
                isProfileComplete: true
            });
            toast.success("Profile setup skipped for now!");
            navigate(role === 'customer' ? '/customer' : '/station');
        } catch (error: any) {
            toast.error("Failed to skip");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setIsLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setCoordinates({ lat: latitude, lng: longitude });

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                        { headers: { 'User-Agent': 'FuelMate/1.0' } }
                    );

                    if (!response.ok) {
                        throw new Error("Failed to fetch address details");
                    }

                    const data = await response.json();
                    const address = data.address;

                    let detectedCity = address.city || address.town || address.village;

                    if (!detectedCity) {
                        if (address.state_district) {
                            detectedCity = address.state_district.replace(/\bDistrict\b/gi, '').trim();
                        } else if (address.county) {
                            detectedCity = address.county.replace(/\bTaluka\b/gi, '').replace(/\bDistrict\b/gi, '').trim();
                        } else if (address.municipality) {
                            detectedCity = address.municipality.replace(/\bMunicipality\b/gi, '').trim();
                        }
                    }
                    const detectedState = address.state || "";
                    const detectedCountry = address.country || "";
                    const detectedZip = address.postcode || "";
                    const formattedAddress = data.display_name;

                    if (role === 'customer') {
                        const newAddresses = [...formData.addresses];
                        newAddresses[0] = {
                            ...newAddresses[0],
                            city: detectedCity,
                            state: detectedState,
                            country: detectedCountry,
                            zipCode: detectedZip
                        };
                        setFormData(prev => ({ ...prev, addresses: newAddresses }));
                    } else {
                        setFormData(prev => ({
                            ...prev,
                            pumpLocation: {
                                addressLine: '',
                                city: detectedCity || '',
                                state: detectedState,
                                country: detectedCountry,
                                zipCode: detectedZip,
                                coordinates: { lat: latitude, lng: longitude }
                            }
                        }));
                    }

                    setIsLocationLoading(false);
                    toast.success("Location details fetched successfully!");
                } catch (error) {
                    console.error("Geocoding error:", error);
                    setIsLocationLoading(false);
                    toast.error("Could not fetch address details. Please enter manually.");
                }
            },
            (error) => {
                setIsLocationLoading(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        toast.error("Location permission denied.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        toast.error("Location information is unavailable.");
                        break;
                    case error.TIMEOUT:
                        toast.error("The request to get user location timed out.");
                        break;
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleNext = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (role === 'customer') {
            if (step === 1) {
                if (!formData.name || !formData.phone) {
                    toast.error("Please enter your name and phone number");
                    return;
                }
                setStep(2);
            } else if (step === 2) {
                const addr = formData.addresses[0];
                if (!addr.city || !addr.zipCode || !addr.addressLine) {
                    toast.error("Please provide complete address details");
                    return;
                }
                setStep(3);
            } else if (step === 3) {
                handleSubmit();
            }
        } else {
            if (step === 1) {
                if (!formData.businessName || !formData.businessPhone || !formData.fuelProvider) {
                    toast.error("Please fill in all business details");
                    return;
                }
                setStep(2);
            } else if (step === 2) {
                if (!formData.pumpLocation) {
                    toast.error("Please provide the pump location");
                    return;
                }
                setStep(3);
            } else if (step === 3) {
                handleSubmit();
            }
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const updateData: any = {
                role,
                isProfileComplete: true,
                name: formData.name,
                phone: formData.phone,
                avatar: formData.avatar
            };

            if (role === 'customer') {
                updateData.addresses = formData.addresses;
                updateData.dob = formData.dob;
                updateData.gender = formData.gender;
                updateData.vehicles = formData.vehicles;
            } else {
                updateData.businessName = formData.businessName;
                updateData.businessPhone = formData.businessPhone;
                updateData.fuelProvider = formData.fuelProvider;
                updateData.pumpLocation = formData.pumpLocation;
                updateData.trucksNeeded = Number(formData.trucksNeeded);
                updateData.driversNeeded = Number(formData.driversNeeded);

                if (!formData.avatar && formData.fuelProvider) {
                    updateData.avatar = `https://ui-avatars.com/api/?name=${formData.fuelProvider}&background=random`;
                }
            }

            await updateProfile(updateData);
            toast.success("Profile setup complete!");
            navigate(role === 'customer' ? '/customer' : '/station');
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const renderStepIndicator = () => {
        const totalSteps = 3;
        const currentStepIdx = step - 1;
        return (
            <div className="flex justify-center gap-2 mb-6">
                {Array.from({ length: totalSteps }).map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-2 rounded-full transition-all duration-300 ${idx === currentStepIdx ? 'w-8 bg-orange-500' : 'w-2 bg-slate-800'
                            } ${idx < currentStepIdx ? 'bg-orange-500/50' : ''}`}
                    />
                ))}
            </div>
        );
    };

    const renderMap = () => {
        let mapSrc = "";
        if (coordinates) {
            mapSrc = `https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=15&output=embed`;
        } else if (role === 'customer' && formData.addresses[0].city) {
            mapSrc = `https://maps.google.com/maps?q=${formData.addresses[0].city},${formData.addresses[0].country}&z=12&output=embed`;
        } else if (role === 'station' && formData.pumpLocation.city) {
            mapSrc = `https://maps.google.com/maps?q=${formData.pumpLocation.city},${formData.pumpLocation.country}&z=12&output=embed`;
        } else {
            mapSrc = `https://maps.google.com/maps?q=India&z=4&output=embed`;
        }

        return (
            <div className="w-full h-40 rounded-lg overflow-hidden border border-slate-700 mt-4 relative bg-slate-800 shadow-inner">
                {(!coordinates && !formData.addresses[0].city) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 p-4 text-center backdrop-blur-sm">
                        <p className="text-sm text-slate-300 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-orange-500" />
                            Detect location to see map
                        </p>
                    </div>
                )}
                <iframe
                    title="Location Map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={mapSrc}
                    allowFullScreen
                />
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-slate-200">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            </div>

            <Card className="w-full max-w-2xl bg-slate-900/80 backdrop-blur-xl border-slate-800 shadow-xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
                <CardHeader className="text-center relative">
                    <div className="flex justify-between items-center absolute w-full top-6 left-0 px-6">
                        {step > 0 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleBack}
                                className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        )}

                        {step > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSkip}
                                className="ml-auto text-slate-400 hover:text-orange-400 hover:bg-transparent"
                            >
                                Skip for now <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                        )}
                    </div>

                    <div className="flex justify-center mb-2 mt-8">
                        <div className="p-3 bg-slate-800 rounded-full ring-1 ring-slate-700">
                            <LogoIcon className="w-8 h-8 text-orange-500" />
                        </div>
                    </div>

                    <CardTitle className="text-2xl font-bold text-white mt-4">
                        {step === 0 && "Welcome to FuelMate!"}
                        {role === 'customer' && (step === 1 ? 'Personal Details' : step === 2 ? 'Delivery Location' : 'Profile Picture')}
                        {role === 'station' && (step === 1 ? 'Business Details' : step === 2 ? 'Station Location' : 'Operational Capacity')}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        {step === 0 && "How do you plan to use FuelMate today?"}
                        {role === 'customer' && step === 1 && "Start by adding your personal and vehicle details."}
                        {role === 'customer' && step === 2 && "Precise location ensures on-time delivery."}
                        {role === 'customer' && step === 3 && "Adding a photo makes you recognizable."}
                        {/* ... station descriptions ... */}
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-6 md:p-8">
                    {step > 0 && renderStepIndicator()}

                    {/* Step 0: Role Selection */}
                    {step === 0 && (
                        <div className="grid md:grid-cols-2 gap-6 mt-4">
                            <div
                                className="group relative cursor-pointer border border-slate-800 rounded-xl p-6 hover:border-orange-500/50 hover:bg-slate-800/50 transition-all duration-300 flex flex-col items-center text-center gap-4"
                                onClick={() => handleRoleSelect('customer')}
                            >
                                <div className="w-20 h-20 rounded-full bg-blue-900/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-all duration-300">
                                    <UserIcon size={40} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">I need fuel delivery</h3>
                                    <p className="text-sm text-slate-500 group-hover:text-slate-400">For personal or business vehicles.</p>
                                </div>
                            </div>

                            <div
                                className="group relative cursor-pointer border border-slate-800 rounded-xl p-6 hover:border-orange-500/50 hover:bg-slate-800/50 transition-all duration-300 flex flex-col items-center text-center gap-4"
                                onClick={() => handleRoleSelect('station')}
                            >
                                <div className="w-20 h-20 rounded-full bg-orange-900/20 flex items-center justify-center text-orange-400 group-hover:scale-110 group-hover:bg-orange-500/20 group-hover:text-orange-300 transition-all duration-300">
                                    <Store size={40} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-orange-300 transition-colors">I am a Fuel Partner</h3>
                                    <p className="text-sm text-slate-500 group-hover:text-slate-400">Register your station to sell fuel.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Onboarding Form Steps */}
                    {step > 0 && (
                        <form onSubmit={handleNext} className="space-y-6">

                            {/* CUSTOMER STEP 1: Personal (Same as before) */}
                            {role === 'customer' && step === 1 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                                    <div className="space-y-4">
                                        <Label className="text-orange-500 text-xs font-bold uppercase tracking-wider">Personal Information</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                                                <Input
                                                    id="name" name="name" value={formData.name} onChange={handleChange}
                                                    placeholder="Your Name" required className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 focus:border-orange-500 h-10"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone" className="text-slate-300">Mobile Number</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                                    <Input
                                                        id="phone" name="phone" value={formData.phone} onChange={handleChange}
                                                        placeholder="Phone Number" required className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 focus:border-orange-500 h-10"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="dob" className="text-slate-300">Date of Birth</Label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                                    <Input type="date" id="dob" name="dob" value={formData.dob} onChange={handleChange} className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 focus:border-orange-500 h-10 [color-scheme:dark]" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="gender" className="text-slate-300">Gender</Label>
                                                <Select value={formData.gender} onValueChange={(val) => setFormData(p => ({ ...p, gender: val }))}>
                                                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white focus:ring-orange-500 h-10"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                                                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                                        <SelectItem value="male">Male</SelectItem>
                                                        <SelectItem value="female">Female</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4 pt-2 border-t border-slate-800/50">
                                        <Label className="text-orange-500 text-xs font-bold uppercase tracking-wider">Primary Vehicle Details</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-slate-300">Vehicle Type</Label>
                                                <Select value={formData.vehicles[0].type} onValueChange={(val) => handleVehicleChange(0, 'type', val)}>
                                                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white focus:ring-orange-500 h-10"><SelectValue placeholder="Vehicle Type" /></SelectTrigger>
                                                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                                        <SelectItem value="car">Car</SelectItem>
                                                        <SelectItem value="bike">Bike</SelectItem>
                                                        <SelectItem value="truck">Truck</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-slate-300">Model</Label>
                                                <Input value={formData.vehicles[0].model} onChange={(e) => handleVehicleChange(0, 'model', e.target.value)} placeholder="e.g. Swift" className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 focus:border-orange-500 h-10" />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label className="text-slate-300">License Plate</Label>
                                                <Input value={formData.vehicles[0].plateNumber} onChange={(e) => handleVehicleChange(0, 'plateNumber', e.target.value.toUpperCase())} placeholder="MH 02 AB 1234" className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 focus:border-orange-500 h-10 uppercase font-mono" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CUSTOMER STEP 2: Location (Same as before) */}
                            {role === 'customer' && step === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-4">
                                        {/* Auto Detect Section */}
                                        <div className="flex items-center justify-between">
                                            <Label className="text-orange-500 text-xs font-bold uppercase tracking-wider">Step 1: Auto-Detect Area</Label>
                                            {isLocationLoading && <p className="text-xs text-slate-400 animate-pulse">Fetching GPS...</p>}
                                        </div>
                                        <Button
                                            type="button" variant="outline" onClick={fetchLocation} disabled={isLocationLoading}
                                            className={`w-full py-6 transition-all duration-300 border-slate-700 text-white hover:bg-slate-800 group ${formData.addresses[0].zipCode ? 'bg-green-500/10 border-green-500/50 hover:bg-green-500/20' : 'bg-slate-800'}`}
                                        >
                                            {isLocationLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : formData.addresses[0].zipCode ? <Check className="w-5 h-5 mr-2 text-green-500" /> : <Navigation className="w-5 h-5 mr-2 text-orange-500 group-hover:scale-110 transition-transform" />}
                                            {isLocationLoading ? "Detecting..." : formData.addresses[0].zipCode ? "Area Detected Successfully" : "Detect Current Location"}
                                        </Button>
                                        {renderMap()}

                                        {/* Auto-Filled Details */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label className="text-slate-400 text-xs">Pincode</Label><Input value={formData.addresses[0].zipCode} readOnly className="bg-slate-950 border-slate-800 text-slate-300 h-9 text-sm font-mono" /></div>
                                            <div className="space-y-2"><Label className="text-slate-400 text-xs">City</Label><Input value={formData.addresses[0].city} readOnly className="bg-slate-950 border-slate-800 text-slate-300 h-9 text-sm" /></div>
                                            <div className="space-y-2"><Label className="text-slate-400 text-xs">State</Label><Input value={formData.addresses[0].state} readOnly className="bg-slate-950 border-slate-800 text-slate-300 h-9 text-sm" /></div>
                                            <div className="space-y-2"><Label className="text-slate-400 text-xs">Country</Label><Input value={formData.addresses[0].country} readOnly className="bg-slate-950 border-slate-800 text-slate-300 h-9 text-sm" /></div>
                                        </div>
                                    </div>
                                    <div className={`space-y-4 transition-all duration-500 ${!formData.addresses[0].zipCode ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                                        <Label className="text-orange-500 text-xs font-bold uppercase tracking-wider">Step 2: Precise Address</Label>
                                        <div className="space-y-3">
                                            <div className="space-y-2"><Label className="text-slate-300">House / Flat No.</Label><Input value={formData.addresses[0].addressLine} onChange={(e) => handleAddressChange(0, 'addressLine', e.target.value)} placeholder="e.g. 102, Galaxy Apt" className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 focus:border-orange-500 h-10" /></div>
                                            <div className="space-y-2"><Label className="text-slate-300">Landmark (Optional)</Label><Input value={formData.addresses[0].landmark} onChange={(e) => handleAddressChange(0, 'landmark', e.target.value)} placeholder="e.g. Near Metro Station" className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 focus:border-orange-500 h-10" /></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CUSTOMER STEP 3: Avatar (Updated with Crop) */}
                            {role === 'customer' && step === 3 && (
                                <div className="flex flex-col items-center justify-center py-6 animate-in fade-in slide-in-from-right-8 duration-300">
                                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <Avatar className="w-40 h-40 border-4 border-slate-800 bg-slate-800 shadow-xl transition-transform transform group-hover:scale-105">
                                            <AvatarImage src={formData.avatar} className="object-cover" />
                                            <AvatarFallback className="bg-slate-800 text-slate-400 text-5xl">
                                                {formData.name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Upload className="text-white w-10 h-10" />
                                        </div>
                                    </div>

                                    <div className="mt-8 w-full max-w-xs space-y-4">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            ref={fileInputRef}
                                            onChange={onFileChange}
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full border-slate-700 text-white hover:bg-slate-800"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="w-4 h-4 mr-2" /> Upload Photo
                                        </Button>
                                        <p className="text-xs text-center text-slate-500">
                                            Click avatar to upload. Supports JPG, PNG.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* STATION Steps */}
                            {role === 'station' && step === 1 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
                                    <div className="space-y-2">
                                        <Label htmlFor="businessName" className="text-slate-300">Business Name</Label>
                                        <Input id="businessName" name="businessName" value={formData.businessName} onChange={handleChange} placeholder="My Fuel Station" className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 focus:border-orange-500 h-11" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="businessPhone" className="text-slate-300">Business Contact</Label>
                                        <Input id="businessPhone" name="businessPhone" value={formData.businessPhone} onChange={handleChange} placeholder="Contact Number" className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 focus:border-orange-500 h-11" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gstNumber" className="text-slate-300">GST Registration Number</Label>
                                        <Input id="gstNumber" name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="GSTIN (e.g. 29ABCDE1234F1Z5)" className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 focus:border-orange-500 h-11 uppercase" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fuelProvider" className="text-slate-300">Fuel Provider</Label>
                                        <Select value={formData.fuelProvider} onValueChange={(val) => {
                                            const logos: Record<string, string> = {
                                                'HP': '/hp_logo.png',
                                                'IndianOil': '/Indian_oil_logo.png',
                                                'BharatPetroleum': '/Bharat_pertroleum_logo.png',
                                                'Shell': '/shell_logo.png',
                                                'Reliance': '/reliance_logo.png',
                                                'Nayara': '/nayara_logo.webp'
                                            };
                                            setFormData(p => ({ ...p, fuelProvider: val, avatar: logos[val] || '' }));
                                        }}>
                                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white focus:ring-orange-500 h-11"><SelectValue placeholder="Select Provider" /></SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-slate-700 text-white"><SelectItem value="HP">HP Petroleum</SelectItem><SelectItem value="IndianOil">Indian Oil (IOCL)</SelectItem><SelectItem value="BharatPetroleum">Bharat Petroleum (BPCL)</SelectItem><SelectItem value="Shell">Shell</SelectItem><SelectItem value="Reliance">Reliance Petroleum</SelectItem><SelectItem value="Nayara">Nayara Energy</SelectItem></SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {role === 'station' && step === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-orange-500 text-xs font-bold uppercase tracking-wider">Step 1: Auto-Detect Station Area</Label>
                                            {isLocationLoading && <p className="text-xs text-slate-400 animate-pulse">Fetching GPS...</p>}
                                        </div>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={fetchLocation}
                                            disabled={isLocationLoading}
                                            className={`w-full py-6 transition-all duration-300 border-slate-700 text-white hover:bg-slate-800 group ${formData.pumpLocation.zipCode ? 'bg-green-500/10 border-green-500/50 hover:bg-green-500/20' : 'bg-slate-800'
                                                }`}
                                        >
                                            {isLocationLoading ? (
                                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            ) : formData.pumpLocation.zipCode ? (
                                                <Check className="w-5 h-5 mr-2 text-green-500" />
                                            ) : (
                                                <MapPin className="w-5 h-5 mr-2 text-orange-500 group-hover:scale-110 transition-transform" />
                                            )}
                                            {isLocationLoading ? "Detecting..." : formData.pumpLocation.zipCode ? "Area Detected Successfully" : "Detect Station Location"}
                                        </Button>

                                        {renderMap()}

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-slate-400 text-xs">Pincode</Label>
                                                <Input
                                                    value={formData.pumpLocation.zipCode}
                                                    readOnly
                                                    className="bg-slate-950 border-slate-800 text-slate-300 h-9 text-sm font-mono"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-slate-400 text-xs">City</Label>
                                                <Input
                                                    value={formData.pumpLocation.city}
                                                    readOnly
                                                    className="bg-slate-950 border-slate-800 text-slate-300 h-9 text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-slate-400 text-xs">State</Label>
                                                <Input
                                                    value={formData.pumpLocation.state}
                                                    readOnly
                                                    className="bg-slate-950 border-slate-800 text-slate-300 h-9 text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-slate-400 text-xs">Country</Label>
                                                <Input
                                                    value={formData.pumpLocation.country}
                                                    readOnly
                                                    className="bg-slate-950 border-slate-800 text-slate-300 h-9 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`space-y-4 transition-all duration-500 ${!formData.pumpLocation.zipCode ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                                        <Label className="text-orange-500 text-xs font-bold uppercase tracking-wider">Step 2: Precise Station Address</Label>
                                        <div className="space-y-2">
                                            <Label htmlFor="pumpAddressLine" className="text-slate-300">Station Address</Label>
                                            <Input
                                                id="pumpAddressLine"
                                                value={formData.pumpLocation.addressLine}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    pumpLocation: { ...prev.pumpLocation, addressLine: e.target.value }
                                                }))}
                                                placeholder="Plot No, Street, Area"
                                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 focus:border-orange-500 h-10"
                                                required={step === 2}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {role === 'station' && step === 3 && (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-8 duration-300">
                                    <div className="space-y-2"><Label htmlFor="trucksNeeded" className="text-slate-300">Trucks</Label><Input type="number" id="trucksNeeded" name="trucksNeeded" value={formData.trucksNeeded} onChange={handleChange} min="0" className="bg-slate-800 border-slate-700 text-white focus:border-orange-500 h-11" /></div>
                                    <div className="space-y-2"><Label htmlFor="driversNeeded" className="text-slate-300">Drivers</Label><Input type="number" id="driversNeeded" name="driversNeeded" value={formData.driversNeeded} onChange={handleChange} min="0" className="bg-slate-800 border-slate-700 text-white focus:border-orange-500 h-11" /></div>
                                </div>
                            )}

                            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-6 text-lg shadow-lg shadow-orange-500/20" disabled={isLoading}>{isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</> : <>{role === 'customer' ? (step === 3 ? 'Finish Setup' : 'Next Step') : (step === 3 ? 'Complete Registration' : 'Next Step')} <ArrowRight className="ml-2 h-5 w-5" /></>}</Button>
                        </form>
                    )}
                </CardContent>
            </Card>

            {/* Image Crop Dialog */}
            <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
                <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Crop Profile Picture</DialogTitle>
                        <DialogDescription className="text-slate-400">Drag to position, slide to zoom.</DialogDescription>
                    </DialogHeader>

                    <div className="relative h-64 w-full bg-black/50 rounded-lg overflow-hidden mt-4">
                        {imageSrc && (
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                showGrid={false}
                                cropShape="round"
                            />
                        )}
                    </div>

                    <div className="mt-6 space-y-4">
                        <div className="flex items-center gap-4">
                            <ZoomOut className="w-4 h-4 text-slate-400" />
                            <Slider
                                value={[zoom]}
                                min={1}
                                max={3}
                                step={0.1}
                                onValueChange={(val) => setZoom(val[0])}
                                className="flex-1"
                            />
                            <ZoomIn className="w-4 h-4 text-slate-400" />
                        </div>
                    </div>

                    <DialogFooter className="mt-4 gap-2 sm:justify-end">
                        <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setIsCropDialogOpen(false)}>Cancel</Button>
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={showCroppedImage}>Save Photo</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
