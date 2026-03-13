import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useShop } from '../../context/ShopContext';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export const AdminDashboard = () => {
  const { orders, products } = useShop();
  
  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;

  const data = [
    { name: 'Jan', orders: 12, revenue: 14500 },
    { name: 'Feb', orders: 19, revenue: 21000 },
    { name: 'Mar', orders: 15, revenue: 18000 },
    { name: 'Apr', orders: 22, revenue: 29000 },
    { name: 'May', orders: 30, revenue: 38000 },
    { name: 'Jun', orders: 25, revenue: 32000 },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${totalRevenue.toLocaleString()}`} 
          trend="+12.5%" 
          trendUp={true}
          icon={<DollarSign className="text-emerald-500" size={20} />} 
        />
        <StatCard 
          title="Total Orders" 
          value={totalOrders.toString()} 
          trend="+5.2%" 
          trendUp={true}
          icon={<ShoppingBag className="text-blue-500" size={20} />} 
        />
        <StatCard 
          title="Avg. Order Value" 
          value={`$${(totalRevenue / (totalOrders || 1)).toFixed(0)}`} 
          trend="-2.4%" 
          trendUp={false}
          icon={<TrendingUp className="text-amber-500" size={20} />} 
        />
        <StatCard 
          title="Total Products" 
          value={totalProducts.toString()} 
          trend="+2" 
          trendUp={true}
          icon={<Users className="text-purple-500" size={20} />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-neutral-200 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest">Revenue Analytics</h3>
            <select className="text-xs bg-neutral-50 border-none outline-none focus:ring-0 rounded-md p-1 font-medium">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#000" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-6 rounded-xl shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag size={16} className="text-neutral-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold">New order: {order.id}</p>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-tighter">
                    {new Date(order.createdAt).toLocaleDateString()} \u2022 ${order.total.toLocaleString()}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                  order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                  'bg-neutral-100 text-neutral-700'
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 text-[10px] font-bold uppercase tracking-widest border border-neutral-200 hover:border-black transition-colors rounded-lg">
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend, trendUp, icon }: any) => (
  <div className="bg-white border border-neutral-200 p-6 rounded-xl shadow-sm">
    <div className="flex items-start justify-between mb-4">
      <div className="p-2 bg-neutral-50 rounded-lg">
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-bold ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
        {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {trend}
      </div>
    </div>
    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1">{title}</h4>
    <p className="text-2xl font-light tracking-tight">{value}</p>
  </div>
);