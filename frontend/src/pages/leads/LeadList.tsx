import React, { useState, useEffect } from 'react';
import { leadService } from '../../services/lead.service';
import { aiService } from '../../services/ai.service';
import { Lead, LeadStatus, LeadQuality } from '../../types/lead';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Mail, 
  Phone, 
  Globe, 
  Trash2, 
  Edit2, 
  Brain,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FilterX,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LeadList: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'All'>('All');
  const [qualityFilter, setQualityFilter] = useState<LeadQuality | 'All'>('All');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  
  // Lead Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    website: '',
    phone: '',
    status: 'New' as LeadStatus,
  });

  const [analyzingLeadId, setAnalyzingLeadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await leadService.getLeads();
      setLeads(data);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLead) {
        await leadService.updateLead(editingLead.id, formData);
        setEditingLead(null);
      } else {
        await leadService.createLead(formData);
      }
      setFormData({ name: '', email: '', company: '', website: '', phone: '', status: 'New' });
      setIsAddingLead(false);
      loadLeads();
    } catch (error) {
      console.error('Error saving lead:', error);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadService.deleteLead(id);
        loadLeads();
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  const handleAnalyzeLead = async (lead: Lead) => {
    setAnalyzingLeadId(lead.id);
    try {
      await aiService.analyzeLead(lead);
      loadLeads();
    } catch (error) {
      console.error('Error analyzing lead:', error);
    } finally {
      setAnalyzingLeadId(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Company', 'Website', 'Phone', 'Status', 'Quality', 'Score'];
    const csvData = leads.map(l => [
      l.name, l.email, l.company, l.website, l.phone, l.status, l.quality, l.qualityScore
    ]);
    
    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "leads_export.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    const matchesQuality = qualityFilter === 'All' || lead.quality === qualityFilter;
    return matchesSearch && matchesStatus && matchesQuality;
  });

  const toggleSelectLead = (id: string) => {
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(lid => lid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedLeads(prev => 
      prev.length === filteredLeads.length ? [] : filteredLeads.map(l => l.id)
    );
  };

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Contacted': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Interested': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Closed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const getQualityColor = (quality: LeadQuality) => {
    switch (quality) {
      case 'High': return 'text-emerald-600 bg-emerald-50';
      case 'Medium': return 'text-amber-600 bg-amber-50';
      case 'Low': return 'text-rose-600 bg-rose-50';
      default: return 'text-gray-400 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Lead Intelligence</h1>
          <p className="text-gray-500 font-medium mt-1">Manage and optimize your business pipeline.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="inline-flex items-center px-5 py-3 border-2 border-gray-100 text-sm font-bold rounded-2xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm active:scale-95"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </button>
          <button 
            onClick={() => {
              setEditingLead(null);
              setFormData({ name: '', email: '', company: '', website: '', phone: '', status: 'New' });
              setIsAddingLead(true);
            }}
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-2xl shadow-lg shadow-indigo-100 text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:scale-[1.02] active:scale-95"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Lead
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-2xl border border-gray-100 w-full lg:w-auto">
              <Filter className="h-4 w-4 text-gray-400 mr-2" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 min-w-[120px]"
              >
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Interested">Interested</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-2xl border border-gray-100 w-full lg:w-auto">
              <Brain className="h-4 w-4 text-gray-400 mr-2" />
              <select 
                value={qualityFilter}
                onChange={(e) => setQualityFilter(e.target.value as any)}
                className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 min-w-[120px]"
              >
                <option value="All">AI Quality: All</option>
                <option value="High">High Quality</option>
                <option value="Medium">Medium Quality</option>
                <option value="Low">Low Quality</option>
              </select>
            </div>
            {(statusFilter !== 'All' || qualityFilter !== 'All' || searchTerm !== '') && (
              <button 
                onClick={() => {
                  setStatusFilter('All');
                  setQualityFilter('All');
                  setSearchTerm('');
                }}
                className="p-3 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                title="Clear Filters"
              >
                <FilterX className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left">
                  <input 
                    type="checkbox" 
                    checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                    onChange={toggleSelectAll}
                    className="h-5 w-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Lead Information</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Company & Website</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">AI Quality</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-gray-50 rounded-full mb-4">
                        <Users className="h-10 w-10 text-gray-300" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">No leads found</h3>
                      <p className="text-gray-500 max-w-xs mt-1">Try adjusting your filters or search terms to find what you're looking for.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className={cn(
                      "hover:bg-gray-50/80 transition-all group/row",
                      selectedLeads.includes(lead.id) && "bg-indigo-50/30"
                    )}
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => toggleSelectLead(lead.id)}
                        className="h-5 w-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <Link to={`/leads/${lead.id}`} className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md hover:scale-105 transition-transform">
                          {lead.name.split(' ').map(n => n[0]).join('')}
                        </Link>
                        <div className="ml-4">
                          <div className="flex items-center gap-2">
                            <Link to={`/leads/${lead.id}`} className="text-sm font-bold text-gray-900 leading-tight hover:text-indigo-600 transition-colors">{lead.name}</Link>
                            {lead.isRisky && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-tighter">
                                <AlertCircle className="w-2.5 h-2.5 mr-1" />
                                Potential Risk
                              </span>
                            )}
                          </div>
                          <div className="flex items-center mt-1 text-xs font-medium text-gray-500">
                            <Mail className="h-3 w-3 mr-1" />
                            {lead.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 leading-tight">{lead.company}</div>
                      <div className="flex items-center mt-1 text-xs font-medium text-indigo-600 hover:underline">
                        <Globe className="h-3 w-3 mr-1" />
                        <a href={`https://${lead.website}`} target="_blank" rel="noopener noreferrer">{lead.website}</a>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border transition-colors",
                        getStatusColor(lead.status)
                      )}>
                        {lead.status === 'New' && <Clock className="w-3 h-3 mr-1.5" />}
                        {lead.status === 'Contacted' && <Mail className="w-3 h-3 mr-1.5" />}
                        {lead.status === 'Interested' && <AlertCircle className="w-3 h-3 mr-1.5" />}
                        {lead.status === 'Closed' && <CheckCircle2 className="w-3 h-3 mr-1.5" />}
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors",
                            getQualityColor(lead.quality)
                          )}>
                            {lead.quality}
                          </span>
                          <span className="ml-2 text-xs font-bold text-gray-400">
                            {lead.qualityScore}%
                          </span>
                        </div>
                        {lead.quality === 'Unknown' ? (
                          <button 
                            onClick={() => handleAnalyzeLead(lead)}
                            disabled={analyzingLeadId === lead.id}
                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center mt-1 group-hover/row:underline"
                          >
                            <Brain className={cn("h-3 w-3 mr-1", analyzingLeadId === lead.id && "animate-pulse")} />
                            {analyzingLeadId === lead.id ? 'Analyzing...' : 'Analyze with AI'}
                          </button>
                        ) : lead.suspicious ? (
                          <div className="flex items-center text-[10px] font-bold text-rose-500 mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Suspicious Lead
                          </div>
                        ) : (
                          <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden mt-1">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                lead.quality === 'High' ? 'bg-emerald-500' : lead.quality === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'
                              )}
                              style={{ width: `${lead.qualityScore}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditingLead(lead);
                            setFormData({
                              name: lead.name,
                              email: lead.email,
                              company: lead.company,
                              website: lead.website,
                              phone: lead.phone,
                              status: lead.status
                            });
                            setIsAddingLead(true);
                          }}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination placeholder */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Showing {filteredLeads.length} of {leads.length} leads</p>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all disabled:opacity-30" disabled>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all disabled:opacity-30" disabled>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isAddingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900">{editingLead ? 'Edit Lead' : 'Create New Lead'}</h2>
              <button 
                onClick={() => setIsAddingLead(false)}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreateLead} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Full Name</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter full name"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Email Address</label>
                  <input 
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="name@company.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Company Name</label>
                  <input 
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder="Lead's company"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Website URL</label>
                  <input 
                    required
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    placeholder="example.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Phone Number</label>
                  <input 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Lead Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-gray-700"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Interested">Interested</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAddingLead(false)}
                  className="flex-1 py-4 border-2 border-gray-100 text-sm font-black rounded-2xl text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white text-sm font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  {editingLead ? 'Save Changes' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const X = ({ className, onClick }: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    onClick={onClick}
  >
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

export default LeadList;
