import React, { useEffect } from 'react';
import { 
  Users, 
  Package, 
  TrendingUp, 
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const StatCard = ({ title, value, icon: Icon, change, isPositive }: any) => (
  <Card className="border-neutral-100 shadow-sm overflow-hidden relative">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xs font-bold uppercase tracking-widest text-neutral-400">{title}</CardTitle>
      <div className="p-2 bg-neutral-50 rounded-lg">
        <Icon className="w-4 h-4 text-neutral-900" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs mt-1 flex items-center gap-1">
        {isPositive ? (
          <ArrowUpRight className="w-3 h-3 text-green-500" />
        ) : (
          <ArrowDownRight className="w-3 h-3 text-red-500" />
        )}
        <span className={isPositive ? 'text-green-600' : 'text-red-600'}>{change}%</span>
        <span className="text-neutral-400 font-medium ml-1">vs last month</span>
      </p>
    </CardContent>
  </Card>
);

export const DashboardHome: React.FC = () => {
  const { products, orders, fetchProducts, fetchOrders } = useAdminStore();
  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, [fetchProducts, fetchOrders]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${totalRevenue.toLocaleString()}`} 
          icon={TrendingUp} 
          change={12.5} 
          isPositive={true} 
        />
        <StatCard 
          title="Total Orders" 
          value={orders.length} 
          icon={ShoppingCart} 
          change={8.2} 
          isPositive={true} 
        />
        <StatCard 
          title="Total Products" 
          value={products.length} 
          icon={Package} 
          change={2.4} 
          isPositive={true} 
        />
        <StatCard 
          title="Active Users" 
          value="1.2k" 
          icon={Users} 
          change={4.1} 
          isPositive={false} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-neutral-100 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-600 text-xs">
                      {order.customer.firstName[0]}{order.customer.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{order.customer.firstName} {order.customer.lastName}</p>
                      <p className="text-xs text-neutral-400">{order.customer.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">+${order.total.toLocaleString()}</p>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-tighter">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-100 shadow-sm bg-amber-500 text-white">
          <CardHeader>
            <CardTitle className="text-white">Store Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/90">
                <span>Conversion Rate</span>
                <span>3.2%</span>
              </div>
              <div className="h-1.5 w-full bg-amber-600 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[32%]" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/90">
                <span>Inventory Health</span>
                <span>88%</span>
              </div>
              <div className="h-1.5 w-full bg-amber-600 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[88%]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/90">
                <span>Customer Satisfaction</span>
                <span>94%</span>
              </div>
              <div className="h-1.5 w-full bg-amber-600 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[94%]" />
              </div>
            </div>

            <div className="pt-4">
               <p className="text-xs text-white/80 leading-relaxed">
                Your architectural furniture collection is performing 15% better than last quarter in the "Seating" category. Consider expanding the "Lighting" range.
               </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};