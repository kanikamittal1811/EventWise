import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, AlertCircle, ShieldAlert } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useBudget } from '../../hooks/useBudget';
import { useEvent } from '../../hooks/useEvent';
import { AiService } from '../../services/gemini/aiService';
import { formatCurrency } from '../../utils/formatters';
import { AiBudgetOptimizationProposal } from '../../types/ai';

export const AiBudgetOptimizer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { event } = useEvent();
  const { summary, categories, expenses, currency, setTotalBudget, updateCategory } = useBudget();

  const [targetBudget, setTargetBudget] = useState(
    summary.totalBudget > 0 ? Math.round(summary.totalBudget * 0.9) : 1000000
  );
  const [constraintNotes, setConstraintNotes] = useState(
    'Reduce budget by 10% without compromising photography or catering'
  );
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<AiBudgetOptimizationProposal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const handleGenerateProposal = async () => {
    if (!event) return;
    setLoading(true);
    setError(null);

    try {
      const res = await AiService.optimizeBudget({
        currentBudget: summary.totalBudget,
        targetBudget: Number(targetBudget),
        categories: event.budget?.categories || {},
        expenses: event.budget?.expenses || {},
        constraintNotes,
        currency,
      });
      setProposal(res);
    } catch (err: any) {
      setError(err.message || 'Failed to generate optimization plan');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyChanges = async () => {
    if (!proposal || !event) return;
    setApplying(true);

    try {
      // 1. Update total budget deterministically
      await setTotalBudget(proposal.targetBudget);

      // 2. Update category allocations with confirmation
      for (const change of proposal.proposedChanges) {
        const cat = categories.find((c) => c.name.toLowerCase() === change.category.toLowerCase());
        if (cat) {
          await updateCategory(cat.id, {
            allocatedAmount: change.proposedAllocation,
          });
        }
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to apply budget changes');
    } finally {
      setApplying(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Budget Optimizer"
      description="Analyze real event spending and intelligently optimize allocations"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {!proposal ? (
          <>
            <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-accent-500 shrink-0" />
              <p className="text-xs text-primary-900 leading-relaxed">
                Tell the AI your new target budget and any constraints (e.g. &quot;Protect catering &amp; venue&quot;, or &quot;Trim decorative staging&quot;). It analyzes current expenses and calculates safe adjustments.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 tracking-wide uppercase mb-1.5">
                  Current Total Budget
                </label>
                <div className="font-serif font-bold text-lg text-charcoal p-2.5 bg-background-subtle rounded-xl border border-charcoal-200">
                  {formatCurrency(summary.totalBudget, currency)}
                </div>
              </div>

              <Input
                label="Target Budget"
                type="number"
                value={targetBudget}
                onChange={(e) => setTargetBudget(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 tracking-wide uppercase mb-1.5">
                Constraints &amp; Priorities
              </label>
              <textarea
                value={constraintNotes}
                onChange={(e) => setConstraintNotes(e.target.value)}
                placeholder="e.g. Reduce budget by ₹2 Lakh without compromising catering or photography."
                className="w-full bg-white border border-charcoal-200 text-charcoal text-sm rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary min-h-[80px]"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-3 flex justify-end gap-3 border-t border-charcoal-100">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleGenerateProposal}
                loading={loading}
                icon={Sparkles}
              >
                Analyze &amp; Propose Reallocations
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 mb-1">
                <span>Proposed Target Budget</span>
                <span className="font-serif text-base font-bold text-emerald-900">
                  {formatCurrency(proposal.targetBudget, currency)}
                </span>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed mt-1">
                {proposal.summaryAdvice}
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-charcoal-600 mb-2">
                Proposed Category Adjustments
              </h5>
              <div className="space-y-2">
                {proposal.proposedChanges.map((change, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-white border border-charcoal-100 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-charcoal">{change.category}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            change.riskLevel === 'low'
                              ? 'bg-emerald-50 text-emerald-700'
                              : change.riskLevel === 'medium'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {change.riskLevel} risk
                        </span>
                      </div>
                      <p className="text-xs text-charcoal-500 mt-0.5">{change.rationale}</p>
                    </div>

                    <div className="text-right sm:shrink-0 text-xs">
                      <div className="text-charcoal-400 line-through">
                        {formatCurrency(change.currentAllocation, currency)}
                      </div>
                      <div className="font-bold text-charcoal">
                        {formatCurrency(change.proposedAllocation, currency)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-charcoal-100">
              <button
                type="button"
                onClick={() => setProposal(null)}
                className="text-xs text-charcoal-500 hover:text-charcoal font-medium"
              >
                ← Back to Edit
              </button>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleApplyChanges}
                  loading={applying}
                  icon={Check}
                >
                  Confirm &amp; Apply Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

