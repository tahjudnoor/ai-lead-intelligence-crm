import React, { useState, useEffect } from 'react';
import { leadService } from '../../services/lead.service';
import { DashboardStats, LeadStatus } from '../../types/lead';
import { 
  Users, 
  UserCheck, 
  BarChart3, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Search,
  ChevronRight,
  Brain
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await leadService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  if (!stats) return <div className="animate-pulse flex items-center justify-center h-full text-indigo-600 font-bold">Loading dashboard...</div>;

  const cards = [
    { 
      label: 'Total Leads', 
      value: stats.totalLeads, 
      icon: Users, 
      color: 'bg-blue-500', 
      trend: '+12%', 
      isUp: true,
      description: 'Potential business growth'
    },
    { 
      label: 'Converted', 
      value: stats.convertedLeads, 
      icon: UserCheck, 
      color: 'bg-green-500', 
      trend: '+5%', 
      isUp: true,
      description: 'Successfully closed deals'
    },
    { 
      label: 'Avg. Quality', 
      value: `${stats.averageQualityScore}%`, 
      icon: Brain, 
      color: 'bg-purple-500', 
      trend: '+8%', 
      isUp: true,
      description: 'AI-calculated score'
    },
    { 
      label: 'In Progress', 
      value: stats.leadsByStatus['Contacted'] + stats.leadsByStatus['Interested'], 
      icon: BarChart3, 
      color: 'bg-orange-500', 
      trend: '-2%', 
      isUp: false,
      description: 'Leads being processed'
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Executive Dashboard</h1>
          <p className="mt-1 text-gray-500 font-medium">Welcome back, here's what's happening with your leads.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link 
            to="/leads" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-2xl shadow-lg shadow-indigo-100 text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-[1.02]"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add New Lead
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3.5 rounded-2xl ${card.color} bg-opacity-10 text-${card.color.split('-')[1]}-600 group-hover:scale-110 transition-transform`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div className={`flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded-full ${card.isUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {card.isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                <span>{card.trend}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{card.label}</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">{card.value}</h3>
              <p className="text-xs text-gray-400 mt-2 font-medium">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Status Distribution */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Lead Status Pipeline</h2>
              <p className="text-sm text-gray-500 font-medium">Overview of current pipeline stages</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-xl">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          
          <div className="space-y-6">
            {(Object.entries(stats.leadsByStatus) as [LeadStatus, number][]).map(([status, count]) => {
              const percentage = stats.totalLeads ? (count / stats.totalLeads) * 100 : 0;
              const colors: Record<LeadStatus, string> = {
                'New': 'bg-blue-500',
                'Contacted': 'bg-indigo-500',
                'Interested': 'bg-amber-500',
                'Closed': 'bg-emerald-500'
              };
              
              return (
                <div key={status} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-gray-700 flex items-center">
                      <span className={`w-2 h-2 rounded-full ${colors[status]} mr-2.5`}></span>
                      {status}
                    </span>
                    <span className="text-sm font-black text-gray-900">{count} leads <span className="text-gray-400 font-bold ml-1 text-xs">({Math.round(percentage)}%)</span></span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                    <div 
                      className={`h-full ${colors[status]} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-200 p-8 text-white relative overflow-hidden group">
          <div className="absolute -right-12 -top-12 h-64 w-64 bg-white opacity-5 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
          <div className="absolute -left-12 -bottom-12 h-48 w-48 bg-indigo-400 opacity-10 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="bg-white bg-opacity-20 p-3 rounded-2xl w-fit mb-6">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-black mb-3">AI Smart Insight</h2>
            <p className="text-indigo-100 font-medium leading-relaxed mb-8 flex-1">
              "You have <span className="text-white font-bold">{stats.leadsByStatus['Interested']} interested leads</span> that haven't been contacted in 24 hours. High-quality leads are 60% more likely to convert if reached today."
            </p>
            <Link 
              to="/leads" 
              className="bg-white text-indigo-600 px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center hover:bg-indigo-50 transition-all active:scale-95 shadow-xl shadow-indigo-800/20"
            >
              Take Action Now
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
