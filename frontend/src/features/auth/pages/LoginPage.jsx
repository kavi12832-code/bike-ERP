import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../store';
import { ROLE_PRESETS } from '../../../config/roles';
import { ShieldCheck, ArrowRight, KeyRound, Mail, Lock, UserCheck, Sparkles, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { toast } from 'sonner';
import { backend } from '../../../services/api/backend';
import { BrandLogo } from '../../../components/domain/BrandLogo';

const DEMO_OTP = '123456';

export function LoginPage() {
  const navigate = useNavigate();
  const loginAsRole = useAppStore((state) => state.loginAsRole);
  const refreshFromBackend = useAppStore((state) => state.refreshFromBackend);

  const [step, setStep] = useState('CREDENTIALS'); // 'CREDENTIALS' or 'OTP'
  const [selectedPreset, setSelectedPreset] = useState(ROLE_PRESETS[0]);
  const [email, setEmail] = useState(ROLE_PRESETS[0].email);
  const [password, setPassword] = useState('password123');
  // Pre-fill OTP automatically for seamless demo
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [loading, setLoading] = useState(false);

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setEmail(preset.email);
    setPassword('password123');
  };

  // Instant 1-click Demo Entry (Bypasses manual OTP for rapid client demo)
  const handleInstantDemoLogin = (preset = selectedPreset) => {
    setLoading(true);
    loginAsRole(preset.id);
    toast.success(`Demo Access Granted: Logged in as ${preset.name} (${preset.role})`);
    setTimeout(() => {
      navigate('/');
    }, 200);
  };

  // Django backend: real JWT login; the server decides whether an OTP step is needed.
  const backendLogin = async (otpCode) => {
    setLoading(true);
    try {
      const res = await backend.login(email.trim(), password, otpCode || DEMO_OTP);
      if (res.otpRequired) {
        setOtp(['1', '2', '3', '4', '5', '6']);
        setStep('OTP');
        toast.info('Demo OTP pre-filled: 123456');
        return;
      }
      if (!(await refreshFromBackend())) throw new Error('Signed in, but loading data from the server failed.');
      toast.success(`Welcome back, ${res.user?.name || email}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsSubmit = (e) => {
    e.preventDefault();
    if (backend.enabled()) {
      backendLogin();
      return;
    }
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (selectedPreset.twoFactorRequired) {
        setOtp(['1', '2', '3', '4', '5', '6']);
        setStep('OTP');
        toast.info(`Demo 2FA OTP auto-filled: ${DEMO_OTP}`);
      } else {
        loginAsRole(selectedPreset.id);
        toast.success(`Welcome back, ${selectedPreset.name}!`);
        navigate('/');
      }
    }, 300);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (backend.enabled()) {
      backendLogin(code);
      return;
    }
    if (code !== DEMO_OTP) {
      toast.error(`Invalid OTP. Use the demo code ${DEMO_OTP}.`);
      return;
    }
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      loginAsRole(selectedPreset.id);
      toast.success(`2FA Verified! Logged in as ${selectedPreset.role}`);
      navigate('/');
    }, 300);
  };

  const autofillOtp = () => {
    setOtp(['1', '2', '3', '4', '5', '6']);
    toast.success('Demo OTP 123456 auto-filled!');
  };

  return (
    <div className="h-full overflow-y-auto bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center">
          <BrandLogo className="w-16 h-16 rounded-2xl shadow-lg shadow-blue-500/20" />
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white">
          AKASH Bajaj
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Enterprise Dealership Management &amp; Workshop Service Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-surface py-8 px-6 shadow-dialog rounded-card border border-border sm:px-10">
          {step === 'CREDENTIALS' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-text-main">
                    Select Demo Persona
                  </label>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    Credentials Auto-Loaded
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {ROLE_PRESETS.slice(0, 4).map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-2 rounded-button border text-left transition-all ${
                        selectedPreset.id === preset.id
                          ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary'
                          : 'border-border bg-surface-subtle text-text-main hover:bg-surface-muted'
                      }`}
                    >
                      <div className="text-xs truncate font-bold">{preset.name}</div>
                      <div className="text-[10px] text-text-muted truncate">{preset.role}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-input border border-border bg-surface-subtle text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-main mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-input border border-border bg-surface-subtle text-text-main focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  />
                </div>
              </div>

              {selectedPreset.twoFactorRequired && (
                <div className="flex items-center gap-2 p-2.5 rounded bg-blue-50 border border-blue-200 text-primary text-[11px]">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>2FA Security: Demo OTP <strong>123456</strong> is pre-configured.</span>
                </div>
              )}

              <div className="space-y-2 pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  loading={loading}
                  iconRight={ArrowRight}
                >
                  {selectedPreset.twoFactorRequired ? 'Proceed to 2FA Verification' : 'Access Showroom Terminal'}
                </Button>

                {/* 1-Click Fast Bypass for Client Presentation */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-xs font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  onClick={() => handleInstantDemoLogin(selectedPreset)}
                >
                  <Zap className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  1-Click Direct Demo Login (Skip OTP)
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-primary flex items-center justify-center mx-auto mb-2 shadow-xs">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-text-main">Enter 6-Digit Security OTP</h3>
                <p className="text-xs text-text-muted mt-1">
                  Sent to registered mobile for <strong>{selectedPreset.name}</strong>
                </p>
                <div className="inline-flex items-center gap-1.5 mt-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] px-2.5 py-1 rounded-full font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Demo Mode: OTP auto-filled (123456)
                </div>
              </div>

              <div className="flex justify-center gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const newOtp = [...otp];
                      newOtp[idx] = e.target.value;
                      setOtp(newOtp);
                    }}
                    className="w-10 h-12 text-center font-mono text-base font-bold rounded-input border border-border bg-surface-subtle text-text-main focus:ring-2 focus:ring-primary shadow-xs"
                  />
                ))}
              </div>

              <div className="space-y-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  loading={loading}
                >
                  Verify &amp; Enter ERP
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={autofillOtp}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-primary" />
                  Auto-fill OTP (123456)
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-xs text-text-muted"
                  onClick={() => setStep('CREDENTIALS')}
                >
                  Back to Persona Selection
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
