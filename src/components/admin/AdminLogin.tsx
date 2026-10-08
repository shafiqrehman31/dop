import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, ArrowRight, Scale, Shield } from 'lucide-react';
import { loginStep1, loginStep2Mfa, setAuthToken, getCachedCms, getCachedAdminCreds } from '../../services/api';
import { CmsContent } from '../../types';

interface AdminLoginProps {
  cms?: CmsContent;
  onLoginSuccess: (user: any) => void;
  onNavigateHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ cms, onLoginSuccess, onNavigateHome }) => {
  const activeCms = cms || getCachedCms();
  const cachedCreds = getCachedAdminCreds();

  const [username, setUsername] = useState(cachedCreds?.username || '');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [mfaSessionToken, setMfaSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await loginStep1(username, password);
      if (res.requiresMfa && res.mfaSessionToken) {
        setRequiresMfa(true);
        setMfaSessionToken(res.mfaSessionToken);
      } else if (res.token) {
        setAuthToken(res.token);
        onLoginSuccess(res.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaSessionToken) return;
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await loginStep2Mfa(mfaSessionToken, mfaCode);
      if (res.token) {
        setAuthToken(res.token);
        onLoginSuccess(res.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please check your code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100 relative">
      {/* Background accents */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Website Logo & Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4">
        {activeCms?.logoUrl ? (
          <div className="flex items-center justify-center mb-4">
            <img
              src={activeCms.logoUrl}
              alt={activeCms.siteName || 'Website Logo'}
              className="h-12 sm:h-14 w-auto max-w-[240px] object-contain drop-shadow"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-white font-display tracking-tight">
              {activeCms?.siteName || 'Deposit Claim'}
            </span>
          </div>
        )}
        <h2 className="text-center text-xl font-bold text-slate-200">
          Staff Portal & Administration
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Protected management console · Authorized personnel only
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900 py-8 px-6 sm:px-10 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
          
          {!requiresMfa ? (
            /* STEP 1: Username & Password */
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Username or Admin Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Enter admin username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Admin Master Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                {isLoading ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: Multi-Factor Authentication Code */
            <form onSubmit={handleMfaSubmit} className="space-y-5">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white pt-2">
                  Two-Factor Authentication
                </h3>
                <p className="text-xs text-slate-400">
                  Enter your 6-digit verification code to continue.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  required
                  maxLength={8}
                  placeholder="6-digit code"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-center text-xl tracking-widest font-mono font-bold text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isLoading || !mfaCode.trim()}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  {isLoading ? 'Verifying 2FA...' : 'Verify & Enter Dashboard'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRequiresMfa(false);
                    setMfaSessionToken(null);
                    setErrorMsg(null);
                  }}
                  className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  ← Back to password login
                </button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-slate-800 text-center">
            <button
              onClick={onNavigateHome}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Return to Public Website
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
