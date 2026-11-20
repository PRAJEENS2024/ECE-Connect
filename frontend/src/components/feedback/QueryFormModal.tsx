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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-7 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Ask Department Query / Suggestion</h2>
            <p className="text-xs text-slate-500">
              Submit academic inquiries, faculty meeting requests, or suggestions.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Query Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Direct to Faculty (Optional)</label>
              <select
                value={targetFacultyId}
                onChange={(e) => setTargetFacultyId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject / Question Summary *</label>
            <input
              type="text"
              placeholder="e.g. Permission for late lab access before Cadence contest"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description / Inquiry Details *</label>
            <textarea
              rows={4}
              placeholder="Explain the background, reason, or suggestion in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Privacy Anonymous Switch */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900">Submit Anonymously</span>
                  <p className="text-[11px] text-slate-500">
                    Your name and roll number will not be displayed in faculty view.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Send Query'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
