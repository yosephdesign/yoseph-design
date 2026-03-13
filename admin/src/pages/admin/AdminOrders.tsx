import React from 'react';
import { useShop } from '../../context/ShopContext';
import { Search, Filter, Mail, Package, CheckCircle, Clock, XCircle, MoreVertical } from 'lucide-react';

export const AdminOrders = () => {
  const { orders, updateOrderStatus } = useShop();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-light tracking-tight">Client Orders</h2>
          <p className="text-xs text-neutral-400 uppercase tracking-widest mt-1">Track and manage client acquisitions</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="px-6 py-3 border border-neutral-200 text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors">Export Report</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OrderStat label="Pending" count={orders.filter(o => o.status === 'pending').length} color="bg-amber-500" />
        <OrderStat label="Shipped" count={orders.filter(o => o.status === 'shipped').length} color="bg-blue-500" />
        <OrderStat label="Delivered" count={orders.filter(o => o.status === 'delivered').length} color="bg-emerald-500" />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input 
              type="text" 
              placeholder="Search orders by client or ID..." 
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border-none outline-none text-sm focus:ring-1 focus:ring-black rounded-lg transition-all"
            />
          </div>
          <button className="px-4 py-2 border border-neutral-200 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-neutral-50 transition-colors">
            <Filter size={14} />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50/50 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold font-mono">#{order.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{order.customerName}</span>
                      <span className="text-[10px] text-neutral-400 uppercase tracking-tighter">{order.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 font-medium text-sm">
                    ${order.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative group">
                      <button className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' :
                        order.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                        order.status === 'shipped' ? 'bg-blue-50 text-blue-600' :
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {order.status === 'pending' && <Clock size={12} />}
                        {order.status === 'shipped' && <Package size={12} />}
                        {order.status === 'delivered' && <CheckCircle size={12} />}
                        {order.status === 'cancelled' && <XCircle size={12} />}
                        {order.status}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select 
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                        value={order.status}
                        className="text-[10px] font-bold uppercase tracking-widest border border-neutral-200 rounded px-2 py-1 outline-none focus:border-black"
                      >
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const OrderStat = ({ label, count, color }: { label: string, count: number, color: string }) => (
  <div className="bg-white border border-neutral-200 p-6 rounded-xl shadow-sm flex items-center justify-between">
    <div>
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">{label}</h4>
      <p className="text-2xl font-light">{count}</p>
    </div>
    <div className={`w-3 h-3 rounded-full ${color}`} />
  </div>
);