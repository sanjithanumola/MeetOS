import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Users,
  Calendar,
  MoreVertical
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function Dashboard() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    tasks: 0,
    productivity: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: meetingsData } = await supabase
      .from('meetings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (meetingsData) {
      setMeetings(meetingsData);
      
      // Calculate stats
      const totalTasks = meetingsData.reduce((acc, m) => acc + (m.analysis?.actionItems?.length || 0), 0);
      setStats({
        total: meetingsData.length,
        tasks: totalTasks,
        productivity: 85 // Mock productivity score
      });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Intelligence Dashboard</h1>
          <p className="text-neutral-500 mt-1">Welcome back. Here's what's happening with your meetings.</p>
        </div>
        <Link 
          to="/upload"
          className="bg-black text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-neutral-800 transition-all shadow-lg shadow-black/10"
        >
          <Plus className="w-5 h-5" />
          New Meeting
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Meetings', value: stats.total, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Action Items', value: stats.tasks, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Productivity Score', value: `${stats.productivity}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Live</span>
            </div>
            <div className="text-3xl font-bold text-neutral-900">{stat.value}</div>
            <div className="text-sm text-neutral-500 mt-1 font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4 items-center bg-white p-2 rounded-2xl border border-neutral-200 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search meetings, topics, or speakers..."
            className="w-full pl-12 pr-4 py-3 bg-transparent outline-none text-sm font-medium"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-neutral-500 hover:text-black hover:bg-neutral-50 rounded-xl transition-all text-sm font-semibold">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          Recent Meetings
          <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-1 rounded-full font-bold">
            {meetings.length}
          </span>
        </h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-neutral-100 animate-pulse rounded-2xl border border-neutral-200" />
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-neutral-200">
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-neutral-300 w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">No meetings yet</h3>
            <p className="text-neutral-500 mb-6">Upload your first meeting to get AI-powered insights.</p>
            <Link 
              to="/upload"
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-neutral-800 transition-all"
            >
              <Plus className="w-5 h-5" />
              Get Started
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {meetings.map((meeting, i) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-xl hover:border-black/10 transition-all overflow-hidden"
              >
                <Link to={`/meetings/${meeting.id}`} className="block p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${meeting.analysis?.sentiment === 'positive' ? 'bg-green-500' : 'bg-blue-500'}`} />
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        {meeting.analysis?.sentiment || 'Neutral'}
                      </span>
                    </div>
                    <button className="text-neutral-400 hover:text-black transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <h3 className="text-lg font-bold text-neutral-900 group-hover:text-black transition-colors mb-2">
                    {meeting.title}
                  </h3>
                  
                  <p className="text-sm text-neutral-500 line-clamp-2 mb-6 leading-relaxed">
                    {meeting.analysis?.executiveSummary || 'Processing meeting details...'}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-neutral-50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
                        <Clock className="w-3.5 h-3.5" />
                        {format(new Date(meeting.created_at), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        {meeting.analysis?.actionItems?.length || 0} Tasks
                      </div>
                    </div>
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(j => (
                        <div key={j} className="w-6 h-6 rounded-full bg-neutral-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-neutral-500">
                          {String.fromCharCode(64 + j)}
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
