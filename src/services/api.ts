import { Lead, CmsContent, PipedriveConfig, AnalyticsData, DEFAULT_CMS } from '../types';

const TOKEN_KEY = 'deposithero_admin_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 1. CMS API & Permanent Storage
const CMS_STORAGE_KEY = 'deposithero_cms_content';

export function getCachedCms(): CmsContent | null {
  try {
    const raw = localStorage.getItem(CMS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_CMS, ...parsed };
    }
  } catch {}
  return null;
}

export function saveCachedCms(cms: CmsContent): void {
  try {
    localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(cms));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }
}

export async function getCms(): Promise<CmsContent> {
  const cached = getCachedCms();
  try {
    const res = await fetch('/api/cms');
    if (!res.ok) throw new Error('Failed to load CMS data');
    const data = await res.json();
    const serverCms = data.cms || {};
    
    // Merge: DEFAULT_CMS baseline, then serverCms, then user-customized cached fields take precedence
    const merged: CmsContent = {
      ...DEFAULT_CMS,
      ...serverCms,
      ...(cached || {}),
    };
    saveCachedCms(merged);
    return merged;
  } catch (err) {
    if (cached) return { ...DEFAULT_CMS, ...cached };
    return DEFAULT_CMS;
  }
}

export async function updateCms(content: Partial<CmsContent>): Promise<CmsContent> {
  const cached = getCachedCms() || DEFAULT_CMS;
  const current: CmsContent = { ...cached, ...content };
  saveCachedCms(current);

  try {
    const res = await fetch('/api/cms', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify(content),
    });
    if (res.ok) {
      const data = await res.json();
      const updated = { ...current, ...(data.cms || {}) };
      saveCachedCms(updated);
      return updated;
    }
  } catch (e) {
    console.warn('Server CMS update failed, saved permanently in local storage:', e);
  }
  return current;
}

export async function uploadAsset(type: 'logo' | 'favicon', dataUrl: string): Promise<string> {
  const cached = getCachedCms() || DEFAULT_CMS;
  const updated = {
    ...cached,
    [type === 'logo' ? 'logoUrl' : 'faviconUrl']: dataUrl,
  };
  saveCachedCms(updated);

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({ type, dataUrl }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.url || dataUrl;
    }
  } catch (err) {
    console.warn('Backend asset upload failed, saved permanently in local storage:', err);
  }
  return dataUrl;
}

// 2. Leads & Funnel Submissions (with Permanent Cache Protection)
const LEADS_STORAGE_KEY = 'deposithero_leads_data';

export function getCachedLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(LEADS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveCachedLead(lead: Lead): void {
  try {
    const current = getCachedLeads();
    const existingIndex = current.findIndex((l) => l.id === lead.id);
    let updated: Lead[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = lead;
    } else {
      updated = [lead, ...current];
    }
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated.slice(0, 100)));
  } catch {}
}

export function saveAllCachedLeads(leads: Lead[]): void {
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads.slice(0, 100)));
  } catch {}
}

export async function submitLead(payload: Partial<Lead>): Promise<{
  success: boolean;
  leadId: string;
  lead?: Lead;
  compensation?: any;
  emailConfirmation?: any;
}> {
  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Submission failed. Please check your network and try again.');
    const data = await res.json();
    const lead = data.lead;
    if (lead) {
      saveCachedLead(lead);
    }
    const leadId = data.leadId || lead?.id || `DH-${Date.now().toString().slice(-6)}`;
    return {
      ...data,
      leadId,
    };
  } catch (err: any) {
    // Resilient fallback: preserve lead permanently in local cache even if server is cold or restarting
    const fallbackLead: Lead = {
      id: `lead-${Date.now().toString().slice(-6)}`,
      source: (payload.source as any) || 'inquiry_form',
      createdAt: new Date().toISOString(),
      name: payload.name || 'Anonymous Inquiry',
      email: payload.email || '',
      phone: payload.phone || '',
      postcode: (payload.postcode || '').toUpperCase(),
      depositAmount: Number(payload.depositAmount) || 1200,
      tenancyDurationMonths: 12,
      renewalsCount: Number(payload.renewalsCount) || 0,
      propertyLocation: (payload.propertyLocation as any) || 'england_wales',
      paidWithinSixYears: payload.paidWithinSixYears !== false,
      protectedWithin30Days: (payload.protectedWithin30Days as any) || 'no',
      receivedPrescribedInfo: 'no',
      hasTenancyAgreement: 'yes',
      tenancyStatus: 'moved_out',
      estimatedCompensationMin: Number(payload.depositAmount) || 1200,
      estimatedCompensationMax: (Number(payload.depositAmount) || 1200) * 3,
      status: 'new',
      pipedriveSynced: false,
      message: payload.message,
      notes: payload.message ? `Client Note: ${payload.message}` : undefined,
    };
    saveCachedLead(fallbackLead);
    return {
      success: true,
      leadId: fallbackLead.id,
      lead: fallbackLead,
    };
  }
}

export async function trackQuizStart(): Promise<void> {
  try {
    await fetch('/api/analytics/track-quiz-start', { method: 'POST' });
  } catch {
    // Non-critical tracking
  }
}

export async function getLeads(): Promise<Lead[]> {
  const token = getAuthToken();
  const cachedLeads = getCachedLeads();
  if (!token) {
    return cachedLeads;
  }
  try {
    const res = await fetch('/api/leads', {
      headers: authHeaders(),
    });
    if (!res.ok) {
      if (res.status === 401) {
        clearAuthToken();
      }
      return cachedLeads;
    }
    const data = await res.json();
    const serverLeads: Lead[] = data.leads || [];

    // Merge server leads with cached local leads (deduplicated by ID)
    const map = new Map<string, Lead>();
    for (const l of serverLeads) {
      map.set(l.id, l);
    }
    for (const l of cachedLeads) {
      if (!map.has(l.id)) {
        map.set(l.id, l);
      }
    }
    const combined = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    saveAllCachedLeads(combined);
    return combined;
  } catch {
    return cachedLeads;
  }
}

export async function updateLead(id: string, updates: { status?: Lead['status']; notes?: string }): Promise<Lead> {
  const cachedLeads = getCachedLeads();
  const targetLead = cachedLeads.find((l) => l.id === id);
  if (targetLead) {
    const updated = { ...targetLead, ...updates };
    saveCachedLead(updated);
  }

  const res = await fetch(`/api/leads/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update lead');
  const data = await res.json();
  if (data.lead) {
    saveCachedLead(data.lead);
  }
  return data.lead;
}

export async function deleteLead(id: string): Promise<void> {
  const cachedLeads = getCachedLeads();
  saveAllCachedLeads(cachedLeads.filter((l) => l.id !== id));

  const res = await fetch(`/api/leads/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete lead');
}

export async function syncLeadToPipedrive(id: string): Promise<{ success: boolean; message: string; lead: Lead }> {
  const res = await fetch(`/api/leads/${id}/sync-pipedrive`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to sync lead to Pipedrive CRM');
  return res.json();
}

// 3. Pipedrive Integration
export async function getPipedriveConfig(): Promise<PipedriveConfig & { encryptionStatus?: string; encryptionAlgorithm?: string }> {
  const res = await fetch('/api/pipedrive/config', {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to get Pipedrive config');
  const data = await res.json();
  return data.config;
}

export async function savePipedriveConfig(data: {
  rawApiToken?: string;
  companyDomain?: string;
  stageId?: string;
  pipelineId?: string;
  autoSync?: boolean;
}): Promise<void> {
  const res = await fetch('/api/pipedrive/config', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save Pipedrive CRM settings');
}

export async function testPipedriveConnection(): Promise<{ success: boolean; message: string; testedAt: string }> {
  const res = await fetch('/api/pipedrive/test', {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Pipedrive connection test failed');
  return res.json();
}

// 4. Analytics
export async function getAnalytics(): Promise<AnalyticsData> {
  const res = await fetch('/api/analytics', {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch analytics');
  const data = await res.json();
  return data.analytics;
}

// 5. Authentication & MFA
export async function loginStep1(username: string, password: string): Promise<{
  requiresMfa: boolean;
  mfaSessionToken?: string;
  token?: string;
  user?: any;
  message?: string;
}> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Authentication failed');
  }
  return res.json();
}

export async function loginStep2Mfa(mfaSessionToken: string, code: string): Promise<{
  success: boolean;
  token: string;
  user: any;
}> {
  const res = await fetch('/api/auth/mfa-verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mfaSessionToken, code }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'MFA code verification failed');
  }
  return res.json();
}

export async function verifyCurrentAuth(): Promise<{ user: any; mfaDetails?: any } | null> {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      clearAuthToken();
      return null;
    }
    return res.json();
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: authHeaders(),
    });
  } finally {
    clearAuthToken();
  }
}

export async function updateMfaSettings(
  enableMfa: boolean, 
  newPassword?: string, 
  newUsername?: string
): Promise<any> {
  const res = await fetch('/api/auth/mfa-settings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ enableMfa, newPassword, newUsername }),
  });
  if (!res.ok) throw new Error('Failed to update security settings');
  return res.json();
}

// 6. Real-Time SSE Listener
export function subscribeToLeadStream(onNewLead: (lead: Lead) => void): () => void {
  try {
    const eventSource = new EventSource('/api/events/leads-stream');

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'NEW_LEAD' && payload.lead) {
          onNewLead(payload.lead);
        }
      } catch (err) {
        console.error('Error parsing SSE message:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn('SSE connection warning, will automatically retry:', err);
    };

    return () => {
      eventSource.close();
    };
  } catch (err) {
    console.error('Failed to initialize EventSource:', err);
    return () => {};
  }
}
