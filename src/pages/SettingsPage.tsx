import React from 'react';
import { ShieldCheck, Database, Sparkles, User, Image as ImageIcon, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/common/Card';

export const SettingsPage: React.FC = () => {
  const { user, isFirebaseConfigured } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal">Workspace Settings</h1>
        <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
          Review system configuration, persistence layers, and security policies.
        </p>
      </div>

      {/* User Profile Card */}
      <Card className="p-6 bg-white space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary flex items-center justify-center font-bold text-base">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-charcoal">
              {user?.displayName || 'Planner Account'}
            </h3>
            <p className="text-xs text-charcoal-500">{user?.email}</p>
          </div>
        </div>
      </Card>

      {/* Architecture & Persistence Card */}
      <Card className="p-6 bg-white space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          <h3 className="text-base font-serif font-bold text-charcoal">
            Database &amp; Architecture Compliance
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-emerald-900 block">
                Firebase Realtime Database Persistence
              </span>
              <span className="text-emerald-700">
                {isFirebaseConfigured
                  ? 'Connected to configured Realtime Database instance with atomic location syncing.'
                  : 'Running with local reactive state and demo storage fallback.'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-primary-50/70 border border-primary-200">
            <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-primary-900 block">
                Strict Image Storage Pipeline (NO Firebase Storage)
              </span>
              <span className="text-primary-700">
                All visual moodboard and reference images are downscaled to max 1600px, compressed client-side via Canvas API, and persisted strictly as Base64 data URLs under <code>/images/{'{imageId}'}</code> with an enforced 1 MB size limit.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-900 block">
                Secure Gemini AI Backend Layer
              </span>
              <span className="text-amber-700">
                Server-side execution keeps Gemini API keys secure. Frontend invokes validated JSON endpoints with Zod schema verification and deterministic financial math.
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

