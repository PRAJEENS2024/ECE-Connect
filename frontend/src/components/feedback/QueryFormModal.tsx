import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Shield, HelpCircle } from 'lucide-react';
import { api } from '../../api/client';
import { FacultyProfile } from '../../types';

interface QueryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const QueryFormModal: React.FC<QueryFormModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [facultyList, setFacultyList] = useState<FacultyProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [category, setCategory] = useState('ACADEMIC');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [targetFacultyId, setTargetFacultyId] = useState<number | ''>('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.faculty.list().then((fac) => {
        setFacultyList(fac);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) {
      setError('Please provide a subject and description.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await api.feedback.create({
        category,
        subject,
        description,
        target_faculty: targetFacultyId || null,
        is_anonymous: isAnonymous,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl bg-surface border border-surface-border rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-surface-elevated transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Ask Department Query / Suggestion</h2>
            <p className="text-xs text-gray-400">
              Submit academic inquiries, faculty meeting requests, or suggestions.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Query Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="ACADEMIC">Academic & Curriculum</option>
                <option value="TIMETABLE">Timetable & Class Clashes</option>
                <option value="FACULTY_MEETING">Faculty Meeting Request</option>
                <option value="HACKATHON_EVENT">Hackathon / Contest Guidance</option>
                <option value="INFRASTRUCTURE">Department Infrastructure</option>
                <option value="DEPARTMENT_ACTIVITY">Association / Club Activities</option>
                <option value="SUGGESTION">Constructive Suggestion</option>
                <option value="TECHNICAL_PROBLEM">Lab / Technical Assistance</option>
                <option value="OTHER">General Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Direct to Faculty (Optional)</label>
              <select
                value={targetFacultyId}
                onChange={(e) => setTargetFacultyId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="">-- General Department Desk --</option>
                {facultyList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.user_name} ({f.designation})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Subject / Question Summary *</label>
            <input
              type="text"
              placeholder="e.g. Permission for late lab access before Cadence contest"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Description / Inquiry Details *</label>
            <textarea
              rows={4}
              placeholder="Explain the background, reason, or suggestion in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Privacy Anonymous Switch */}
          <div className="p-3.5 rounded-xl bg-surface-elevated/60 border border-surface-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="text-xs font-semibold text-white">Submit Anonymously</span>
                  <p className="text-[11px] text-gray-400">
                    Your name and roll number will not be displayed in faculty view.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-elevated hover:bg-surface-hover text-gray-300 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold text-xs transition shadow-sm disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Send Query'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
