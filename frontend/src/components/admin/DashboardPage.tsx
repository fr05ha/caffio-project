import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Order } from '../../types';
import { DollarSign, ShoppingBag, Star, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DashboardPageProps {
  orders: Order[];
  averageRating: number;
}

export function DashboardPage({ orders, averageRating }: DashboardPageProps) {
  const today = new Date();
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.orderTime);
    return orderDate.toDateString() === today.toDateString();
  });

  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
  const completedToday = todayOrders.filter(o => o.status === 'delivered').length;

  const weekData = [
    { day: 'Mon', orders: 45, revenue: 450 },
    { day: 'Tue', orders: 52, revenue: 520 },
    { day: 'Wed', orders: 48, revenue: 480 },
    { day: 'Thu', orders: 61, revenue: 610 },
    { day: 'Fri', orders: 78, revenue: 780 },
    { day: 'Sat', orders: 85, revenue: 850 },
    { day: 'Sun', orders: 72, revenue: 720 },
  ];

  const recentOrders = orders.slice(0, 5);

  const stats = [
    {
      title: "Today's Revenue",
      value: `$${todayRevenue.toFixed(2)}`,
      icon: DollarSign,
      trend: '+12.5%',
      color: 'bg-green-500',
    },
    {
      title: "Today's Orders",
      value: todayOrders.length.toString(),
      icon: ShoppingBag,
      trend: '+8.2%',
      color: 'bg-blue-500',
    },
    {
      title: 'Average Rating',
      value: averageRating.toFixed(1),
      icon: Star,
      trend: '+0.3',
      color: 'bg-yellow-500',
    },
    {
      title: 'Pending Orders',
      value: pendingOrders.toString(),
      icon: Clock,
      trend: `${pendingOrders} active`,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <Badge variant="secondary" className="text-green-600 bg-green-50">
                  {stat.trend}
                </Badge>
              </div>
              <p className="text-gray-600 mb-1">{stat.title}</p>
              <h2>{stat.value}</h2>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <Card className="p-6">
          <h3 className="mb-4">Weekly Orders</h3>
          <ChartContainer
            config={{
              orders: {
                label: 'Orders',
                color: 'hsl(var(--chart-1))',
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData}>
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="orders" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>

        {/* Revenue Chart */}
        <Card className="p-6">
          <h3 className="mb-4">Weekly Revenue</h3>
          <ChartContainer
            config={{
              revenue: {
                label: 'Revenue',
                color: 'hsl(var(--chart-2))',
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekData}>
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="p-6">
        <h3 className="mb-4">Recent Orders</h3>
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p>{order.id}</p>
                  <Badge variant={
                    order.status === 'delivered' ? 'default' :
                    order.status === 'pending' ? 'secondary' :
                    'outline'
                  }>
                    {order.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{order.customerName}</p>
                <p className="text-sm text-gray-500">
                  {order.items.length} items • {new Date(order.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="text-right">
                <p>${order.total.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
