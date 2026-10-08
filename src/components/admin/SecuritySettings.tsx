import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, KeyRound, Lock, Eye, EyeOff, 
  Check, RefreshCw, Copy, Smartphone,
  User, Link, Shield, CheckCircle2
} from 'lucide-react';
import { updateMfaSettings, verifyCurrentAuth, getCachedAdminCreds } from '../../services/api';

export const SecuritySettings: React.FC = () => {
  const [currentUsername, setCurrentUsername] = useState('admin');
  const [newUsername, setNewUsername] = useState('');
  const [mfaActive, setMfaActive] = useState(true);
  const [customMfaCode, setCustomMfaCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const activeAdminSlug = (import.meta.env.VITE_ADMIN_PATH || 'admin').replace(/^\/+/, '');
  const secretKey = 'JBSWY3DPEHPK3PXP';

  useEffect(() => {
    const cached = getCachedAdminCreds();
    if (cached?.username) {
      setCurrentUsername(cached.username);
    }
    if (cached?.mfaEnabled !== undefined) {
      setMfaActive(cached.mfaEnabled);
    }
    if (cached?.customMfaCode) {
      setCustomMfaCode(cached.customMfaCode);
    }

    verifyCurrentAuth().then((res) => {
      if (res?.user?.username) {
        setCurrentUsername(res.user.username);
      }
      if (res?.mfaDetails?.mfaEnabled !== undefined) {
        setMfaActive(res.mfaDetails.mfaEnabled);
      }
      if (res?.mfaDetails?.customMfaCode) {
        setCustomMfaCode(res.mfaDetails.customMfaCode);
      }
    });
  }, []);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(secretKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (newUsername && newUsername.trim().length < 2) {
      setStatusMsg({ type: 'error', text: 'Username must be at least 2 characters long.' });
      return;
    }

    if (newPassword && newPassword.length < 4) {
      setStatusMsg({ type: 'error', text: 'New password must be at least 4 characters long.' });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'Password confirmation does not match.' });
      return;
    }

    if (customMfaCode && customMfaCode.trim().length > 0 && customMfaCode.trim().length < 4) {
      setStatusMsg({ type: 'error', text: 'Custom 2FA code must be at least 4 digits.' });
      return;
    }

    setIsUpdating(true);
    try {
      const res = await updateMfaSettings(
        mfaActive, 
        newPassword || undefined,
        newUsername.trim() || undefined,
        customMfaCode.trim() || undefined
      );

      if (res?.username) {
        setCurrentUsername(res.username);
      } else if (newUsername.trim()) {
        setCurrentUsername(newUsername.trim());
      }

      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');
      setStatusMsg({ 
        type: 'success', 
        text: 'Admin credentials and 2FA settings saved successfully! You can now log in with your updated credentials.' 
      });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update settings.' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 text-slate-100 max-w-4xl">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight font-display">
            Admin Authentication & Security Credentials
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Update admin login username and password, customize the admin access URL, and manage two-factor authentication (2FA).
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-xs border flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : 'bg-red-950/80 border-red-800 text-red-300'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Shield className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* SECTION: Secret URL & Route Configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Link className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Custom Admin URL Path</h3>
            </div>
            <p className="text-xs text-slate-400">
              Change the URL slug from <code className="text-slate-300 font-mono">/admin</code> to any secret name (e.g. <code className="text-slate-300 font-mono">/portal</code>, <code className="text-slate-300 font-mono">/staff</code>, or <code className="text-slate-300 font-mono">/secure-desk</code>).
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Active: /{activeAdminSlug}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Current Direct URL:</span>
            <div className="flex items-center justify-between gap-2">
              <code className="text-xs text-blue-400 font-mono font-bold truncate">
                {window.location.origin}/#{activeAdminSlug}
              </code>
              <button
                type="button"
                onClick={() => handleCopyUrl(`${window.location.origin}/#${activeAdminSlug}`)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer shrink-0"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs text-slate-300">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">How to Change the URL Name:</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Add <code className="text-emerald-400 font-mono">VITE_ADMIN_PATH="/your-custom-name"</code> to your <code className="text-slate-300 font-mono">.env</code> or Vercel Environment Variables.
            </p>
          </div>
        </div>
      </div>

      {/* Form: Username, Password, and MFA */}
      <form onSubmit={handleSaveSecurity} className="space-y-6">
        
        {/* SECTION 1: Admin Username Update */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Admin Username</h3>
              </div>
              <p className="text-xs text-slate-400">Change the login username used to access this dashboard.</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Current Username</span>
              <span className="text-xs font-mono font-bold text-emerald-400">{currentUsername}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                New Username
              </label>
              <input
                type="text"
                placeholder={`Leave blank to keep "${currentUsername}"`}
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Letters, numbers, underscores (min 2 chars).</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: Master Password Update */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Change Master Password</h3>
            </div>
            <p className="text-xs text-slate-400">Set a new password for the administrator account.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Leave blank to keep current password.</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Two-Factor Authentication (2FA) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Two-Factor Authentication (2FA)</h3>
              <p className="text-xs text-slate-400">Manage multi-factor verification requirements for admin login.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={mfaActive}
                onChange={(e) => setMfaActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {mfaActive && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Custom 2FA PIN / Code option */}
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <KeyRound className="w-4 h-4 text-emerald-400" />
                    <span>Custom 2FA Verification Code</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Set your own preferred 6-digit verification code to enter during 2FA login.
                  </p>
                  
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold mb-1">
                      Custom 6-Digit Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 654321"
                      value={customMfaCode}
                      onChange={(e) => setCustomMfaCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Optional: Leave blank to use standard TOTP app.</span>
                  </div>
                </div>

                {/* Authenticator App setup */}
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Smartphone className="w-4 h-4 text-blue-400" />
                    <span>Authenticator App Sync</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Works with Google Authenticator, Microsoft Authenticator, 1Password, or Authy.
                  </p>
                  
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Secret Key:</span>
                    <div className="flex items-center justify-between">
                      <code className="text-xs text-blue-400 font-mono font-bold tracking-wider">{secretKey}</code>
                      <button
                        type="button"
                        onClick={handleCopyKey}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isUpdating}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            {isUpdating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Credentials...</span>
              </>
            ) : (
              <span>Save Security Settings</span>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
