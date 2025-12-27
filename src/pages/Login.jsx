import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ScanFace,
  ShieldCheck,
  FileCheck,
  AlertCircle,
  Shield,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/services/api';

export default function Login({ onLogin }) {
  const { t } = useTranslation();
  const { language, toggleLanguage, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await authApi.login(email, password);

      if (result.success && result.user) {
        // Store user in localStorage for session persistence
        localStorage.setItem('currentUser', JSON.stringify(result.user));

        if (onLogin) {
          onLogin(result.user);
        }
        // Navigate to "/" - routing will redirect to PlatformAnalytics (admin) or Dashboard (client)
        navigate('/');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (type) => {
    switch (type) {
      case 'admin':
        setEmail('admin@uaekyc.com');
        setPassword('admin123');
        break;
      case 'adcb':
        setEmail('ahmed.khan@adcb.ae');
        setPassword('pass123');
        break;
      case 'enbd':
        setEmail('sara.mohammed@enbd.ae');
        setPassword('pass123');
        break;
      case 'fab':
        setEmail('mariam.khalid@fab.ae');
        setPassword('pass123');
        break;
      case 'mashreq':
        setEmail('layla.ahmed@mashreq.ae');
        setPassword('pass123');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-gradient-to-br from-black via-gray-800 to-black">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-32 right-20 w-96 h-96 bg-cyan-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-purple-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <ScanFace className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">SignFlow</span>
          </motion.div>

          {/* Center Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center justify-center flex-1"
          >
            {/* Face Scan Animation */}
            <div className="relative">
              <div className="w-48 h-48 xl:w-56 xl:h-56 rounded-3xl border-2 border-white/30 flex items-center justify-center relative overflow-hidden">
                {/* Scanning Lines */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                  animate={{ y: [0, 192, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-cyan-400/20 to-transparent"
                  animate={{ y: [0, 192, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                {/* Corner Brackets */}
                <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-white/60 rounded-tl-lg" />
                <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-white/60 rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-white/60 rounded-bl-lg" />
                <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-white/60 rounded-br-lg" />

                {/* Face Icon */}
                <ScanFace className="w-24 h-24 xl:w-28 xl:h-28 text-white/40" strokeWidth={1} />
              </div>

              {/* Floating Badges */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -left-16 top-8 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20"
              >
                <ShieldCheck className="w-6 h-6 text-cyan-300" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="absolute -right-16 bottom-8 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20"
              >
                <FileCheck className="w-6 h-6 text-emerald-300" />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-12 text-center"
            >
              <h2 className="text-3xl xl:text-4xl font-bold text-white mb-4">
                Secure Document Signing
              </h2>
              <p className="text-white/70 text-lg max-w-md leading-relaxed">
                Verify your identity with facial recognition and sign documents with confidence
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-11 h-11 bg-gradient-to-br from-black via-gray-800 to-black rounded-xl flex items-center justify-center">
              <ScanFace className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">SignFlow</span>
          </div>

          {/* Language Toggle */}
          <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'}`}>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="gap-2"
            >
              <Globe className="w-4 h-4" />
              {language === 'en' ? 'العربية' : 'English'}
            </Button>
          </div>

          {/* Header */}
          <div className={`mb-10 ${isRTL ? 'text-right' : ''}`}>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('login.title')}</h1>
            <p className="text-slate-500">{t('login.subtitle')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            {/* Email Field */}
            <div className={`space-y-2 ${isRTL ? 'text-right' : ''}`}>
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                {t('login.email')}
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-gray-800 focus:ring-gray-800/20 transition-all rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className={`space-y-2 ${isRTL ? 'text-right' : ''}`}>
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                {t('login.password')}
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-gray-800 focus:ring-gray-800/20 transition-all rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-black via-gray-800 to-black hover:from-gray-900 hover:via-gray-700 hover:to-gray-900 text-white font-medium rounded-xl shadow-lg shadow-black/25 transition-all duration-300 hover:shadow-xl hover:shadow-black/30 disabled:opacity-70"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                t('login.signIn')
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className={`text-xs text-slate-500 mb-3 ${isRTL ? 'text-right' : 'text-center'}`}>{t('login.demoCredentials')}</p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin')}
                className="w-full p-4 rounded-xl border border-slate-200 hover:border-gray-400 hover:bg-gray-50/50 transition-all duration-200 text-left flex items-center gap-4 group"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-black via-gray-800 to-black flex items-center justify-center shadow-lg shadow-black/20 group-hover:shadow-black/30 transition-shadow">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Platform Admin</p>
                  <p className="text-xs text-slate-500">admin@uaekyc.com / admin123</p>
                </div>
              </button>
            </div>

            <p className="text-xs text-slate-500 text-center mt-6 mb-3">Client Logins (Click to fill)</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fillDemoCredentials('adcb')}
                className="p-3 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50/50 transition-all duration-200 text-left group"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-md mb-2">
                  <span className="text-xs font-bold text-white">AD</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">ADCB Bank</p>
                <p className="text-[10px] text-slate-500">ahmed.khan@adcb.ae</p>
              </button>

              <button
                type="button"
                onClick={() => fillDemoCredentials('enbd')}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 text-left group"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md mb-2">
                  <span className="text-xs font-bold text-white">EN</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">Emirates NBD</p>
                <p className="text-[10px] text-slate-500">sara.mohammed@enbd.ae</p>
              </button>

              <button
                type="button"
                onClick={() => fillDemoCredentials('fab')}
                className="p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200 text-left group"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-md mb-2">
                  <span className="text-xs font-bold text-white">FA</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">FAB</p>
                <p className="text-[10px] text-slate-500">mariam.khalid@fab.ae</p>
              </button>

              <button
                type="button"
                onClick={() => fillDemoCredentials('mashreq')}
                className="p-3 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all duration-200 text-left group"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md mb-2">
                  <span className="text-xs font-bold text-white">MQ</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">Mashreq</p>
                <p className="text-[10px] text-slate-500">layla.ahmed@mashreq.ae</p>
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-10 text-center text-xs text-slate-400">
            By signing in, you agree to our{' '}
            <a href="#" className="text-gray-700 hover:text-black hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-gray-700 hover:text-black hover:underline">Privacy Policy</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
