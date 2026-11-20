import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, AlertTriangle, MessageSquare, Users, X, ArrowRight } from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionKey: 'achievement' | 'issue' | 'query') => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({ isOpen, onClose, onSelectAction }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const actions = [
    {
      key: 'achievement',
      title: 'Submit Achievement',
      desc: 'Log a hackathon, paper, competition award, or project with evidence.',
      icon: Trophy,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
      action: () => {
        onClose();
        onSelectAction('achievement');
      },
    },
    {
      key: 'issue',
      title: 'Report Classroom Issue',
      desc: 'Report broken fans, missing markers/dusters, projector HDMI, or lab power problems.',
      icon: AlertTriangle,
      color: 'from-rose-500/20 to-red-500/10 text-rose-400 border-rose-500/30',
      action: () => {
        onClose();
        onSelectAction('issue');
      },
    },
    {
      key: 'query',
      title: 'Ask Department Query',
      desc: 'Submit academic feedback, request faculty meetings, or timetable assistance.',
      icon: MessageSquare,
      color: 'from-cyan-500/20 to-teal-500/10 text-cyan-400 border-cyan-500/30',
      action: () => {
        onClose();
        onSelectAction('query');
      },
    },
    {
      key: 'faculty',
      title: 'Find Faculty Now',
      desc: 'Check live timetable locations, open office hours, and cabin availability.',
      icon: Users,
      color: 'from-violet-500/20 to-indigo-500/10 text-violet-400 border-violet-500/30',
      action: () => {
        onClose();
        navigate('/faculty');
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-surface border border-surface-border rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-surface-elevated transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>ECE Department Quick Actions</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">Select an action to launch immediately.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.key}
                onClick={act.action}
                className={`p-4 rounded-xl border bg-gradient-to-br text-left transition hover:scale-[1.02] active:scale-[0.98] ${act.color} flex flex-col justify-between group`}
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition">
                    {act.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{act.desc}</p>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-gray-300 group-hover:text-white transition gap-1">
                  <span>Proceed</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
