import { useState, useMemo, useEffect } from 'react';
import { LoginPage } from './components/admin/LoginPage';
import { DashboardLayout } from './components/admin/DashboardLayout';
import { DashboardPage } from './components/admin/DashboardPage';
import { OrdersPage } from './components/admin/OrdersPage';
import { MenuPage } from './components/admin/MenuPage';
import { ReviewsPage } from './components/admin/ReviewsPage';
import { DeliveryPage } from './components/admin/DeliveryPage';
import { SettingsPage } from './components/admin/SettingsPage';
import { adminOrders, deliveryDrivers } from './data/adminMockData';
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(customerMenuItems?.['1'] ?? []);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
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
        setOrders([]);
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
          customizations: item.customizations || undefined,
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

        // Load orders for cafe
        const ordersData = await api.getOrdersByCafe(selectedCafeId);
        const mappedOrders: Order[] = ordersData.map((order) => ({
          id: String(order.id),
          shopId: String(order.cafeId),
          orderType: order.orderType,
          shopName: order.cafe?.name || 'Unknown Cafe',
          customerName: order.customerName || order.customer?.name || 'Unknown Customer',
          customerPhone: order.customerPhone || '',
          items: order.items.map((item) => ({
            id: String(item.menuItemId),
            name: item.name,
            description: item.description || '',
            price: item.price,
            image: '',
            category: '',
            quantity: item.quantity,
            shopId: String(order.cafeId),
            shopName: order.cafe?.name || 'Unknown Cafe',
          })),
          total: order.total,
          status: order.status,
          orderTime: order.createdAt,
          deliveryAddress: order.deliveryAddress || '',
        }));
        setOrders(mappedOrders);

        // Load reviews for cafe
        const reviewsData = await api.getReviewsByCafe(selectedCafeId);
        const mappedReviews: Review[] = reviewsData.map((review) => ({
          id: String(review.id),
          customerName: review.customerName || review.customer?.name || 'Anonymous',
          rating: review.rating,
          comment: review.text || '',
          date: review.createdAt,
          orderId: '', // Reviews are not necessarily tied to orders
        }));
        setReviewsList(mappedReviews);
      } catch (e) {
        // Clear on error and log
        console.warn('Failed to load from API, clearing menu data', e);
        setMenuItems([]);
        setSelectedMenuId(null);
        setBackendAverageRating(0);
        setOrders([]);
        setReviewsList([]);
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

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const orderIdNum = parseInt(orderId);
      if (isNaN(orderIdNum)) {
        toast.error('Invalid order ID');
        return;
      }
      await api.updateOrderStatus(orderIdNum, status);
      setOrders(orders.map((order: Order) =>
        order.id === orderId ? { ...order, status } : order
      ));
      toast.success(`Order ${orderId} updated to ${status}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update order status');
    }
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
        imageUrl: item.image, // Send image URL to backend
        category: item.category,
        customizations: item.customizations,
      });
      const mapped: MenuItem = {
        id: String(created.id),
        name: created.name,
        description: created.description || '',
        price: created.price,
        image: created.imageUrl || item.image, // Use imageUrl from backend response
        category: created.category || item.category,
        available: item.available,
        customizations: created.customizations || item.customizations,
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
          imageUrl: updates.image, // Send image URL to backend
          category: updates.category,
          customizations: updates.customizations,
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
              cafeName={currentCafe?.name}
              cafeAddress={currentCafe?.address || undefined}
              cafeDescription={currentCafe?.description || undefined}
            />
          )}
          {currentPage === 'reviews' && (
            <ReviewsPage reviews={reviewsList} cafeName={currentCafe?.name} />
          )}
          {currentPage === 'delivery' && (
            <DeliveryPage drivers={deliveryDrivers} orders={orders} />
          )}
          {currentPage === 'settings' && <SettingsPage cafeId={selectedCafeId} />}
        </DashboardLayout>
      )}
    </>
  );
}
