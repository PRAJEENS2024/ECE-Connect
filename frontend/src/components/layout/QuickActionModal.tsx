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
      desc: 'Log a hackathon win, research paper, competition award, or project with certificate evidence.',
      icon: Trophy,
      bgColor: 'bg-amber-50 hover:bg-amber-100/70 border-amber-200 text-amber-700',
      iconColor: 'bg-amber-100 text-amber-700',
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
      bgColor: 'bg-rose-50 hover:bg-rose-100/70 border-rose-200 text-rose-700',
      iconColor: 'bg-rose-100 text-rose-700',
      action: () => {
        onClose();
        onSelectAction('issue');
      },
    },
    {
      key: 'query',
      title: 'Ask Department Query',
      desc: 'Submit academic feedback, request faculty appointments, or timetable queries.',
      icon: MessageSquare,
      bgColor: 'bg-blue-50 hover:bg-blue-100/70 border-blue-200 text-blue-700',
      iconColor: 'bg-blue-100 text-blue-700',
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
      bgColor: 'bg-purple-50 hover:bg-purple-100/70 border-purple-200 text-purple-700',
      iconColor: 'bg-purple-100 text-purple-700',
      action: () => {
        onClose();
        navigate('/faculty');
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-7 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>ECE Department Quick Actions</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Select an action to launch immediately.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.key}
                onClick={act.action}
                className={`p-5 rounded-2xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99] ${act.bgColor} flex flex-col justify-between group shadow-clean`}
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl ${act.iconColor} flex items-center justify-center mb-3 shadow-2xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                    {act.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{act.desc}</p>
                </div>
                <div className="mt-5 flex items-center text-xs font-bold text-slate-700 group-hover:text-blue-700 transition-colors gap-1">
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
