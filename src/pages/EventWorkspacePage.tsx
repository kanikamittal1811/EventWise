import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Wallet,
  Sparkles,
  Store,
  CheckSquare,
  Palette,
  FileText,
  Clock,
  Plus,
  Trash2,
  Copy,
  Check,
  Send,
  MessageSquare,
} from 'lucide-react';
import { useEvent } from '../hooks/useEvent';
import { useBudget } from '../hooks/useBudget';
import { useVendors } from '../hooks/useVendors';
import { useTasks } from '../hooks/useTasks';
import { useGuests } from '../hooks/useGuests';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { formatDate, formatCurrency, getDaysUntil } from '../utils/formatters';

// Module Components
import { BudgetOverview } from '../components/budget/BudgetOverview';
import { CategoryList } from '../components/budget/CategoryList';
import { ExpenseTracker } from '../components/budget/ExpenseTracker';
import { AiBudgetOptimizer } from '../components/budget/AiBudgetOptimizer';
import { VendorList } from '../components/vendors/VendorList';
import { VendorFormModal } from '../components/vendors/VendorFormModal';
import { TaskList } from '../components/tasks/TaskList';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import { AiTaskGenerator } from '../components/tasks/AiTaskGenerator';
import { GuestList } from '../components/guests/GuestList';
import { GuestFormModal } from '../components/guests/GuestFormModal';
import { RsvpSummary } from '../components/guests/RsvpSummary';
import { MoodboardGrid } from '../components/creative-studio/MoodboardGrid';
import { ImageUploader } from '../components/creative-studio/ImageUploader';
import { AiConceptGenerator } from '../components/creative-studio/AiConceptGenerator';
import { ChatDrawer } from '../components/ai-assistant/ChatDrawer';
import { AiService } from '../services/gemini/aiService';
import { EventService } from '../services/event/eventService';
import { Vendor } from '../types/vendor';
import { Task } from '../types/task';
import { Guest } from '../types/guest';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';

export const EventWorkspacePage: React.FC = () => {
  const { tab = 'overview' } = useParams<{ tab?: string }>();
  const { event, budgetSummary, guestSummary, taskProgress, deleteEvent } = useEvent();
  const { addExpense, addCategory, currency } = useBudget();
  const { addVendor, updateVendor } = useVendors();
  const { addTask, updateTask } = useTasks();
  const { addGuest, updateGuest } = useGuests();

  // Assistant Drawer State
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Modals State
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAiOptimizer, setShowAiOptimizer] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAiTaskGen, setShowAiTaskGen] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [showFunctionModal, setShowFunctionModal] = useState(false);

  // Function Modal Fields
  const [functionName, setFunctionName] = useState('');
  const [functionDate, setFunctionDate] = useState('');
  const [functionTime, setFunctionTime] = useState('');
  const [functionVenue, setFunctionVenue] = useState('');

  // Category Modal Fields
  const [categoryName, setCategoryName] = useState('');
  const [categoryAmount, setCategoryAmount] = useState(0);

  // Expense Modal Fields
  const [expTitle, setExpTitle] = useState('');
  const [expCatId, setExpCatId] = useState('');
  const [expAmount, setExpAmount] = useState(0);
  const [expPaid, setExpPaid] = useState(0);
  const [expStatus, setExpStatus] = useState<'pending' | 'partial' | 'paid'>('pending');

  // Invitation state
  const [invitationGenerating, setInvitationGenerating] = useState(false);
  const [generatedInvitation, setGeneratedInvitation] = useState<any>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  if (!event) return null;

  const countdown = getDaysUntil(event.eventDate);
  const functionsList = event.functions ? Object.values(event.functions) : [];

  const handleAddFunction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!functionName || !functionDate) return;
    await EventService.addEventFunction(event.id, {
      name: functionName,
      date: functionDate,
      startTime: functionTime,
      venue: functionVenue,
    });
    setFunctionName('');
    setFunctionDate('');
    setShowFunctionModal(false);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName) return;
    await addCategory({
      name: categoryName,
      allocatedAmount: categoryAmount,
    });
    setCategoryName('');
    setCategoryAmount(0);
    setShowAddCategory(false);
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle || !expCatId || expAmount <= 0) return;
    await addExpense({
      title: expTitle,
      categoryId: expCatId,
      amount: expAmount,
      paidAmount: expPaid,
      status: expStatus,
    });
    setExpTitle('');
    setExpAmount(0);
    setExpPaid(0);
    setShowAddExpense(false);
  };

  const handleGenerateInvitation = async () => {
    setInvitationGenerating(true);
    try {
      const inv = await AiService.generateInvitation({
        eventName: event.name,
        category: event.category,
        date: formatDate(event.eventDate),
        venue: event.location,
        hosts: 'The Family',
      });
      setGeneratedInvitation(inv);
    } catch (err) {
      console.error(err);
    } finally {
      setInvitationGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header Card */}
      <div className="bg-white rounded-3xl border border-charcoal-100 p-6 shadow-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="primary" size="md">
              {event.category.replace('_', ' ')}
            </Badge>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                countdown.isPast
                  ? 'bg-charcoal-100 text-charcoal-600'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {countdown.label}
            </span>
            <span className="text-xs text-charcoal-400 capitalize">
              • Status: {event.status}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal">
            {event.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-charcoal-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" /> {formatDate(event.eventDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" /> {event.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary" /> {event.guestCount} Guests
            </span>
            <span className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-primary" /> {formatCurrency(event.totalBudget, currency)} Budget
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => setIsChatOpen(true)}
            variant="accent"
            size="sm"
            icon={Sparkles}
            className="shadow-sm shadow-accent/20"
          >
            Ask AI Copilot
          </Button>
          <Button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
                deleteEvent();
              }
            }}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Workspace Tabs Content */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Top Quick Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <span className="text-xs font-semibold text-charcoal-500 uppercase">Budget Spend</span>
              <div className="text-xl font-serif font-bold text-charcoal mt-1 truncate">
                {formatCurrency(budgetSummary.totalSpent, currency)}
              </div>
              <span className="text-xs text-charcoal-400 mt-1 block">
                of {formatCurrency(event.totalBudget, currency)} ({budgetSummary.percentageUsed}%)
              </span>
            </Card>

            <Card className="p-4">
              <span className="text-xs font-semibold text-charcoal-500 uppercase">RSVPs Confirmed</span>
              <div className="text-xl font-serif font-bold text-emerald-700 mt-1 truncate">
                {guestSummary.totalAttending}
              </div>
              <span className="text-xs text-charcoal-400 mt-1 block">
                {guestSummary.totalPending} awaiting response
              </span>
            </Card>

            <Card className="p-4">
              <span className="text-xs font-semibold text-charcoal-500 uppercase">Checklist Progress</span>
              <div className="text-xl font-serif font-bold text-primary mt-1 truncate">
                {taskProgress.percentage}%
              </div>
              <span className="text-xs text-charcoal-400 mt-1 block">
                {taskProgress.completed} of {taskProgress.total} completed
              </span>
            </Card>

            <Card className="p-4">
              <span className="text-xs font-semibold text-charcoal-500 uppercase">Celebration Days</span>
              <div className="text-xl font-serif font-bold text-accent mt-1 truncate">
                {Math.max(1, functionsList.length)} {functionsList.length > 1 ? 'Functions' : 'Day'}
              </div>
              <span className="text-xs text-charcoal-400 mt-1 block">
                {functionsList.length} sub-events scheduled
              </span>
            </Card>
          </div>

          {/* Functions / Multi-Day Schedule */}
          <div className="bg-white rounded-3xl border border-charcoal-100 p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-serif font-bold text-charcoal">
                  Multi-Day Functions &amp; Itinerary
                </h3>
                <p className="text-xs text-charcoal-400 mt-0.5">
                  Schedule individual ceremonies, cocktails, or reception banquets
                </p>
              </div>
              <Button
                onClick={() => setShowFunctionModal(true)}
                variant="outline"
                size="sm"
                icon={Plus}
              >
                Add Function
              </Button>
            </div>

            {functionsList.length === 0 ? (
              <div className="p-6 text-center text-xs text-charcoal-400 bg-background-subtle rounded-2xl border border-charcoal-100">
                Main celebration on {formatDate(event.eventDate)}. Add individual functions (e.g. Sangeet, Mehendi, Cocktails) to break down timelines.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {functionsList.map((fn) => (
                  <div
                    key={fn.id}
                    className="p-4 rounded-2xl bg-background-subtle/70 border border-charcoal-100 relative group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-semibold text-charcoal">{fn.name}</h4>
                        <button
                          type="button"
                          onClick={() => EventService.deleteEventFunction(event.id, fn.id)}
                          aria-label={`Delete schedule function ${fn.name}`}
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-charcoal-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded p-0.5 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="mt-2 text-xs text-charcoal-500 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span>{formatDate(fn.date)}</span>
                        </div>
                        {fn.startTime && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span>{fn.startTime}</span>
                          </div>
                        )}
                        {fn.venue && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            <span className="truncate">{fn.venue}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to={`/events/${event.id}/budget`}
              className="p-5 rounded-2xl bg-white border border-charcoal-100 shadow-subtle hover:shadow-card transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-serif font-bold text-sm text-charcoal">Budget &amp; Spend</span>
                <Wallet className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs text-charcoal-500">
                Deterministic calculations, vendor payment tracking, and AI budget optimization.
              </p>
            </Link>

            <Link
              to={`/events/${event.id}/vendors`}
              className="p-5 rounded-2xl bg-white border border-charcoal-100 shadow-subtle hover:shadow-card transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-serif font-bold text-sm text-charcoal">Vendor Management</span>
                <Store className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-charcoal-500">
                Track quotations, negotiate price savings, contracts, and contacts.
              </p>
            </Link>

            <Link
              to={`/events/${event.id}/creative`}
              className="p-5 rounded-2xl bg-white border border-charcoal-100 shadow-subtle hover:shadow-card transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-serif font-bold text-sm text-charcoal">Creative Studio</span>
                <Palette className="w-4 h-4 text-accent" />
              </div>
              <p className="text-xs text-charcoal-500">
                Upload &amp; compress moodboard photos strictly into Realtime Database Base64 storage.
              </p>
            </Link>
          </div>
        </div>
      )}

      {/* AI Planner Tab */}
      {tab === 'ai' && (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-r from-primary-900 to-primary-800 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-accent-300 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-accent-400" />
                <span>Central Intelligence Engine</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold">
                GenAI Planning Assistant for {event.name}
              </h2>
              <p className="text-xs sm:text-sm text-white/80 max-w-xl mt-1">
                Your copilot maintains full real-time awareness of your {currency} {event.totalBudget.toLocaleString()} budget, {event.guestCount} guests, and milestone checklists.
              </p>
            </div>
            <Button
              onClick={() => setIsChatOpen(true)}
              variant="accent"
              size="lg"
              icon={Sparkles}
              className="shrink-0"
            >
              Open AI Chat Copilot
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="p-6 bg-white rounded-3xl border border-charcoal-100 shadow-subtle space-y-4">
              <h3 className="text-base font-serif font-bold text-charcoal">
                Interactive AI Generators
              </h3>
              <div className="space-y-2.5">
                <div
                  onClick={() => setShowAiOptimizer(true)}
                  className="p-4 rounded-2xl bg-background-subtle hover:bg-primary-50 cursor-pointer border border-charcoal-100 transition-colors"
                >
                  <div className="font-semibold text-xs text-charcoal flex items-center justify-between">
                    <span>✨ AI Budget Optimizer</span>
                    <span className="text-primary text-[11px]">Launch →</span>
                  </div>
                  <p className="text-xs text-charcoal-500 mt-1">
                    Rebalance category allocations to hit savings targets without losing quality.
                  </p>
                </div>

                <div
                  onClick={() => setShowAiTaskGen(true)}
                  className="p-4 rounded-2xl bg-background-subtle hover:bg-primary-50 cursor-pointer border border-charcoal-100 transition-colors"
                >
                  <div className="font-semibold text-xs text-charcoal flex items-center justify-between">
                    <span>📋 AI Milestone Task Generator</span>
                    <span className="text-primary text-[11px]">Launch →</span>
                  </div>
                  <p className="text-xs text-charcoal-500 mt-1">
                    Auto-generate deadline checklist tailored specifically to your event category and dates.
                  </p>
                </div>
              </div>
            </div>

            {/* Design & Concept preview */}
            <AiConceptGenerator />
          </div>
        </div>
      )}

      {/* Budget Tab */}
      {tab === 'budget' && (
        <div className="space-y-6">
          <BudgetOverview
            onOpenAddExpense={() => setShowAddExpense(true)}
            onOpenAddCategory={() => setShowAddCategory(true)}
            onOpenAiOptimizer={() => setShowAiOptimizer(true)}
          />

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-serif font-bold text-charcoal">
                Category Allocations
              </h3>
              <button
                onClick={() => setShowAddCategory(true)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                + Add Category
              </button>
            </div>
            <CategoryList onEditCategory={() => {}} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-serif font-bold text-charcoal">
                Recorded Expenses &amp; Invoices
              </h3>
              <button
                onClick={() => setShowAddExpense(true)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                + Record Expense
              </button>
            </div>
            <ExpenseTracker onEditExpense={() => {}} />
          </div>
        </div>
      )}

      {/* Vendors Tab */}
      {tab === 'vendors' && (
        <VendorList
          onAddNew={() => {
            setSelectedVendor(null);
            setShowVendorModal(true);
          }}
          onEdit={(vendor) => {
            setSelectedVendor(vendor);
            setShowVendorModal(true);
          }}
          onCustomizeCatalogVendor={(catalogVendor) => {
            setSelectedVendor({
              id: '',
              name: catalogVendor.name,
              category: catalogVendor.category,
              quotation: catalogVendor.quotation,
              negotiatedPrice: catalogVendor.negotiatedPrice,
              bookingStatus: 'shortlisted',
              paymentStatus: 'unpaid',
              contactName: catalogVendor.contactName,
              phone: catalogVendor.phone,
              email: catalogVendor.email,
              website: catalogVendor.website,
              address: catalogVendor.address,
              notes: catalogVendor.description,
              rating: Math.round(catalogVendor.rating),
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
            setShowVendorModal(true);
          }}
        />
      )}

      {/* Tasks Tab */}
      {tab === 'tasks' && (
        <TaskList
          onAddNew={() => {
            setSelectedTask(null);
            setShowTaskModal(true);
          }}
          onEdit={(task) => {
            setSelectedTask(task);
            setShowTaskModal(true);
          }}
          onOpenAiGenerator={() => setShowAiTaskGen(true)}
        />
      )}

      {/* Guests Tab */}
      {tab === 'guests' && (
        <div className="space-y-6">
          <RsvpSummary />
          <GuestList
            onAddNew={() => {
              setSelectedGuest(null);
              setShowGuestModal(true);
            }}
            onEdit={(guest) => {
              setSelectedGuest(guest);
              setShowGuestModal(true);
            }}
          />
        </div>
      )}

      {/* Creative Studio Tab */}
      {tab === 'creative' && (
        <div className="space-y-6">
          <ImageUploader />
          <AiConceptGenerator />
          <div>
            <h3 className="text-base font-serif font-bold text-charcoal mb-3">
              Visual Moodboard &amp; Decor References
            </h3>
            <MoodboardGrid />
          </div>
        </div>
      )}

      {/* Documents & Invitations Tab */}
      {tab === 'documents' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-charcoal-100 p-6 shadow-subtle space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-serif font-bold text-charcoal">
                  AI Invitation &amp; Message Generator
                </h3>
                <p className="text-xs text-charcoal-400 mt-0.5">
                  Generate bespoke formal cards and WhatsApp save-the-dates for your celebration
                </p>
              </div>
              <Button
                onClick={handleGenerateInvitation}
                loading={invitationGenerating}
                icon={Sparkles}
                size="sm"
              >
                Generate Invitation Copy
              </Button>
            </div>

            {generatedInvitation ? (
              <div className="pt-4 border-t border-charcoal-100 space-y-4">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-background-subtle via-white to-primary-50/30 border border-charcoal-200 text-center max-w-xl mx-auto shadow-sm space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary-600 block">
                    {generatedInvitation.headline}
                  </span>
                  <p className="text-xs font-serif italic text-charcoal-600">
                    {generatedInvitation.hostIntro}
                  </p>
                  <h4 className="text-xl font-serif font-bold text-charcoal">
                    {event.name}
                  </h4>
                  <p className="text-xs text-charcoal-600 max-w-md mx-auto leading-relaxed">
                    {generatedInvitation.eventBody}
                  </p>
                  <div className="py-2 border-y border-charcoal-100 text-xs font-semibold text-charcoal">
                    {generatedInvitation.dateAndVenue}
                  </div>
                  <p className="text-[11px] text-charcoal-500">
                    {generatedInvitation.dressCodeNote}
                  </p>
                  <p className="text-xs font-serif text-charcoal-700 italic">
                    {generatedInvitation.rsvpClosing}
                  </p>
                </div>

                {/* WhatsApp Short Message */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 max-w-xl mx-auto flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-emerald-900 block mb-1">
                      📱 Quick WhatsApp / SMS Copy:
                    </span>
                    <p className="text-emerald-800">{generatedInvitation.shortSmsVersion}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedInvitation.shortSmsVersion);
                      setCopiedInvite(true);
                      setTimeout(() => setCopiedInvite(false), 2000);
                    }}
                    aria-label={copiedInvite ? 'Copied invitation text to clipboard' : 'Copy short invitation text to clipboard'}
                    className="p-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-100 border border-emerald-200 shrink-0 font-medium text-[11px] flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {copiedInvite ? <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
                    <span>{copiedInvite ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-charcoal-600">
                Click &quot;Generate Invitation Copy&quot; to draft customizable formal letters and WhatsApp announcements.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Copilot Trigger */}
      <button
        type="button"
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-primary text-white p-3.5 rounded-full shadow-float hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        aria-label="Open EventWise AI Copilot"
        title="Open EventWise AI Copilot"
      >
        <Sparkles className="w-5 h-5 text-accent-400" aria-hidden="true" />
        <span className="text-xs font-bold hidden sm:inline">AI Copilot</span>
      </button>

      {/* Context-aware Chat Drawer */}
      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Vendor Form Modal */}
      <VendorFormModal
        isOpen={showVendorModal}
        onClose={() => setShowVendorModal(false)}
        initialData={selectedVendor}
        onSubmit={async (data) => {
          if (selectedVendor && selectedVendor.id) {
            await updateVendor(selectedVendor.id, data);
          } else {
            await addVendor(data);
          }
        }}
      />

      {/* Task Form Modal */}
      <TaskFormModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        initialData={selectedTask}
        onSubmit={async (data) => {
          if (selectedTask) {
            await updateTask(selectedTask.id, data);
          } else {
            await addTask(data);
          }
        }}
      />

      {/* Guest Form Modal */}
      <GuestFormModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        initialData={selectedGuest}
        onSubmit={async (data) => {
          if (selectedGuest) {
            await updateGuest(selectedGuest.id, data);
          } else {
            await addGuest(data);
          }
        }}
      />

      {/* AI Task Generator Modal */}
      <AiTaskGenerator
        isOpen={showAiTaskGen}
        onClose={() => setShowAiTaskGen(false)}
      />

      {/* AI Budget Optimizer Modal */}
      <AiBudgetOptimizer
        isOpen={showAiOptimizer}
        onClose={() => setShowAiOptimizer(false)}
      />

      {/* Function Modal */}
      <Modal
        isOpen={showFunctionModal}
        onClose={() => setShowFunctionModal(false)}
        title="Add Event Function"
        description="For multi-day or multi-stage celebrations"
      >
        <form onSubmit={handleAddFunction} className="space-y-4">
          <Input
            label="Function Name"
            placeholder="e.g. Sangeet & Cocktails"
            value={functionName}
            onChange={(e) => setFunctionName(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              value={functionDate}
              onChange={(e) => setFunctionDate(e.target.value)}
              required
            />
            <Input
              label="Timing"
              placeholder="e.g. 7:00 PM - 11:30 PM"
              value={functionTime}
              onChange={(e) => setFunctionTime(e.target.value)}
            />
          </div>
          <Input
            label="Venue / Location"
            placeholder="e.g. Poolside Lawn"
            value={functionVenue}
            onChange={(e) => setFunctionVenue(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="outline" onClick={() => setShowFunctionModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Function</Button>
          </div>
        </form>
      </Modal>

      {/* Category Modal */}
      <Modal
        isOpen={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        title="Add Budget Category"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Stage Production & AV"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />
          <Input
            label="Allocated Amount"
            type="number"
            value={categoryAmount}
            onChange={(e) => setCategoryAmount(Number(e.target.value))}
            required
          />
          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="outline" onClick={() => setShowAddCategory(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Category</Button>
          </div>
        </form>
      </Modal>

      {/* Expense Modal */}
      <Modal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        title="Record Expense"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4">
          <Input
            label="Description"
            placeholder="e.g. Venue Advance Deposit"
            value={expTitle}
            onChange={(e) => setExpTitle(e.target.value)}
            required
          />
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 tracking-wide uppercase mb-1.5">
              Category
            </label>
            <select
              value={expCatId}
              onChange={(e) => setExpCatId(e.target.value)}
              className="w-full bg-white border border-charcoal-200 text-charcoal text-sm rounded-xl p-2.5 focus:outline-none"
              required
            >
              <option value="">Select Category</option>
              {event.budget?.categories &&
                Object.values(event.budget.categories).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Total Cost"
              type="number"
              value={expAmount}
              onChange={(e) => setExpAmount(Number(e.target.value))}
              required
            />
            <Input
              label="Amount Paid So Far"
              type="number"
              value={expPaid}
              onChange={(e) => setExpPaid(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 tracking-wide uppercase mb-1.5">
              Payment Status
            </label>
            <select
              value={expStatus}
              onChange={(e) => setExpStatus(e.target.value as any)}
              className="w-full bg-white border border-charcoal-200 text-charcoal text-sm rounded-xl p-2.5 focus:outline-none"
            >
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Fully Paid</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="outline" onClick={() => setShowAddExpense(false)}>
              Cancel
            </Button>
            <Button type="submit">Record Expense</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

