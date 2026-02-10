const SOURCES = [
  { name: 'Google Search', val: '45%', color: 'bg-blue-500' },
  { name: 'Facebook Ads', val: '25%', color: 'bg-rose-500' },
  { name: 'Direct', val: '15%', color: 'bg-emerald-500' },
  { name: 'Referral', val: '10%', color: 'bg-amber-500' },
  { name: 'Others', val: '5%', color: 'bg-gray-500' },
];

export default function TrafficSources() {
  return (
    <div className="space-y-6">
      {SOURCES.map((source, i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{source.name}</span>
            <span className="text-white font-medium">{source.val}</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full ${source.color}`} style={{ width: source.val }} />
          </div>
        </div>
      ))}
    </div>
  );
}
