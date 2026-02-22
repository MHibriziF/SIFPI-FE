import { FolderKanban, Users, FileText, TrendingUp } from 'lucide-react';

const STATS = [
  { label: 'Total Projects', value: '142', icon: FolderKanban, change: '+12 this month' },
  { label: 'Registered Users', value: '38', icon: Users, change: '+5 this month' },
  { label: 'Pending Reports', value: '7', icon: FileText, change: '3 require action' },
  { label: 'Active Investments', value: '89', icon: TrendingUp, change: '+8 this month' },
];

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back. Here&apos;s what&apos;s happening with IPFO SIFPI.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map(stat => (
          <div key={stat.label} className="rounded-xl border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className="size-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h2 className="text-sm font-medium mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {[
            'Project "Bendungan Merangin" submitted for review.',
            'User budi.santoso@example.com registered.',
            'Report #041 approved by admin.',
            'Project "Terminal Peti Kemas Bitung" status updated to Active.',
          ].map((item, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
              <span className="text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
