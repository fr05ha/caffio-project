import { useState, useMemo } from 'react';
import { LoginPage } from './components/admin/LoginPage';
import { DashboardLayout } from './components/admin/DashboardLayout';
import { DashboardPage } from './components/admin/DashboardPage';
import { OrdersPage } from './components/admin/OrdersPage';
import { MenuPage } from './components/admin/MenuPage';
import { ReviewsPage } from './components/admin/ReviewsPage';
import { DeliveryPage } from './components/admin/DeliveryPage';
import { SettingsPage } from './components/admin/SettingsPage';
import { adminOrders, reviews, deliveryDrivers } from './data/adminMockData';
import { menuItems as customerMenuItems } from './data/mockData';
import { Order, MenuItem, Review } from './types';
import { toast, Toaster } from 'sonner';

type Page = 'dashboard' | 'orders' | 'menu' | 'reviews' | 'delivery' | 'settings';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const handlePageChange = (page: string) => {
    setCurrentPage(page as Page);
  };
  const [orders, setOrders] = useState<Order[]>(adminOrders);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(customerMenuItems?.['1'] ?? []);
  const reviewsList = useState<Review[]>(reviews)[0];

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
    toast.info('Logged out successfully');
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(orders.map((order: Order) =>
      order.id === orderId ? { ...order, status } : order
    ));
  };

  const handleAddMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `item-${Date.now()}`,
    };
    setMenuItems([...menuItems, newItem]);
  };

  const handleUpdateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems(menuItems.map((item: MenuItem) =>
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const handleDeleteMenuItem = (id: string) => {
    setMenuItems(menuItems.filter((item: MenuItem) => item.id !== id));
  };

  const averageRating = useMemo(() => {
    return reviewsList.length > 0
      ? reviewsList.reduce((sum: number, review: Review) => sum + review.rating, 0) / reviewsList.length
      : 0;
  }, [reviewsList]);
  return (
    <>
      <Toaster position="top-right" />
      {!isLoggedIn ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <DashboardLayout
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onLogout={handleLogout}
        >
          {currentPage === 'dashboard' && (
            <DashboardPage orders={orders} averageRating={averageRating} />
          )}
          {currentPage === 'orders' && (
            <OrdersPage orders={orders} onUpdateOrderStatus={handleUpdateOrderStatus} />
          )}
          {currentPage === 'menu' && (
            <MenuPage
              menuItems={menuItems}
              onAddItem={handleAddMenuItem}
              onUpdateItem={handleUpdateMenuItem}
              onDeleteItem={handleDeleteMenuItem}
            />
          )}
          {currentPage === 'reviews' && (
            <ReviewsPage reviews={reviewsList} />
          )}
          {currentPage === 'delivery' && (
            <DeliveryPage drivers={deliveryDrivers} orders={orders} />
          )}
          {currentPage === 'settings' && <SettingsPage />}
        </DashboardLayout>
      )}
    </>
  );
}
