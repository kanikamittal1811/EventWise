import React, { useState } from 'react';
import { Mail, Check, Phone, Trash2, Edit2, Send, Users, Plus } from 'lucide-react';
import { useGuests } from '../../hooks/useGuests';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { Guest, RsvpStatus } from '../../types/guest';

export const GuestList: React.FC<{
  onAddNew: () => void;
  onEdit: (guest: Guest) => void;
}> = ({ onAddNew, onEdit }) => {
  const { guests, updateGuest, deleteGuest, toggleInvitationSent } = useGuests();
  const [filterRsvp, setFilterRsvp] = useState<string>('all');

  const filteredGuests = guests.filter((g) => {
    if (filterRsvp === 'all') return true;
    return g.rsvpStatus === filterRsvp;
  });

  return (
    <div className="space-y-4">
      {/* Filter and action toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-charcoal-100 shadow-subtle">
        <div
          role="group"
          aria-label="Filter guests by RSVP status"
          className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0"
        >
          {['all', 'attending', 'pending', 'declined', 'tentative'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterRsvp(status)}
              aria-pressed={filterRsvp === status}
              className={`px-3 py-1.5 rounded-xl font-semibold capitalize whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                filterRsvp === status
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-background-subtle text-charcoal-700 hover:bg-charcoal-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <Button onClick={onAddNew} variant="primary" size="sm" icon={Plus}>
          Add Guest
        </Button>
      </div>

      {filteredGuests.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No guests found"
          description="Start building your guest list, tracking invites, and counting headcounts."
          actionLabel="Add Guest"
          onAction={onAddNew}
          aiSuggestedPrompt="Draft a friendly WhatsApp invitation template for family and friends"
        />
      ) : (
        <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <caption className="sr-only">
                Guest list with RSVP status and invitation tracking
              </caption>
              <thead className="bg-background-subtle/80 border-b border-charcoal-100 text-charcoal-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="py-3.5 px-4">Guest Name</th>
                  <th scope="col" className="py-3.5 px-4">Category</th>
                  <th scope="col" className="py-3.5 px-4 text-center">Party Size</th>
                  <th scope="col" className="py-3.5 px-4">RSVP Status</th>
                  <th scope="col" className="py-3.5 px-4">Dietary Notes</th>
                  <th scope="col" className="py-3.5 px-4">Invite Sent</th>
                  <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {filteredGuests.map((guest) => {
                  const partySize = 1 + (Number(guest.plusOnes) || 0);

                  return (
                    <tr key={guest.id} className="hover:bg-background-subtle/40 transition-colors">
                      <th scope="row" className="py-3.5 px-4 font-normal text-left">
                        <div className="font-semibold text-charcoal text-sm">{guest.name}</div>
                        {(guest.phone || guest.email) && (
                          <div className="text-[11px] text-charcoal-600 mt-0.5">
                            {guest.phone || guest.email}
                          </div>
                        )}
                      </th>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="capitalize px-2.5 py-0.5 rounded-full bg-background-subtle text-charcoal-700 font-medium text-[11px] border border-charcoal-100">
                          {guest.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-charcoal whitespace-nowrap">
                        {partySize} {guest.plusOnes > 0 ? `(${guest.plusOnes} guest)` : ''}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={guest.rsvpStatus}
                          aria-label={`RSVP status for ${guest.name}`}
                          onChange={(e) =>
                            updateGuest(guest.id, { rsvpStatus: e.target.value as RsvpStatus })
                          }
                          className="text-xs bg-background-subtle border border-charcoal-200 rounded-lg px-2 py-1 font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="attending">Attending</option>
                          <option value="declined">Declined</option>
                          <option value="tentative">Tentative</option>
                          <option value="not_sent">Not Sent</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-charcoal-600 whitespace-nowrap">
                        {guest.dietaryPreferences || '-'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => toggleInvitationSent(guest.id, !guest.invitationSent)}
                          aria-label={
                            guest.invitationSent
                              ? `Mark invitation for ${guest.name} as not sent`
                              : `Mark invitation for ${guest.name} as sent`
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            guest.invitationSent
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-charcoal-50 text-charcoal-600 border-charcoal-200 hover:bg-primary-50 hover:text-primary'
                          }`}
                        >
                          {guest.invitationSent ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-700" aria-hidden="true" /> Sent
                            </>
                          ) : (
                            <>
                              <Send className="w-3 h-3" aria-hidden="true" /> Mark Sent
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 text-charcoal-400">
                          <button
                            type="button"
                            onClick={() => onEdit(guest)}
                            title="Edit guest"
                            aria-label={`Edit guest ${guest.name}`}
                            className="p-1.5 hover:text-charcoal hover:bg-charcoal-50 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteGuest(guest.id)}
                            title="Delete guest"
                            aria-label={`Delete guest ${guest.name}`}
                            className="p-1.5 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

