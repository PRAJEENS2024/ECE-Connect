import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldAlert,
  CheckCircle,
  Plus,
  BookOpen,
} from 'lucide-react';
import { api } from '../api/client';
import { ClassSection, TimetableEntry, Room, Subject, FacultyProfile } from '../types';

export const TimetablePage: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
  const [scheduleMatrix, setScheduleMatrix] = useState<{ [day: number]: TimetableEntry[] }>({});
  const [loading, setLoading] = useState(true);

  // Conflict Checker Tool State
  const [showConflictTool, setShowConflictTool] = useState(false);
  const [testFaculty, setTestFaculty] = useState<number | ''>('');
  const [testRoom, setTestRoom] = useState<number | ''>('');
  const [testDay, setTestDay] = useState<number>(0);
  const [testStart, setTestStart] = useState<string>('09:40');
  const [testEnd, setTestEnd] = useState<string>('10:35');
  const [conflictResult, setConflictResult] = useState<{ valid?: boolean; message?: string; errors?: any } | null>(null);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyProfile[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [cls, rms, subs, facs] = await Promise.all([
          api.timetables.getClasses(),
          api.timetables.getRooms(),
          api.timetables.getSubjects(),
          api.faculty.list(),
        ]);
        setClasses(cls);
        setRooms(rms);
        setSubjects(subs);
        setFacultyList(facs);

        if (cls.length > 0) {
          setSelectedClassId(cls[0].id);
          const matrix = await api.timetables.getClassMatrix(cls[0].id);
          setScheduleMatrix(matrix.schedule || {});
        }
      } catch (err) {
        console.error('Error loading timetable data:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleClassChange = async (clsId: number) => {
    setSelectedClassId(clsId);
    try {
      setLoading(true);
      const matrix = await api.timetables.getClassMatrix(clsId);
      setScheduleMatrix(matrix.schedule || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConflict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testFaculty || !testRoom || !selectedClassId) return;

    try {
      const res = await api.timetables.validateConflict({
        class_section: selectedClassId,
        subject: subjects[0]?.id || 1,
        faculty: testFaculty,
        room: testRoom,
        day_of_week: testDay,
        start_time: testStart,
        end_time: testEnd,
      });
      setConflictResult(res);
    } catch (err: any) {
      setConflictResult({ valid: false, message: err.message });
    }
  };

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <Calendar className="w-5 h-5" />
            </div>
            <span>ECE Master Class Timetable</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Weekly academic scheduling grid, laboratory allotments, and room assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Class Section Select */}
          <select
            value={selectedClassId}
            onChange={(e) => handleClassChange(Number(e.target.value))}
            className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-clean"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (Year {c.year_of_study}, Sem {c.semester})
              </option>
            ))}
          </select>

          {/* Conflict Checker Drawer Trigger */}
          <button
            onClick={() => setShowConflictTool(!showConflictTool)}
            className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs text-blue-700 font-bold transition-all shadow-2xs"
          >
            Conflict Validator
          </button>
        </div>
      </div>

      {/* Conflict Tester Box (collapsible) */}
      {showConflictTool && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-clean-md animate-in fade-in space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Timetable Conflict Detection Engine
              </h3>
            </div>
            <button
              onClick={() => setShowConflictTool(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Simulate a prospective class slot against the entire department database to test for faculty double-booking or room overlaps.
          </p>

          <form onSubmit={handleTestConflict} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Faculty Member</label>
              <select
                value={testFaculty}
                onChange={(e) => setTestFaculty(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="">Select Faculty</option>
                {facultyList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.user_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Classroom / Lab</label>
              <select
                value={testRoom}
                onChange={(e) => setTestRoom(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="">Select Room</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.room_number}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Day of Week</label>
              <select
                value={testDay}
                onChange={(e) => setTestDay(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {DAYS.map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Time Range</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={testStart}
                  onChange={(e) => setTestStart(e.target.value)}
                  className="w-1/2 px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs text-center font-mono"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="text"
                  value={testEnd}
                  onChange={(e) => setTestEnd(e.target.value)}
                  className="w-1/2 px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs text-center font-mono"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
              >
                Test Conflict
              </button>
            </div>
          </form>

          {conflictResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs ${
                conflictResult.valid
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {conflictResult.valid ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">Schedule is valid: No collision detected. Faculty and room are free.</span>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{conflictResult.message || JSON.stringify(conflictResult.errors)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Weekly Matrix Schedule */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading timetable matrix...</div>
      ) : (
        <div className="space-y-4">
          {DAYS.map((dayName, dayIdx) => {
            const dayEntries = scheduleMatrix[dayIdx] || [];
            return (
              <div
                key={dayName}
                className="rounded-2xl bg-white border border-slate-200 p-5 shadow-clean"
              >
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <span className="font-extrabold text-sm text-blue-700 tracking-wide uppercase">
                    {dayName}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {dayEntries.length} scheduled period(s)
                  </span>
                </div>

                {dayEntries.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 italic">
                    No classes assigned for {dayName}.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {dayEntries.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex flex-col justify-between group shadow-2xs"
                      >
                        <div>
                          {/* Time & Lab Tag */}
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <span className="font-mono text-xs font-bold text-blue-600 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                              {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                            </span>
                            {slot.is_lab && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                                LAB
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {slot.subject_name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            {slot.subject_code}
                          </span>
                        </div>

                        <div className="mt-3.5 pt-3 border-t border-slate-200/60 text-[11px] space-y-1">
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="text-slate-400">Room:</span>
                            <span className="font-bold text-slate-900">
                              {slot.room_number} ({slot.room_building})
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="text-slate-400">Faculty:</span>
                            <span
                              onClick={() => navigate('/faculty')}
                              className="font-bold text-blue-600 hover:underline cursor-pointer"
                            >
                              {slot.faculty_name}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
