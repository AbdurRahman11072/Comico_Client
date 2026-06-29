"use client";

import { DataTable } from "@/components/dashboard/DataTable";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Edit, Play, Pause } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

export function AdsTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  // Dummy data for initial UI setup
  const [ads, setAds] = useState([
    { id: "1", title: "Summer Sale Promo", client: "Acme Corp", type: "BANNER", status: "ACTIVE", views: 15200, clicks: 430 },
    { id: "2", title: "New Manga App", client: "Tech Startup", type: "VIDEO", status: "PAUSED", views: 5000, clicks: 120 },
    { id: "3", title: "Gaming Mouse", client: "GamerGear", type: "BANNER", status: "DRAFT", views: 0, clicks: 0 }
  ]);

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;
    setAds(ads.filter(a => a.id !== id));
    toast.success("Ad deleted");
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    setAds(ads.map(a => a.id === id ? { ...a, status: newStatus } : a));
    toast.success(`Ad marked as ${newStatus}`);
  };

  const filteredAds = ads.filter(a => 
    (a.title.toLowerCase().includes(search.toLowerCase()) || 
     a.client.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === "ALL" || a.status === statusFilter)
  );

  return (
    <div className="space-y-4">
      <div className="glass p-4 rounded-2xl flex flex-col lg:flex-row gap-4 items-center border border-white/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10" 
            placeholder="Search by title or client..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="bg-background/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="DRAFT">Draft</option>
        </select>
        <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          Create Ad
        </button>
      </div>

      <DataTable 
        data={filteredAds}
        columns={[
          { header: "Title", accessor: (item: any) => <span className="font-bold">{item.title}</span> },
          { header: "Client", accessor: (item: any) => item.client },
          { header: "Type", accessor: (item: any) => item.type, className: "text-muted-foreground text-sm" },
          { 
            header: "Status", 
            accessor: (item: any) => (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                item.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20' : 
                item.status === 'PAUSED' ? 'text-orange-400 bg-orange-400/10 border border-orange-400/20' : 
                'text-muted-foreground bg-white/5 border border-white/10'
              }`}>
                {item.status}
              </span>
            )
          },
          { header: "Views / Clicks", accessor: (item: any) => `${item.views.toLocaleString()} / ${item.clicks.toLocaleString()}`, className: "font-mono text-sm" },
          { 
            header: "Actions", 
            accessor: (item: any) => (
              <div className="flex items-center justify-end gap-2">
                {item.status !== 'DRAFT' && (
                  <button 
                    onClick={() => handleToggleStatus(item.id, item.status)}
                    className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-muted-foreground"
                    title={item.status === 'ACTIVE' ? 'Pause Ad' : 'Activate Ad'}
                  >
                    {item.status === 'ACTIVE' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                )}
                <button 
                  className="p-2 hover:bg-blue-500/10 hover:text-blue-500 rounded-lg transition-colors text-muted-foreground"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-muted-foreground"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ),
            className: "text-right"
          }
        ]}
      />
    </div>
  );
}
