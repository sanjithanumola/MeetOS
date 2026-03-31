import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter,
  MoreHorizontal,
  Calendar,
  User,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: meetings } = await supabase
      .from('meetings')
      .select('id, title, analysis')
      .eq('user_id', user.id);

    if (meetings) {
      const allTasks = meetings.flatMap(m => 
        (m.analysis?.actionItems || []).map((t: any) => ({
          ...t,
          meetingId: m.id,
          meetingTitle: m.title
        }))
      );
      setTasks(allTasks);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Task Board</h1>
          <p className="text-neutral-500 mt-1">Manage and track all action items extracted from your meetings.</p>
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending', count: tasks.length, color: 'bg-blue-500' },
          { label: 'In Progress', count: 0, color: 'bg-orange-500' },
          { label: 'Completed', count: 0, color: 'bg-green-500' },
          { label: 'Overdue', count: 0, color: 'bg-red-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-4 rounded-2xl border border-neutral-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-neutral-900">{stat.count}</p>
            </div>
            <div className={`w-2 h-8 rounded-full ${stat.color}`} />
          </div>
        ))}
      </div>

      {/* Task List */}
      <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search tasks or assignees..."
              className="w-full pl-12 pr-4 py-2 bg-neutral-50 border border-neutral-100 rounded-xl outline-none text-sm font-medium"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-neutral-500 hover:text-black rounded-xl transition-all text-sm font-bold">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Task Description</th>
                <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Assignee</th>
                <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Deadline</th>
                <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Source Meeting</th>
                <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {tasks.map((task, i) => (
                <motion.tr 
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-neutral-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded border border-neutral-300 flex items-center justify-center group-hover:border-black transition-colors cursor-pointer">
                        <CheckCircle2 className="w-3 h-3 text-transparent group-hover:text-neutral-300" />
                      </div>
                      <span className="text-sm font-bold text-neutral-900">{task.task}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-500">
                        {task.assignee.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-neutral-600">{task.assignee}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {task.deadline}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link 
                      to={`/meetings/${task.meetingId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                    >
                      {task.meetingTitle}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase tracking-widest">
                      Pending
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-neutral-400 hover:text-black">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {tasks.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-neutral-500 font-medium">No tasks found. Upload a meeting to generate action items.</p>
          </div>
        )}
      </div>
    </div>
  );
}
