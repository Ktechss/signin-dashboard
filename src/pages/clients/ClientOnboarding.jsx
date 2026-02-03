import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  FileText,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { clientsApi } from '@/services/api';

export default function ClientOnboarding() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    // Company Details
    companyName: '',
    licenseNumber: '',
    ownerName: '',
    ownerPhone: '',
    companyEmail: '',

    // Root User Credentials
    rootUsername: '',
    rootEmail: '',
    rootPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Company Details validation
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    }
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required';
    }
    if (!formData.ownerPhone.trim()) {
      newErrors.ownerPhone = 'Owner phone is required';
    } else if (!/^\+?[\d\s-]{8,}$/.test(formData.ownerPhone)) {
      newErrors.ownerPhone = 'Invalid phone number';
    }
    if (!formData.companyEmail.trim()) {
      newErrors.companyEmail = 'Company email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyEmail)) {
      newErrors.companyEmail = 'Invalid email address';
    }

    // Root User validation
    if (!formData.rootUsername.trim()) {
      newErrors.rootUsername = 'Username is required';
    } else if (formData.rootUsername.length < 3) {
      newErrors.rootUsername = 'Username must be at least 3 characters';
    }
    if (!formData.rootEmail.trim()) {
      newErrors.rootEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.rootEmail)) {
      newErrors.rootEmail = 'Invalid email address';
    }
    if (!formData.rootPassword) {
      newErrors.rootPassword = 'Password is required';
    } else if (formData.rootPassword.length < 8) {
      newErrors.rootPassword = 'Password must be at least 8 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm password';
    } else if (formData.rootPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await clientsApi.onboard({
        companyName: formData.companyName,
        licenseNumber: formData.licenseNumber,
        ownerName: formData.ownerName,
        ownerPhone: formData.ownerPhone,
        companyEmail: formData.companyEmail,
        rootUsername: formData.rootUsername,
        rootEmail: formData.rootEmail,
        rootPassword: formData.rootPassword,
      });

      toast.success(`Client "${result.client.name}" created successfully!`);
      navigate('/PlatformAnalytics'); // Navigate back to platform view
    } catch (error) {
      const message = error.message || 'Failed to create client organization';
      toast.error(message);
      console.error('Error creating client:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Add New Client</h1>
              <p className="text-sm text-gray-500">Onboard a new organization to the platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
                Company Details
              </CardTitle>
              <CardDescription>
                Basic information about the organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    placeholder="Enter company name"
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    className={cn(errors.companyName && "border-red-500")}
                  />
                  {errors.companyName && (
                    <p className="text-xs text-red-500">{errors.companyName}</p>
                  )}
                </div>

                {/* License Number */}
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">
                    License Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="licenseNumber"
                      placeholder="Enter license number"
                      value={formData.licenseNumber}
                      onChange={(e) => handleChange('licenseNumber', e.target.value)}
                      className={cn("pl-10", errors.licenseNumber && "border-red-500")}
                    />
                  </div>
                  {errors.licenseNumber && (
                    <p className="text-xs text-red-500">{errors.licenseNumber}</p>
                  )}
                </div>

                {/* Owner Name */}
                <div className="space-y-2">
                  <Label htmlFor="ownerName">
                    Owner Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="ownerName"
                      placeholder="Enter owner's full name"
                      value={formData.ownerName}
                      onChange={(e) => handleChange('ownerName', e.target.value)}
                      className={cn("pl-10", errors.ownerName && "border-red-500")}
                    />
                  </div>
                  {errors.ownerName && (
                    <p className="text-xs text-red-500">{errors.ownerName}</p>
                  )}
                </div>

                {/* Owner Phone */}
                <div className="space-y-2">
                  <Label htmlFor="ownerPhone">
                    Owner Phone <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="ownerPhone"
                      placeholder="+971 50 123 4567"
                      value={formData.ownerPhone}
                      onChange={(e) => handleChange('ownerPhone', e.target.value)}
                      className={cn("pl-10", errors.ownerPhone && "border-red-500")}
                    />
                  </div>
                  {errors.ownerPhone && (
                    <p className="text-xs text-red-500">{errors.ownerPhone}</p>
                  )}
                </div>

                {/* Company Email */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="companyEmail">
                    Company Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="companyEmail"
                      type="email"
                      placeholder="company@example.com"
                      value={formData.companyEmail}
                      onChange={(e) => handleChange('companyEmail', e.target.value)}
                      className={cn("pl-10", errors.companyEmail && "border-red-500")}
                    />
                  </div>
                  {errors.companyEmail && (
                    <p className="text-xs text-red-500">{errors.companyEmail}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Root User Credentials Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="h-5 w-5 text-purple-600" />
                Root User Credentials
              </CardTitle>
              <CardDescription>
                Admin account credentials for the organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Root Username */}
                <div className="space-y-2">
                  <Label htmlFor="rootUsername">
                    Username <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="rootUsername"
                      placeholder="Enter username"
                      value={formData.rootUsername}
                      onChange={(e) => handleChange('rootUsername', e.target.value)}
                      className={cn("pl-10", errors.rootUsername && "border-red-500")}
                    />
                  </div>
                  {errors.rootUsername && (
                    <p className="text-xs text-red-500">{errors.rootUsername}</p>
                  )}
                </div>

                {/* Root Email */}
                <div className="space-y-2">
                  <Label htmlFor="rootEmail">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="rootEmail"
                      type="email"
                      placeholder="admin@company.com"
                      value={formData.rootEmail}
                      onChange={(e) => handleChange('rootEmail', e.target.value)}
                      className={cn("pl-10", errors.rootEmail && "border-red-500")}
                    />
                  </div>
                  {errors.rootEmail && (
                    <p className="text-xs text-red-500">{errors.rootEmail}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="rootPassword">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="rootPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={formData.rootPassword}
                      onChange={(e) => handleChange('rootPassword', e.target.value)}
                      className={cn("pl-10 pr-10", errors.rootPassword && "border-red-500")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.rootPassword && (
                    <p className="text-xs text-red-500">{errors.rootPassword}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      className={cn("pl-10 pr-10", errors.confirmPassword && "border-red-500")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Password must be at least 8 characters long
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 bg-slate-900 hover:bg-slate-800"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Create Client
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
