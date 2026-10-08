import React, { useState } from 'react';
import { 
  Send, CheckCircle2, Phone, Mail, MapPin, ShieldCheck, Scale,
  PhoneCall, Eye, X, Printer, Sparkles, Check, Clock
} from 'lucide-react';
import { CmsContent } from '../types';
import { submitLead } from '../services/api';
import heroBackdropImg from '../assets/images/hero_london_residential_backdrop_1790957970822.jpg';

interface InquiryFormProps {
  cms: CmsContent;
  onSuccessSubmitted?: () => void;
}

export const InquiryForm: React.FC<InquiryFormProps> = ({ cms, onSuccessSubmitted }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [postcode, setPostcode] = useState('');
  const [depositAmount, setDepositAmount] = useState<number | ''>(1200);
  const [protectionStatus, setProtectionStatus] = useState<'no' | 'late' | 'dont_know'>('no');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);
  const [lastSubmittedLead, setLastSubmittedLead] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    postcode: string;
    depositAmount: number;
    protectionStatus: string;
    message: string;
    minComp: number;
    maxComp: number;
    submittedAt: string;
    emailConfirmation?: any;
  } | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !email.trim() || !phone.trim() || !postcode.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const deposit = Number(depositAmount) || 1000;
      const minComp = deposit * 1;
      const maxComp = deposit * (protectionStatus === 'no' ? 3 : 2);
      const res = await submitLead({
        source: 'inquiry_form',
        name,
        email,
        phone,
        postcode,
        depositAmount: deposit,
        protectedWithin30Days: protectionStatus,
        propertyLocation: 'england_wales',
        message: message.trim() || 'General claim inquiry submitted',
        renewalsCount: 0,
        paidWithinSixYears: true,
        receivedPrescribedInfo: 'no',
        hasTenancyAgreement: 'yes',
        tenancyStatus: 'moved_out',
        estimatedCompensationMin: minComp,
        estimatedCompensationMax: maxComp,
      });

      const leadRef = res.leadId || (res as any)?.lead?.id || `DH-${Date.now().toString().slice(-6)}`;
      
      setLastSubmittedLead({
        id: leadRef,
        name,
        email,
        phone,
        postcode: postcode.toUpperCase(),
        depositAmount: deposit,
        protectionStatus,
        message: message.trim(),
        minComp,
        maxComp,
        submittedAt: new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        emailConfirmation: (res as any)?.emailConfirmation || (res as any)?.lead?.emailConfirmation,
      });

      setSubmittedLeadId(leadRef);
      setName('');
      setEmail('');
      setPhone('');
      setPostcode('');
      setMessage('');
      if (onSuccessSubmitted) onSuccessSubmitted();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background Architectural Backdrop Image */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={heroBackdropImg}
          alt="London residential architecture backdrop"
          className="w-full h-full object-cover object-center filter brightness-[0.70] contrast-[1.05]"
          referrerPolicy="no-referrer"
        />
        {/* Balanced translucent overlay */}
        <div className="absolute inset-0 bg-slate-950/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/50 to-slate-950" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Contact info & reassurance */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Direct Legal Assistance
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight text-balance">
                Request a Solicitor Case Review
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Have specific questions regarding your tenancy agreement, unlawful deposit deductions, or landlord dispute? Send our legal specialists a direct inquiry for priority review.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-900/40 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Tenant Advice Line:</div>
                  <a href={`tel:${cms.contactPhone}`} className="font-bold text-white hover:text-blue-400 transition-colors">
                    {cms.contactPhone}
                  </a>
                  <div className="text-[11px] text-slate-400">Monday - Friday, 9:00am - 6:00pm</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-900/40 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Direct Case Inquiries:</div>
                  <a href={`mailto:${cms.contactEmail}`} className="font-bold text-white hover:text-blue-400 transition-colors">
                    {cms.contactEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-900/40 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">London Consultation Office:</div>
                  <div className="text-slate-200">{cms.officeAddress}</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Confidentiality & SRA Standards</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                All communications are confidential and protected by legal professional privilege. Your landlord is not notified until you formally instruct our partner solicitors.
              </p>
            </div>
          </div>

          {/* Right Column: Integrated Form */}
          <div className="lg:col-span-7 bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
            {submittedLeadId && lastSubmittedLead ? (
              <div className="space-y-6 text-left py-2">
                {/* Header Success Status */}
                <div className="flex items-center gap-3 p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl">
                  <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                      Claim Reference #{lastSubmittedLead.id}
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      Inquiry Received & Case Logged Successfully
                    </h3>
                  </div>
                </div>

                {/* PRIORITY CALLBACK CALLOUT BANNER */}
                <div className="bg-gradient-to-r from-blue-950/90 to-slate-900 border-2 border-blue-500 rounded-xl p-5 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-start gap-3.5 relative z-10">
                    <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-blue-900/50">
                      <PhoneCall className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="text-xs font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                        <span>Priority Callback Notification</span>
                      </div>
                      <div className="text-base sm:text-lg font-black text-white leading-snug">
                        Our specialist legal team will call you shortly on{' '}
                        <span className="text-blue-400 underline decoration-blue-500/50 decoration-2 underline-offset-2">
                          {lastSubmittedLead.phone}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed pt-0.5">
                        A senior tenancy dispute handler will contact you directly to verify your tenancy protection records and conduct your free statutory case assessment under the Housing Act 2004.
                      </p>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                        <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>Claims team assessing files: <strong>8:00 AM – 7:00 PM Monday to Friday</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* EMAIL SENT DISPATCH NOTICE & PREVIEW BUTTON */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/80 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Confirmation Email Dispatched</span>
                        <span className="text-[10px] text-emerald-400 font-mono px-1.5 py-0.5 bg-emerald-950/80 border border-emerald-800 rounded">
                          SENT TO INBOX
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        A formal receipt with all your submitted details has been sent to{' '}
                        <strong className="text-slate-200 font-mono">{lastSubmittedLead.email}</strong>.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowEmailPreview(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/40 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Sent Email Template</span>
                  </button>
                </div>

                {/* SUMMARY OF ALL USER-SUBMITTED DATA */}
                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner">
                  <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">
                      Summary of Your Submitted Claim Details:
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Ref #{lastSubmittedLead.id}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-800/70 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3 px-4 bg-slate-950/40">
                      <span className="text-slate-400 font-medium">Full Name:</span>
                      <span className="sm:col-span-2 font-bold text-white">{lastSubmittedLead.name}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3 px-4">
                      <span className="text-slate-400 font-medium">Email Address:</span>
                      <span className="sm:col-span-2 font-mono text-slate-200">{lastSubmittedLead.email}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3 px-4 bg-slate-950/40">
                      <span className="text-slate-400 font-medium">Contact Telephone:</span>
                      <span className="sm:col-span-2 font-bold text-blue-400 font-mono">{lastSubmittedLead.phone}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3 px-4">
                      <span className="text-slate-400 font-medium">Property Postcode:</span>
                      <span className="sm:col-span-2 font-bold text-white font-mono">{lastSubmittedLead.postcode}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3 px-4 bg-slate-950/40">
                      <span className="text-slate-400 font-medium">Tenancy Deposit Paid:</span>
                      <span className="sm:col-span-2 font-bold text-white">
                        £{lastSubmittedLead.depositAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3 px-4">
                      <span className="text-slate-400 font-medium">Protection Status:</span>
                      <span className="sm:col-span-2 font-semibold text-amber-300">
                        {lastSubmittedLead.protectionStatus === 'no'
                          ? 'Unprotected (Statutory 3x Penalty Eligible)'
                          : lastSubmittedLead.protectionStatus === 'late'
                          ? 'Protected Late (Over 30-Day Statutory Deadline)'
                          : 'Requires Forensic Scheme Search'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3 px-4 bg-emerald-950/20 border-l-2 border-emerald-500">
                      <span className="text-emerald-400 font-semibold">Est. Statutory Compensation:</span>
                      <span className="sm:col-span-2 font-extrabold text-emerald-400 text-sm">
                        £{lastSubmittedLead.minComp.toLocaleString()} – £{lastSubmittedLead.maxComp.toLocaleString()}*
                      </span>
                    </div>

                    {lastSubmittedLead.message && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 p-3 px-4 bg-slate-950/40">
                        <span className="text-slate-400 font-medium">Your Message / Dispute Notes:</span>
                        <span className="sm:col-span-2 text-slate-300 italic">
                          "{lastSubmittedLead.message}"
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3 px-4">
                      <span className="text-slate-400 font-medium">Logged Timestamp:</span>
                      <span className="sm:col-span-2 text-slate-400">{lastSubmittedLead.submittedAt}</span>
                    </div>
                  </div>
                </div>

                {/* NEXT STEPS GUIDE */}
                <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-2.5">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>Next Steps for Your Claim:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                      <div className="font-bold text-blue-400 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                        <span>Free Consultation</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Our team calls you on <strong className="text-slate-200">{lastSubmittedLead.phone}</strong> to confirm your tenancy dates.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                      <div className="font-bold text-blue-400 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                        <span>Scheme Searches</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        We check DPS, TDS, and MyDeposits to certify the landlord's statutory breach.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                      <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                        <span>No Win No Fee Claim</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Our partner solicitors pursue up to 3x compensation with zero upfront cost.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEmailPreview(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-blue-900/30"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Dispatched Email Template</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedLeadId(null);
                      setLastSubmittedLead(null);
                      setMessage('');
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer text-center"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">Direct Case Review Form</h3>
                  <p className="text-xs text-slate-400">Complete the form below for a free claim assessment.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rachel Adams"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="rachel@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Mobile Telephone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="07700 900000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Rented Property Postcode *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NW1 6XE"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Deposit Amount Paid (£)
                    </label>
                    <input
                      type="number"
                      min="100"
                      step="50"
                      placeholder="1200"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Deposit Protection Status
                    </label>
                    <select
                      value={protectionStatus}
                      onChange={(e) => setProtectionStatus(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="no">Never Protected in Scheme (3x)</option>
                      <option value="late">Protected Late after 30 days (1x-3x)</option>
                      <option value="dont_know">I don't know / Not sure</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Details of your tenancy or dispute (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about tenancy start date, landlord name, whether deductions were made, or any other notes..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <span>Submitting Inquiry...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Confidential Case Inquiry</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-400">
                  By submitting, you agree to our terms. We will never share your personal data with your landlord without consent.
                </p>
              </form>
            )}
          </div>

        </div>

      </div>

      {/* DISPATCHED EMAIL TEMPLATE PREVIEW MODAL */}
      {showEmailPreview && lastSubmittedLead && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
          onClick={() => setShowEmailPreview(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-100 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Dispatched Confirmation Email</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Recipient: {lastSubmittedLead.email} • Ref #{lastSubmittedLead.id}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEmailPreview(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Email Subject Line Bar */}
            <div className="bg-slate-950/60 px-5 py-2.5 border-b border-slate-800/80 text-xs flex items-center gap-2">
              <span className="text-slate-500 font-medium">Subject:</span>
              <span className="text-blue-300 font-semibold truncate">
                Deposit Claim Inquiry Received - Reference #{lastSubmittedLead.id} [Our team will call you shortly]
              </span>
            </div>

            {/* Email Preview Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-950 text-slate-200 text-xs">
              
              {/* Branded Email Header */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center space-y-1">
                <div className="text-xl font-black text-white font-display tracking-tight">
                  {cms.siteName || 'Deposit Hero'}
                </div>
                <div className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">
                  UK Tenancy Deposit Claim Specialists
                </div>
              </div>

              {/* Greeting */}
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-2">
                <div className="text-sm font-bold text-white">
                  Dear {lastSubmittedLead.name || 'Valued Tenant'},
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Thank you for submitting your tenancy deposit claim inquiry with {cms.siteName || 'Deposit Hero'}. Your case details have been registered under Claim Reference <strong className="text-white font-mono">#{lastSubmittedLead.id}</strong>.
                </p>
              </div>

              {/* PRIORITY CALLBACK CALLOUT IN EMAIL */}
              <div className="bg-blue-950/60 border-2 border-blue-500/80 rounded-xl p-4 sm:p-5 space-y-2">
                <div className="flex items-center gap-2 text-[11px] font-extrabold text-blue-400 uppercase tracking-wider">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Priority Callback Notification</span>
                </div>
                <div className="text-base font-black text-white">
                  Our team will call you shortly on{' '}
                  <span className="text-blue-400 font-mono underline decoration-blue-500 decoration-2 underline-offset-2">
                    {lastSubmittedLead.phone}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  A specialist tenancy dispute handler will call you directly to verify your tenancy dates and conduct your statutory compensation calculation. Please keep your phone available.
                </p>
                <div className="text-[11px] text-slate-400 pt-1">
                  Operating Hours: <strong>8:00 AM – 7:00 PM Monday to Friday</strong>
                </div>
              </div>

              {/* SUMMARY TABLE IN EMAIL */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-800/70 border-b border-slate-800 font-bold text-white text-xs">
                  Summary of Your Submitted Inquiry:
                </div>
                <div className="divide-y divide-slate-800 text-xs">
                  <div className="grid grid-cols-3 p-2.5 px-4 bg-slate-950/40">
                    <span className="text-slate-400">Claim Reference:</span>
                    <span className="col-span-2 font-mono font-bold text-white">#{lastSubmittedLead.id}</span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 px-4">
                    <span className="text-slate-400">Client Name:</span>
                    <span className="col-span-2 font-semibold text-white">{lastSubmittedLead.name}</span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 px-4 bg-slate-950/40">
                    <span className="text-slate-400">Email Address:</span>
                    <span className="col-span-2 font-mono text-slate-300">{lastSubmittedLead.email}</span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 px-4">
                    <span className="text-slate-400">Contact Telephone:</span>
                    <span className="col-span-2 font-mono font-bold text-blue-400">{lastSubmittedLead.phone}</span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 px-4 bg-slate-950/40">
                    <span className="text-slate-400">Property Postcode:</span>
                    <span className="col-span-2 font-mono font-semibold text-white">{lastSubmittedLead.postcode}</span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 px-4">
                    <span className="text-slate-400">Deposit Paid:</span>
                    <span className="col-span-2 font-bold text-white">£{lastSubmittedLead.depositAmount.toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 px-4 bg-slate-950/40">
                    <span className="text-slate-400">Protection Status:</span>
                    <span className="col-span-2 font-medium text-amber-300">
                      {lastSubmittedLead.protectionStatus === 'no'
                        ? 'Unprotected (Statutory 3x Penalty Eligible)'
                        : lastSubmittedLead.protectionStatus === 'late'
                        ? 'Protected Late (Over 30-day statutory window)'
                        : 'Requires Forensic Scheme Search'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 px-4 bg-emerald-950/20 border-l-2 border-emerald-500">
                    <span className="text-emerald-400 font-semibold">Est. Compensation:</span>
                    <span className="col-span-2 font-black text-emerald-400 text-sm">
                      £{lastSubmittedLead.minComp.toLocaleString()} – £{lastSubmittedLead.maxComp.toLocaleString()}*
                    </span>
                  </div>
                  {lastSubmittedLead.message && (
                    <div className="grid grid-cols-3 p-2.5 px-4 bg-slate-950/40">
                      <span className="text-slate-400">Client Note:</span>
                      <span className="col-span-2 text-slate-300 italic">"{lastSubmittedLead.message}"</span>
                    </div>
                  )}
                  <div className="grid grid-cols-3 p-2.5 px-4">
                    <span className="text-slate-400">Submission Date:</span>
                    <span className="col-span-2 text-slate-400">{lastSubmittedLead.submittedAt}</span>
                  </div>
                </div>
              </div>

              {/* What Happens Next in Email */}
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-white text-xs">What Happens Next:</div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                  <li><strong>Free Phone Consultation:</strong> Our legal specialist will call you on {lastSubmittedLead.phone} to confirm your tenancy records.</li>
                  <li><strong>Official Scheme Audit:</strong> We audit all three government-backed schemes (DPS, TDS, MyDeposits) to verify your landlord's breach.</li>
                  <li><strong>100% No Win No Fee:</strong> Our partner SRA-regulated solicitors pursue your compensation with zero financial risk to you.</li>
                </ol>
              </div>

              {/* Direct Help Info */}
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row justify-between gap-2">
                <div>
                  Freephone: <strong className="text-white">{cms.contactPhone || '0800 048 5321'}</strong>
                </div>
                <div>
                  Email: <strong className="text-white">{cms.contactEmail || 'claims@mydeposithero.co.uk'}</strong>
                </div>
                <div>
                  London: <span className="text-slate-300">{cms.officeAddress || '124 City Road, EC1V 2NX'}</span>
                </div>
              </div>

              {/* SRA Disclaimer */}
              <div className="text-[10px] text-slate-500 text-center leading-normal pt-1">
                {cms.legalDisclaimer || 'Deposit Hero is a dedicated legal intake portal working alongside SRA-regulated solicitors in England and Wales. 100% No Win No Fee agreements are subject to solicitor assessment.'}
              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Copy</span>
              </button>

              <button
                type="button"
                onClick={() => setShowEmailPreview(false)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
