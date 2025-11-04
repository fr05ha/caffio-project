import { useState, useMemo, useEffect } from 'react';
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
import { api, Cafe } from './services/api';
import { Order, MenuItem, Review } from './types';
import { toast, Toaster } from 'sonner';
import { useTheme } from './hooks/useTheme';

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
  const [backendAverageRating, setBackendAverageRating] = useState<number>(0);
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
  const [selectedCafeId, setSelectedCafeId] = useState<number | null>(null);
  const [currentCafe, setCurrentCafe] = useState<Cafe | null>(null);

  // Apply theme based on cafe
  useTheme(currentCafe);

  useEffect(() => {
    async function loadData() {
      if (!selectedCafeId) {
        // Clear menu items when no cafe selected
        setMenuItems([]);
        setSelectedMenuId(null);
        return;
      }
      
      try {
        // Clear previous menu items first
        setMenuItems([]);
        setSelectedMenuId(null);
        
        // Load menus for cafe and flatten items into MenuItem shape
        const menus = await api.getMenusByCafe(selectedCafeId);
        const flattened = menus.flatMap(m => m.items).map((item) => ({
          id: String(item.id),
          name: item.name,
          description: item.description || '',
          price: item.price,
          image: item.imageUrl || 'https://images.unsplash.com/photo-1485808191679-5f86510681a2',
          category: item.category || 'Coffee',
          available: true,
        }));
        
        // Always set menu items (even if empty) to ensure clean state
        setMenuItems(flattened);
        if (menus.length) setSelectedMenuId(menus[0].id);

        // Load cafe for rating
        const cafe = await api.getCafe(selectedCafeId);
        if (typeof cafe.ratingAvg === 'number') {
          setBackendAverageRating(cafe.ratingAvg || 0);
        } else {
          setBackendAverageRating(0);
        }
      } catch (e) {
        // Clear on error and log
        console.warn('Failed to load from API, clearing menu data', e);
        setMenuItems([]);
        setSelectedMenuId(null);
        setBackendAverageRating(0);
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCafeId]);

  const handleLogin = (cafe: Cafe) => {
    setCurrentCafe(cafe);
    setSelectedCafeId(cafe.id);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentCafe(null);
    setSelectedCafeId(null);
    setSelectedMenuId(null);
    setMenuItems([]); // Clear menu items on logout
    setBackendAverageRating(0);
    setCurrentPage('dashboard');
    toast.info('Logged out successfully');
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(orders.map((order: Order) =>
      order.id === orderId ? { ...order, status } : order
    ));
  };

  const handleAddMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    try {
      if (!selectedCafeId) {
        toast.error('No cafe selected');
        return;
      }

      let menuId = selectedMenuId;
      if (!menuId) {
        // Create menu if it doesn't exist
        const menu = await api.createMenu({ cafeId: selectedCafeId });
        menuId = menu.id;
        setSelectedMenuId(menuId);
      }

      const created = await api.addMenuItem({
        menuId: menuId,
        name: item.name,
        description: item.description,
        price: item.price,
      });
      const mapped: MenuItem = {
        id: String(created.id),
        name: created.name,
        description: created.description || '',
        price: created.price,
        image: item.image,
        category: item.category,
        available: item.available,
      };
      setMenuItems([...menuItems, mapped]);
      toast.success('Menu item added successfully');
    } catch (e: any) {
      toast.error(e.message || 'Failed to add menu item');
      console.error('Error adding menu item:', e);
    }
  };

  const handleUpdateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      const itemId = parseInt(id);
      if (!isNaN(itemId)) {
        await api.updateMenuItem(itemId, {
          name: updates.name,
          description: updates.description,
          price: updates.price,
        });
      }
      setMenuItems(menuItems.map((item: MenuItem) =>
        item.id === id ? { ...item, ...updates } : item
      ));
    } catch (e) {
      // Fallback to local update on API failure
      setMenuItems(menuItems.map((item: MenuItem) =>
        item.id === id ? { ...item, ...updates } : item
      ));
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    try {
      const itemId = parseInt(id);
      if (!isNaN(itemId)) {
        await api.deleteMenuItem(itemId);
      }
      setMenuItems(menuItems.filter((item: MenuItem) => item.id !== id));
    } catch (e) {
      // Fallback to local delete on API failure
      setMenuItems(menuItems.filter((item: MenuItem) => item.id !== id));
    }
  };

  const averageRating = useMemo(() => {
    return backendAverageRating > 0
      ? backendAverageRating
      : (reviewsList.length > 0
          ? reviewsList.reduce((sum: number, review: Review) => sum + review.rating, 0) / reviewsList.length
          : 0);
  }, [backendAverageRating, reviewsList]);
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
          cafeName={currentCafe?.name}
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
