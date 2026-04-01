import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { socket } from '../lib/socket';
import { chatWithMeeting } from '../lib/gemini';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Share2, 
  Download, 
  ChevronLeft,
  Send,
  User,
  Brain,
  FileText,
  Target,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export default function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('summary'); // summary, transcript, chat
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMeeting();
    socket.connect();
    socket.emit('join-meeting', id);

    socket.on('new-comment', (comment) => {
      setComments(prev => [comment, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const fetchMeeting = async () => {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      setMeeting(data);
    }
    setLoading(false);
  };

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    
    const commentData = {
      meetingId: id,
      userId: 'user-id', // Get from auth
      userName: 'You',
      content: newComment
    };

    socket.emit('send-comment', commentData);
    setNewComment('');
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || chatLoading) return;

    const userMsg = { role: 'user', content: chatMessage };
    setChatHistory(prev => [...prev, userMsg]);
    setChatMessage('');
    setChatLoading(true);

    try {
      const reply = await chatWithMeeting(
        meeting.transcript,
        meeting.analysis,
        chatMessage,
        chatHistory
      );
      setChatHistory(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse h-screen bg-neutral-50" />;
  if (!meeting) return <div>Meeting not found</div>;

  const { analysis } = meeting;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-neutral-100 rounded-xl transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">{meeting.title}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {format(new Date(meeting.created_at), 'MMMM d, yyyy • h:mm a')}
              </span>
              <span className="bg-neutral-100 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest">
                {analysis.sentiment}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-all font-semibold text-sm">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded-xl transition-all font-semibold text-sm shadow-lg shadow-black/10">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-neutral-100 rounded-2xl w-fit">
            {[
              { id: 'summary', label: 'Intelligence', icon: Brain },
              { id: 'transcript', label: 'Transcript', icon: FileText },
              { id: 'chat', label: 'AI Copilot', icon: MessageSquare },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white text-black shadow-sm' 
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Executive Summary */}
                <section className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                  <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    Executive Summary
                  </h2>
                  <p className="text-neutral-600 leading-relaxed text-lg">
                    {analysis.executiveSummary}
                  </p>
                </section>

                {/* Key Points & Decisions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                    <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      Key Discussion Points
                    </h2>
                    <ul className="space-y-4">
                      {analysis.keyPoints.map((point: string, i: number) => (
                        <li key={i} className="flex gap-3 text-neutral-600 text-sm leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 mt-2 shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                    <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-orange-500" />
                      Risks & Blockers
                    </h2>
                    <ul className="space-y-4">
                      {analysis.risks.map((risk: string, i: number) => (
                        <li key={i} className="flex gap-3 text-neutral-600 text-sm leading-relaxed p-3 bg-orange-50/50 rounded-xl border border-orange-100">
                          <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                {/* Action Items */}
                <section className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                  <h2 className="text-lg font-bold text-neutral-900 mb-6">Action Items</h2>
                  <div className="space-y-3">
                    {analysis.actionItems.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100 group hover:border-black/10 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-neutral-200 group-hover:bg-black group-hover:text-white transition-all">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-neutral-900">{item.task}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {item.assignee}
                              </span>
                              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                                Due: {item.deadline}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button className="text-xs font-bold text-neutral-400 hover:text-black uppercase tracking-widest">
                          Assign
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'transcript' && (
              <motion.div
                key="transcript"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm"
              >
                <div className="prose prose-neutral max-w-none">
                  <p className="text-neutral-600 leading-loose whitespace-pre-wrap font-medium">
                    {meeting.transcript}
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white h-[600px] rounded-3xl border border-neutral-200 shadow-sm flex flex-col overflow-hidden"
              >
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {chatHistory.length === 0 && (
                    <div className="text-center py-20">
                      <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Brain className="text-neutral-300 w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-neutral-900">AI Meeting Assistant</h3>
                      <p className="text-neutral-500 text-sm max-w-xs mx-auto">
                        Ask anything about this meeting. I can find decisions, summarize specific parts, or check task status.
                      </p>
                    </div>
                  )}
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-black text-white' 
                          : 'bg-neutral-100 text-neutral-900'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-neutral-100 p-4 rounded-2xl">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
                          <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleChat} className="p-4 border-t border-neutral-100 flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask a question about this meeting..."
                    className="flex-1 px-6 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-black transition-all text-sm font-medium"
                  />
                  <button 
                    type="submit"
                    disabled={chatLoading}
                    className="bg-black text-white p-3 rounded-xl hover:bg-neutral-800 transition-all disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar: Comments & Meta */}
        <div className="space-y-8">
          {/* Topics & Speakers */}
          <section className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4">Discussion Topics</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.topics.map((topic: string, i: number) => (
                <span key={i} className="px-3 py-1.5 bg-neutral-50 text-neutral-700 rounded-lg text-xs font-bold border border-neutral-100">
                  {topic}
                </span>
              ))}
            </div>
            
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4 mt-8">Speakers</h3>
            <div className="space-y-3">
              {analysis.speakers.map((speaker: string, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center text-[10px] font-bold text-neutral-500">
                    {speaker.charAt(speaker.length - 1)}
                  </div>
                  <span className="text-sm font-bold text-neutral-700">{speaker}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Real-time Comments */}
          <section className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex flex-col h-[500px]">
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Team Discussion
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {comments.map((comment, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900">{comment.user_name}</span>
                    <span className="text-[10px] text-neutral-400">{format(new Date(comment.created_at), 'HH:mm')}</span>
                  </div>
                  <p className="text-xs text-neutral-600 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                placeholder="Add a comment..."
                className="w-full pl-4 pr-10 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-black transition-all font-medium"
              />
              <button 
                onClick={handleSendComment}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black p-1"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
