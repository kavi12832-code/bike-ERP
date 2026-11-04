import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, ArrowRight, KeyRound, Lock, Mail, ShieldCheck, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '../../../store';
import { Button } from '../../../components/ui/Button';
import { BrandLogo } from '../../../components/domain/BrandLogo';
import { backend } from '../../../services/api/backend';

const inputClass =
  'w-full pl-9 pr-3 py-2.5 text-sm rounded-input border border-border bg-surface-subtle text-text-main ' +
  'focus:outline-none focus:ring-2 focus:ring-primary';

function CodeInput({ value, onChange, autoFocus }) {
  return (
    <input
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={6}
      value={value}
      autoFocus={autoFocus}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
      placeholder="6-digit code"
      className="w-full text-center tracking-[0.5em] font-mono text-lg py-3 rounded-input border border-border bg-surface-subtle text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
    />
  );
}

/**
 * Sign-in against the Django API (JWT). Steps:
 *  CREDENTIALS -> (2FA enrolled) CODE -> app
 *  CREDENTIALS -> (2FA required but not enrolled) ENROL (QR + code) -> app
 */
export function LoginPage() {
  const navigate = useNavigate();
  const refreshFromBackend = useAppStore((state) => state.refreshFromBackend);

  const [step, setStep] = useState('CREDENTIALS');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [enrolment, setEnrolment] = useState(null); // { secret, otpauthUri }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const emailRef = useRef(null);

  useEffect(() => emailRef.current?.focus(), []);

  const enterApp = async (user) => {
    if (!(await refreshFromBackend())) throw new Error('Signed in, but loading your data failed. Please retry.');
    toast.success(`Welcome back, ${user?.name || email}!`);
    navigate('/', { replace: true });
  };

  const submitLogin = async (otp) => {
    setLoading(true);
    setError('');
    try {
      const res = await backend.login(email.trim(), password, otp);
      if (res.otpRequired) {
        setCode('');
        setStep('CODE');
        return;
      }
      if (res.mustSetupTwoFactor) {
        setEnrolment(await backend.startTwoFactorSetup());
        setCode('');
        setStep('ENROL');
        return;
      }
      setPassword('');
      await enterApp(res.user);
    } catch (err) {
      setError(err.message || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const confirmEnrolment = async () => {
    setLoading(true);
    setError('');
    try {
      await backend.confirmTwoFactor(code);
      toast.success('Two-factor authentication is on.');
      setPassword('');
      await enterApp(null);
    } catch (err) {
      setError(err.message || 'That code did not work');
    } finally {
      setLoading(false);
    }
  };

  const back = () => {
    setStep('CREDENTIALS');
    setCode('');
    setError('');
  };

  return (
    <div className="h-full overflow-y-auto bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center">
          <BrandLogo className="w-16 h-16 rounded-2xl shadow-lg shadow-blue-500/20" />
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white">AKASH Bajaj</h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Enterprise Dealership Management &amp; Workshop Service Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-surface py-8 px-6 shadow-dialog rounded-card border border-border sm:px-10">
          {error && (
            <div role="alert" className="mb-4 p-2.5 rounded bg-red-50 border border-red-200 text-xs text-status-red">
              {error}
            </div>
          )}

          {step === 'CREDENTIALS' && (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                submitLogin();
              }}
            >
              <div>
                <label htmlFor="login-email" className="block text-xs font-medium text-text-main mb-1">
                  Work email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                  <input
                    id="login-email"
                    ref={emailRef}
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="login-password" className="block text-xs font-medium text-text-main mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
              <Button type="submit" variant="primary" className="w-full" loading={loading} iconRight={ArrowRight}>
                Sign in
              </Button>
              <p className="text-[11px] text-text-muted text-center">
                Accounts are created by your administrator. Repeated wrong passwords lock the account for 15 minutes.
              </p>
            </form>
          )}

          {step === 'CODE' && (
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                submitLogin(code);
              }}
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-text-main">Two-factor authentication</h3>
                <p className="text-xs text-text-muted mt-1">Enter the 6-digit code from your authenticator app.</p>
              </div>
              <CodeInput value={code} onChange={setCode} autoFocus />
              <div className="space-y-2">
                <Button type="submit" variant="primary" className="w-full" loading={loading} disabled={code.length !== 6}>
                  Verify &amp; sign in
                </Button>
                <Button type="button" variant="ghost" className="w-full" icon={ArrowLeft} onClick={back}>
                  Back
                </Button>
              </div>
            </form>
          )}

          {step === 'ENROL' && enrolment && (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                confirmEnrolment();
              }}
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-status-amber flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-text-main">Set up two-factor authentication</h3>
                <p className="text-xs text-text-muted mt-1">
                  Your role requires 2FA. Scan this code with Google Authenticator, Microsoft Authenticator or a
                  similar app, then enter the 6-digit code it shows.
                </p>
              </div>
              <div className="flex justify-center p-3 bg-white rounded border border-border">
                <QRCodeSVG value={enrolment.otpauthUri} size={168} />
              </div>
              <div className="flex items-start gap-2 text-[11px] text-text-muted">
                <Smartphone className="w-4 h-4 shrink-0" />
                <span>
                  Can&apos;t scan? Enter this key manually:{' '}
                  <code className="font-mono text-text-main break-all">{enrolment.secret}</code>
                </span>
              </div>
              <CodeInput value={code} onChange={setCode} autoFocus />
              <Button type="submit" variant="primary" className="w-full" loading={loading} disabled={code.length !== 6}>
                Turn on 2FA &amp; continue
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
