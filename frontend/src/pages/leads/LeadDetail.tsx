import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { leadService } from '../../services/lead.service';
import { aiService } from '../../services/ai.service';
import { Lead, Activity } from '../../types/lead';
import { 
  ChevronLeft, 
  Mail, 
  Phone, 
  Globe, 
  Calendar, 
  Brain, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Send,
  RefreshCw,
  Copy,
  ExternalLink,
  Sparkles,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LeadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [emailTone, setEmailTone] = useState<'professional' | 'casual' | 'aggressive'>('professional');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);

  useEffect(() => {
    if (id) {
      loadLeadData();
    }
  }, [id]);

  const loadLeadData = async () => {
    if (!id) return;
    try {
      const leadData = await leadService.getLeadById(id);
      setLead(leadData);
      const activityData = await leadService.getActivities(id);
      setActivities(activityData);
    } catch (error) {
      console.error('Error loading lead data:', error);
      navigate('/leads');
    }
  };

  const handleAnalyze = async () => {
    if (!lead) return;
    setIsAnalyzing(true);
    try {
      await aiService.analyzeLead(lead);
      await loadLeadData();
    } catch (error) {
      console.error('Error analyzing lead:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateEmail = async () => {
    if (!lead) return;
    setIsGeneratingEmail(true);
    try {
      const email = await aiService.generateOutreachEmail(lead, emailTone);
      setGeneratedEmail(email);
      await loadLeadData();
    } catch (error) {
      console.error('Error generating email:', error);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(generatedEmail);
    alert('Email copied to clipboard!');
  };

  if (!lead) return <div className="p-8 text-center text-indigo-600 font-bold">Loading lead details...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Breadcrumbs & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center">
          <Link to="/leads" className="p-2 mr-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all shadow-sm group">
            <ChevronLeft className="h-6 w-6 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{lead.name}</h1>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider",
                lead.status === 'New' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                lead.status === 'Contacted' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                lead.status === 'Interested' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-emerald-50 text-emerald-700 border-emerald-200'
              )}>
                {lead.status}
              </span>
            </div>
            <p className="text-gray-500 font-medium mt-1">{lead.company} • {lead.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="inline-flex items-center px-6 py-3 bg-white border-2 border-indigo-100 text-indigo-600 text-sm font-black rounded-2xl hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm disabled:opacity-50"
          >
            <Brain className={cn("mr-2 h-5 w-5", isAnalyzing && "animate-spin")} />
            {isAnalyzing ? 'Analyzing...' : 'AI Re-analyze'}
          </button>
          <button className="p-3 bg-white border-2 border-gray-100 rounded-2xl text-gray-400 hover:text-gray-600 hover:border-gray-200 transition-all">
            <MoreVertical className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info & AI Analysis */}
        <div className="lg:col-span-1 space-y-8">
          {/* AI Insights Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl shadow-2xl shadow-indigo-100 p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
              <Sparkles className="h-24 w-24" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Brain className="h-6 w-6" />
                <h3 className="text-sm font-black uppercase tracking-widest text-indigo-200">AI Intelligence Report</h3>
              </div>
              
              {lead.quality === 'Unknown' ? (
                <div className="space-y-4">
                  <p className="text-indigo-100 font-medium leading-relaxed">This lead hasn't been analyzed yet. Run AI analysis to get deep insights and quality scores.</p>
                  <button 
                    onClick={handleAnalyze}
                    className="w-full py-4 bg-white text-indigo-600 font-black rounded-2xl shadow-xl hover:bg-indigo-50 transition-all active:scale-95"
                  >
                    Run Initial Analysis
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1">Quality Score</p>
                      <h4 className="text-5xl font-black text-white">{lead.qualityScore}%</h4>
                    </div>
                    <div className={cn(
                      "px-4 py-2 rounded-2xl font-black text-sm uppercase tracking-wider",
                      lead.quality === 'High' ? 'bg-emerald-400/20 text-emerald-100' :
                      lead.quality === 'Medium' ? 'bg-amber-400/20 text-amber-100' :
                      'bg-rose-400/20 text-rose-100'
                    )}>
                      {lead.quality} Quality
                    </div>
                  </div>
                  
                    {lead.analysis && (
                      <p className="text-indigo-50 font-medium leading-relaxed italic">
                        "{lead.analysis}"
                      </p>
                    )}
                    {(lead.suspicious || lead.isRisky) && (
                      <div className="space-y-3 mt-4">
                        <div className="flex items-center p-4 bg-rose-500/20 rounded-2xl border border-rose-400/30 text-rose-100">
                          <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                          <div className="flex flex-col">
                            <p className="text-xs font-black uppercase tracking-widest mb-1">Security Alert: Potential Risk</p>
                            <p className="text-[10px] font-bold leading-tight opacity-90">{lead.securityAnalysis || "This lead matches patterns commonly found in phishing or bot profiles."}</p>
                          </div>
                        </div>
                        {lead.securityFlags && lead.securityFlags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {lead.securityFlags.map(flag => (
                              <span key={flag} className="px-2 py-1 bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-tighter border border-white/20">
                                {flag.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Lead Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                  <Mail className="h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{lead.email}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                  <Phone className="h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{lead.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                  <Globe className="h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Website</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{lead.website}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Created At</p>
                  <p className="text-sm font-bold text-gray-900">{format(new Date(lead.createdAt), 'MMM d, yyyy')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Email Generator & Outreach */}
        <div className="lg:col-span-2 space-y-8">
          {/* AI Email Generator */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 overflow-hidden relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">AI Outreach Generator</h2>
                <p className="text-gray-500 font-medium mt-1">Personalized emails based on lead data.</p>
              </div>
              <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                {(['professional', 'casual', 'aggressive'] as const).map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setEmailTone(tone)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                      emailTone === tone 
                        ? "bg-white text-indigo-600 shadow-sm shadow-indigo-100" 
                        : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="min-h-[250px] bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 p-8 flex flex-col items-center justify-center relative group">
                {isGeneratingEmail ? (
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-sm font-black text-indigo-600 uppercase tracking-widest">Crafting personalized outreach...</p>
                  </div>
                ) : generatedEmail ? (
                  <div className="w-full h-full relative">
                    <div className="absolute top-0 right-0 flex gap-2">
                      <button 
                        onClick={copyEmail}
                        className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                        title="Copy to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={handleGenerateEmail}
                        className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                        title="Regenerate"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                    <textarea 
                      className="w-full h-full min-h-[200px] bg-transparent border-none focus:ring-0 text-gray-700 font-medium leading-relaxed resize-none p-0 pr-12"
                      value={generatedEmail}
                      onChange={(e) => setGeneratedEmail(e.target.value)}
                    />
                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                      <button className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white text-sm font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                        <Send className="mr-2 h-4 w-4" />
                        Send via Email
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="p-4 bg-white rounded-3xl shadow-lg shadow-gray-100 inline-block mb-6 group-hover:scale-110 transition-transform duration-500">
                      <MessageSquare className="h-10 w-10 text-indigo-400" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Ready to engage?</h4>
                    <p className="text-gray-500 text-sm font-medium mt-1 max-w-xs mx-auto">Click below to generate a high-converting personalized email for this lead.</p>
                    <button 
                      onClick={handleGenerateEmail}
                      className="mt-8 px-10 py-4 bg-indigo-600 text-white text-sm font-black rounded-2xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                      Generate Outreach
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Engagement History</h2>
              <span className="px-3 py-1 bg-gray-50 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 border border-gray-100">{activities.length} events</span>
            </div>
            
            <div className="space-y-8 relative">
              {/* Vertical line */}
              <div className="absolute left-[21px] top-2 bottom-2 w-0.5 bg-gray-50"></div>
              
              {activities.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-10 w-10 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No activities yet</p>
                </div>
              ) : (
                activities.map((activity, idx) => (
                  <div key={activity.id} className="flex gap-6 relative group">
                    <div className={cn(
                      "h-11 w-11 rounded-2xl flex items-center justify-center relative z-10 shadow-sm transition-transform group-hover:scale-110",
                      activity.type === 'status_change' ? 'bg-blue-50 text-blue-600' :
                      activity.type === 'analysis' ? 'bg-purple-50 text-purple-600' :
                      activity.type === 'email_sent' ? 'bg-indigo-50 text-indigo-600' :
                      activity.type === 'security_alert' ? 'bg-rose-50 text-rose-600' :
                      'bg-gray-50 text-gray-600'
                    )}>
                      {activity.type === 'status_change' && <Clock className="h-5 w-5" />}
                      {activity.type === 'analysis' && <Brain className="h-5 w-5" />}
                      {activity.type === 'email_sent' && <Mail className="h-5 w-5" />}
                      {activity.type === 'security_alert' && <AlertCircle className="h-5 w-5" />}
                      {activity.type === 'note' && <MessageSquare className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 pb-2 border-b border-gray-50">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-black text-gray-900 tracking-tight">
                          {activity.type === 'status_change' ? 'Pipeline Movement' :
                           activity.type === 'analysis' ? 'AI Market Analysis' :
                           activity.type === 'email_sent' ? 'Outreach Communication' :
                           activity.type === 'security_alert' ? 'Security Protocol Alert' : 'General Note'}
                        </p>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{format(new Date(activity.timestamp), 'h:mm a • MMM d')}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-500 leading-relaxed">{activity.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
