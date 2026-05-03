import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Database, Search, Map, Activity, Users, Settings, Bell, LayoutDashboard, Key, Copy, Plus, Server, Shield, Zap, RefreshCw, Terminal, CheckCircle2 } from 'lucide-react';

const data = [
  { name: 'Jan', requests: 4000 },
  { name: 'Feb', requests: 3000 },
  { name: 'Mar', requests: 5000 },
  { name: 'Apr', requests: 8780 },
  { name: 'May', requests: 12000 },
  { name: 'Jun', requests: 15400 },
];

const stateDistribution = [
  { name: 'UP', count: 107000 },
  { name: 'MP', count: 54000 },
  { name: 'MH', count: 43000 },
  { name: 'RJ', count: 44000 },
  { name: 'BR', count: 45000 },
];

const mockLogs = [
  { id: 1, method: 'GET', endpoint: '/api/v1/search?q=ampur', status: 200, latency: '42ms', time: 'Just now', user: 'Acme Corp' },
  { id: 2, method: 'GET', endpoint: '/api/v1/states', status: 200, latency: '12ms', time: '1 min ago', user: 'Startup Inc' },
  { id: 3, method: 'GET', endpoint: '/api/v1/autocomplete?q=ram', status: 200, latency: '28ms', time: '2 mins ago', user: 'Acme Corp' },
  { id: 4, method: 'POST', endpoint: '/api/v1/villages', status: 401, latency: '5ms', time: '5 mins ago', user: 'Unknown' },
  { id: 5, method: 'GET', endpoint: '/api/v1/districts?stateId=9', status: 200, latency: '89ms', time: '10 mins ago', user: 'Internal App' },
];

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/20 group">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all duration-300">
        <Icon size={24} />
      </div>
      <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${trend > 0 ? 'bg-emerald-500/10 text-emerald-400' : trend === 0 ? 'bg-slate-500/10 text-slate-400' : 'bg-rose-500/10 text-rose-400'}`}>
        {trend > 0 ? '+' : ''}{trend}%
      </span>
    </div>
    <h3 className="text-slate-400 font-medium text-sm mb-1">{title}</h3>
    <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
  </div>
);

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // States for DB Tab
  const [dbStats, setDbStats] = useState({ states: 0, districts: 0, subdistricts: 0 });
  const [statesList, setStatesList] = useState([]);
  const [isLoadingDB, setIsLoadingDB] = useState(false);

  // States for Settings
  const [settings, setSettings] = useState({
    maintenance: false,
    requireAuth: true,
    trigram: true
  });

  // States for Logs
  const [liveLogs, setLiveLogs] = useState(mockLogs);

  useEffect(() => {
    // Simulated live log polling
    const interval = setInterval(() => {
      if(activeTab === 'requests') {
        const methods = ['GET'];
        const users = ['Acme Corp', 'Startup Inc', 'Internal App', 'Unknown'];
        const endpoints = ['/api/v1/search?q=pur', '/api/v1/states', '/api/v1/autocomplete?q=dev', '/api/v1/districts'];
        const newLog = {
          id: Date.now(),
          method: methods[Math.floor(Math.random() * methods.length)],
          endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
          status: Math.random() > 0.9 ? 429 : 200,
          latency: Math.floor(Math.random() * 80 + 10) + 'ms',
          time: 'Just now',
          user: users[Math.floor(Math.random() * users.length)]
        };
        setLiveLogs(prev => [newLog, ...prev].slice(0, 15));
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sRes, dRes, sdRes] = await Promise.all([
          fetch('http://localhost:3001/api/v1/states').then(r => r.json()),
          fetch('http://localhost:3001/api/v1/districts').then(r => r.json()),
          fetch('http://localhost:3001/api/v1/subdistricts').then(r => r.json())
        ]);
        setDbStats({
          states: sRes.count,
          districts: dRes.count,
          subdistricts: sdRes.count
        });
        setStatesList(sRes.data || []);
      } catch (err) {
        console.error("DB connection offline");
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`http://localhost:3001/api/v1/search?q=${searchQuery}`);
        const data = await res.json();
        setSearchResults(data.data || []);
      } catch (e) {
        console.error(e);
      }
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleSetting = (key) => setSettings(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans selection:bg-indigo-500/30 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-[#0B1120]/80 backdrop-blur-xl z-50 flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 text-white mb-10">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/30">
              <Map size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight">VillageAPI</span>
          </div>
          
          <nav className="space-y-2">
            {[
              { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
              { id: 'database', icon: Database, label: 'Database Explorer' },
              { id: 'requests', icon: Activity, label: 'API Requests' },
              { id: 'users', icon: Users, label: 'B2B Users' },
              { id: 'settings', icon: Settings, label: 'Settings' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id 
                    ? 'bg-indigo-500/10 text-indigo-400 font-medium' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <item.icon size={20} className={activeTab === item.id ? 'animate-pulse' : ''} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto h-screen relative">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1 capitalize">
              {activeTab === 'users' ? 'B2B User Portal' : activeTab.replace('-', ' ')}
            </h1>
            <p className="text-slate-400">Connected to NeonDB • Serverless Edge</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group z-50">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search villages..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-800/50 border border-slate-700 rounded-full pl-10 pr-4 py-2.5 text-sm w-72 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
              />
              {/* Search Dropdown */}
              {searchQuery.length >= 3 && (
                <div className="absolute top-full mt-2 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-sm text-slate-400 text-center animate-pulse">Searching NeonDB...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-sm text-slate-400 text-center">No villages found.</div>
                  ) : (
                    <div className="py-2">
                      {searchResults.map(v => (
                        <div key={v.id} className="px-4 py-2 hover:bg-slate-700/50 cursor-pointer">
                          <p className="text-sm font-medium text-white">{v.name}</p>
                          <p className="text-xs text-slate-400">
                            {v.subDistrict?.district?.state?.name} &rsaquo; {v.subDistrict?.district?.name} &rsaquo; {v.subDistrict?.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <button className="p-2.5 rounded-full bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px]">
              <div className="h-full w-full rounded-full bg-slate-900 border-2 border-[#0B1120] flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
            </div>
          </div>
        </header>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Villages" value="537,610" icon={Map} trend={0} />
              <StatCard title="States & UTs" value={dbStats.states || '...'} icon={Database} trend={0} />
              <StatCard title="Districts" value={dbStats.districts || '...'} icon={Database} trend={0} />
              <StatCard title="Sub-Districts" value={dbStats.subdistricts || '...'} icon={Database} trend={0} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-800/30 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">API Usage Trends</h2>
                  <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-sm outline-none focus:border-indigo-500">
                    <option>Last 6 Months</option>
                  </select>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        itemStyle={{ color: '#e2e8f0' }}
                      />
                      <Area type="monotone" dataKey="requests" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRequests)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-800/30 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50">
                <h2 className="text-lg font-semibold text-white mb-6">Top States by Villages</h2>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stateDistribution} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                      <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        cursor={{fill: '#334155', opacity: 0.4}}
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {/* DATABASE EXPLORER TAB */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
              <CheckCircle2 className="text-emerald-400" />
              <div>
                <h3 className="text-emerald-400 font-medium">Database Connected</h3>
                <p className="text-sm text-slate-300">NeonDB Serverless PostgreSQL is perfectly synced.</p>
              </div>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden flex flex-col h-[500px]">
              <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700/50 flex justify-between items-center">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Database size={18} className="text-indigo-400" />
                  States Overview ({statesList.length})
                </h2>
                <button 
                  onClick={() => setIsLoadingDB(true)} 
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                  <RefreshCw size={16} className={isLoadingDB ? 'animate-spin' : ''} onAnimationIteration={() => setIsLoadingDB(false)} />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {statesList.map(state => (
                    <div key={state.id} className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/20 hover:bg-slate-800/60 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-white">{state.name}</span>
                        <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">ID: {state.id}</span>
                      </div>
                      <p className="text-xs text-slate-400">Sync status: Synced</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div className="space-y-6 h-[calc(100vh-200px)]">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden h-full flex flex-col font-mono text-sm relative shadow-2xl">
              <div className="bg-[#0f172a] px-4 py-3 border-b border-slate-800 flex items-center gap-3">
                <Terminal size={18} className="text-slate-400" />
                <span className="text-slate-300 font-semibold tracking-wide">Live Request Logs</span>
                <span className="ml-auto flex items-center gap-2 text-xs text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Monitoring Port 3001
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {liveLogs.map((log) => (
                  <div key={log.id} className="flex items-center gap-4 py-2 border-b border-slate-800/50 hover:bg-slate-800/20 px-2 rounded transition-colors group">
                    <span className="text-slate-500 w-24 shrink-0">{log.time}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${log.method === 'GET' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {log.method}
                    </span>
                    <span className="text-slate-300 flex-1 truncate">{log.endpoint}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${log.status === 200 ? 'text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {log.status}
                    </span>
                    <span className="text-slate-400 w-16 text-right">{log.latency}</span>
                    <span className="text-slate-500 w-32 truncate text-right">{log.user}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-3xl">
            <div className="bg-slate-800/30 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Server size={20} className="text-indigo-400" /> Platform Configuration
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                  <div>
                    <h3 className="font-medium text-white">Maintenance Mode</h3>
                    <p className="text-sm text-slate-400">Disable API access for all B2B users temporarily.</p>
                  </div>
                  <button 
                    onClick={() => toggleSetting('maintenance')}
                    className={`w-12 h-6 rounded-full transition-colors relative ${settings.maintenance ? 'bg-indigo-500' : 'bg-slate-600'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.maintenance ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                  <div>
                    <h3 className="font-medium text-white flex items-center gap-2">
                      <Shield size={16} className="text-emerald-400" /> Require B2B Auth
                    </h3>
                    <p className="text-sm text-slate-400">Enforce X-API-Key and Secret on all endpoints.</p>
                  </div>
                  <button 
                    onClick={() => toggleSetting('requireAuth')}
                    className={`w-12 h-6 rounded-full transition-colors relative ${settings.requireAuth ? 'bg-indigo-500' : 'bg-slate-600'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.requireAuth ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <h3 className="font-medium text-white flex items-center gap-2">
                      <Zap size={16} className="text-amber-400" /> Trigram Fuzzy Search
                    </h3>
                    <p className="text-sm text-slate-400">Use pg_trgm for advanced typo tolerance in search.</p>
                  </div>
                  <button 
                    onClick={() => toggleSetting('trigram')}
                    className={`w-12 h-6 rounded-full transition-colors relative ${settings.trigram ? 'bg-indigo-500' : 'bg-slate-600'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.trigram ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50">
              <h2 className="text-xl font-bold text-white mb-6">Environment Variables</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">DATABASE_URL (NeonDB)</label>
                  <div className="relative">
                    <input type="password" value="postgresql://neondb_owner:***********@ep-lively..." readOnly className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-300 focus:outline-none" />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><Copy size={16}/></button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">UPSTASH_REDIS_REST_URL</label>
                  <div className="relative">
                    <input type="password" value="************************" readOnly className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-300 focus:outline-none" />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><Copy size={16}/></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* B2B USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">API Key Management</h2>
                <p className="text-sm text-slate-400">Generate and manage API keys for your B2B customers.</p>
              </div>
              <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <Plus size={18} />
                Generate New Key
              </button>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/50 border-b border-slate-700/50">
                    <th className="px-6 py-4 text-sm font-semibold text-slate-300">Company</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-300">Plan</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-300">API Key</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-300">Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">Acme Corp</p>
                      <p className="text-xs text-slate-400">acme@example.com</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-purple-500/10 text-purple-400 text-xs font-medium px-2.5 py-1 rounded-full border border-purple-500/20">Ultra</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-300">
                      sk_live_...4f9a
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-sm text-slate-300">Active</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-slate-400 hover:text-white transition-colors" title="Copy Full Key">
                        <Copy size={18} />
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">Startup Inc.</p>
                      <p className="text-xs text-slate-400">hello@startup.io</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-700 text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full border border-slate-600">Free</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-300">
                      sk_live_...b2c1
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-sm text-slate-300">Active</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-slate-400 hover:text-white transition-colors" title="Copy Full Key">
                        <Copy size={18} />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6 flex gap-4 mt-8">
              <Key className="text-indigo-400 shrink-0" size={24} />
              <div>
                <h3 className="text-indigo-400 font-semibold mb-1">Upstash Rate Limiting Active</h3>
                <p className="text-slate-300 text-sm">
                  Requests to the Edge API are actively monitored. "Free" plan users are limited to 100 req/day, while "Ultra" plan users get 10,000 req/day enforced by Upstash Redis.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
