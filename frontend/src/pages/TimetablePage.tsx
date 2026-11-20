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
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-brand-cyan" />
            <span>ECE Master Class Timetable</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Weekly academic scheduling grid, laboratory allotments, and room assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Class Section Select */}
          <select
            value={selectedClassId}
            onChange={(e) => handleClassChange(Number(e.target.value))}
            className="px-3.5 py-2 rounded-xl bg-surface border border-surface-border text-white text-xs font-semibold focus:outline-none focus:border-cyan-500 shadow-sm"
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
            className="px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-surface-hover border border-surface-border text-xs text-cyan-300 font-semibold transition"
          >
            Conflict Validator
          </button>
        </div>
      </div>

      {/* Conflict Tester Box (collapsible) */}
      {showConflictTool && (
        <div className="p-5 rounded-2xl bg-surface-elevated/80 border border-surface-border animate-in fade-in space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Timetable Conflict Detection Simulation
              </h3>
            </div>
            <button
              onClick={() => setShowConflictTool(false)}
              className="text-gray-400 hover:text-white text-xs"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-gray-400">
            Test a prospective class slot against the entire department database to check for faculty double-booking or room clashes.
          </p>

          <form onSubmit={handleTestConflict} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">Faculty</label>
              <select
                value={testFaculty}
                onChange={(e) => setTestFaculty(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-surface-border text-white text-xs"
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
              <label className="block text-[11px] text-gray-400 mb-1">Room</label>
              <select
                value={testRoom}
                onChange={(e) => setTestRoom(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-surface-border text-white text-xs"
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
              <label className="block text-[11px] text-gray-400 mb-1">Day</label>
              <select
                value={testDay}
                onChange={(e) => setTestDay(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-surface-border text-white text-xs"
              >
                {DAYS.map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-gray-400 mb-1">Time Slot</label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={testStart}
                  onChange={(e) => setTestStart(e.target.value)}
                  className="w-1/2 px-2 py-1.5 rounded-lg bg-surface border border-surface-border text-white text-xs text-center"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="text"
                  value={testEnd}
                  onChange={(e) => setTestEnd(e.target.value)}
                  className="w-1/2 px-2 py-1.5 rounded-lg bg-surface border border-surface-border text-white text-xs text-center"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition"
              >
                Test Conflict
              </button>
            </div>
          </form>

          {conflictResult && (
            <div
              className={`p-3 rounded-lg border text-xs ${
                conflictResult.valid
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              }`}
            >
              {conflictResult.valid ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>No schedule conflict! Faculty and room are both completely free.</span>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{conflictResult.message || JSON.stringify(conflictResult.errors)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Weekly Matrix Schedule */}
      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading timetable matrix...</div>
      ) : (
        <div className="space-y-4">
          {DAYS.map((dayName, dayIdx) => {
            const dayEntries = scheduleMatrix[dayIdx] || [];
            return (
              <div
                key={dayName}
                className="rounded-2xl bg-surface border border-surface-border p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3 border-b border-surface-border pb-2.5">
                  <span className="font-extrabold text-sm text-cyan-300 tracking-wide uppercase">
                    {dayName}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {dayEntries.length} scheduled period(s)
                  </span>
                </div>

                {dayEntries.length === 0 ? (
                  <div className="py-4 text-center text-xs text-gray-500 italic">
                    No classes assigned for {dayName}.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {dayEntries.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-3.5 rounded-xl bg-surface-elevated border border-surface-border hover:border-cyan-500/30 transition flex flex-col justify-between group shadow-sm"
                      >
                        <div>
                          {/* Time & Lab Tag */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-mono text-xs font-bold text-cyan-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-cyan-400" />
                              {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                            </span>
                            {slot.is_lab && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                                LAB
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-xs text-white group-hover:text-cyan-300 transition line-clamp-1">
                            {slot.subject_name}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-mono block">
                            {slot.subject_code}
                          </span>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-surface-border/60 text-[11px] space-y-1">
                          <div className="flex items-center justify-between text-gray-300">
                            <span className="text-gray-500">Room:</span>
                            <span className="font-semibold text-white">
                              {slot.room_number} ({slot.room_building})
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-gray-300">
                            <span className="text-gray-500">Faculty:</span>
                            <span
                              onClick={() => navigate('/faculty')}
                              className="font-medium text-cyan-300 hover:underline cursor-pointer"
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
