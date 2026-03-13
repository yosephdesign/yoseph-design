import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Search, 
  Filter, 
  MoreVertical,
  Eye,
  CheckCircle2,
  Package,
  Truck,
  History,
  Loader2
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { Order, OrderStatus } from '../../types/admin';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '../ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800",
    processed: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  
  return (
    <Badge variant="outline" className={`${styles[status]} border-none font-medium capitalize px-3 py-1 rounded-full`}>
      {status}
    </Badge>
  );
};

export const OrderManagement: React.FC = () => {
  const { orders, loading, fetchOrders, updateOrderStatus } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input 
            placeholder="Search order ID or customer email..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {['all', 'pending', 'processed', 'shipped', 'delivered'].map((s) => (
            <Button 
              key={s} 
              variant={statusFilter === s ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setStatusFilter(s as any)}
              className="capitalize shrink-0"
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50 hover:bg-neutral-50 border-b border-neutral-100">
              <TableHead className="w-[150px]">Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id} className="hover:bg-neutral-50/50 transition-colors border-b border-neutral-100">
                <TableCell className="font-mono font-medium text-xs">{order.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{order.customer.firstName} {order.customer.lastName}</span>
                    <span className="text-xs text-neutral-400">{order.customer.email}</span>
                  </div>
                </TableCell>
                <TableCell className="text-neutral-500">
                   {format(new Date(order.date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="font-semibold">${order.total.toLocaleString()}</TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedOrder(order)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'processed')} className="gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-500" /> Mark as Processed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'shipped')} className="gap-2">
                          <Truck className="w-4 h-4 text-purple-500" /> Mark as Shipped
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'delivered')} className="gap-2">
                          <Package className="w-4 h-4 text-green-500" /> Mark as Delivered
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Order Details
              {selectedOrder && <StatusBadge status={selectedOrder.status} />}
            </DialogTitle>
            <DialogDescription>
              Order ID: {selectedOrder?.id} • Placed on {selectedOrder && format(new Date(selectedOrder.date), 'PPP p')}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Customer Info</h4>
                <div className="space-y-2">
                  <p className="font-medium">{selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</p>
                  <p className="text-sm text-neutral-600">{selectedOrder.customer.email}</p>
                  <p className="text-sm text-neutral-600">
                    {selectedOrder.customer.address}<br />
                    {selectedOrder.customer.city}, {selectedOrder.customer.zipCode}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Order Summary</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 flex items-center justify-center bg-neutral-100 rounded text-[10px] font-bold">{item.quantity}</span>
                        {item.name}
                      </span>
                      <span className="font-medium">${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-neutral-100 flex justify-between items-center font-bold">
                    <span>Total</span>
                    <span className="text-lg">${selectedOrder.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};