import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, Wallet, CheckCircle, ArrowRight, ShieldCheck, Heart, Users, Star } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-accent-100 selection:text-accent-600">
      {/* Navigation */}
      <header className="border-b border-charcoal-100 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5 text-accent-400" />
            </div>
            <span className="font-serif font-bold text-xl text-charcoal tracking-tight">
              EventWise
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
                  Open Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Sign in with Google
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-xs font-semibold text-primary mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-accent-500" />
            <span>Next-Gen GenAI Event Intelligence</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-charcoal tracking-tight leading-[1.15]">
            Tell us what you&apos;re planning.{' '}
            <span className="text-primary italic font-normal block sm:inline">
              We&apos;ll plan everything else.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-charcoal-600 max-w-2xl mx-auto leading-relaxed">
            From royal destination weddings to milestone birthdays, EventWise orchestrates deterministic budgets, milestone timelines, vendor contracts, and AI-curated aesthetic moodboards.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={user ? '/dashboard' : '/signup'} className="w-full sm:w-auto">
              <Button size="lg" variant="primary" icon={Sparkles} className="w-full sm:w-auto shadow-lg shadow-primary/20">
                Start Planning Free
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Explore Demo Workspace
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-charcoal-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Firebase Realtime Sync
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-accent-500" /> Gemini Structured Plans
            </span>
            <span className="flex items-center gap-1">
              <Wallet className="w-4 h-4 text-primary" /> Deterministic Financials
            </span>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-white border border-charcoal-100 shadow-card hover:shadow-float transition-all">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6 text-accent-500" />
              </div>
              <h3 className="text-lg font-serif font-bold text-charcoal">Natural Language AI Creator</h3>
              <p className="text-sm text-charcoal-600 mt-2 leading-relaxed">
                Describe your dream event in plain language. Gemini structures complete multi-day schedules, vendor advice, and budget breakdowns.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-charcoal-100 shadow-card hover:shadow-float transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-charcoal">Deterministic Budget Manager</h3>
              <p className="text-sm text-charcoal-600 mt-2 leading-relaxed">
                Zero rounding hallucinations. Strict TypeScript financial calculations keep category allocations and actual payments balanced down to the penny.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-charcoal-100 shadow-card hover:shadow-float transition-all">
              <div className="w-12 h-12 rounded-2xl bg-accent-50 text-accent-500 flex items-center justify-center mb-5">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-charcoal">1 MB Base64 Creative Studio</h3>
              <p className="text-sm text-charcoal-600 mt-2 leading-relaxed">
                Curate visual moodboards and color palettes. All decor reference images are compressed client-side and saved to Realtime Database.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-charcoal-100 py-8 bg-background-subtle/50 text-center text-xs text-charcoal-400">
        <p>© 2026 EventWise SaaS Inc. Engineered with Google Gemini &amp; Firebase Realtime Database.</p>
      </footer>
    </div>
  );
};

