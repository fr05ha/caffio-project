import { useState } from 'react';
import { MenuItem } from '../../types';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Pencil, Trash2, Coffee } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';

interface MenuPageProps {
  onAddItem: (item: Omit<MenuItem, 'id'>) => void;
  onUpdateItem: (id: string, item: Partial<MenuItem>) => void;
  onDeleteItem: (id: string) => void;
}

export function MenuPage({ onAddItem, onUpdateItem, onDeleteItem }: MenuPageProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Coffee',
    image: '',
    available: true,
  });

  // Oh Matcha actual menu items
  const ohMatchaMenu: MenuItem[] = [
    { id: 'matcha-soft-serve', name: 'Matcha Soft Serve', description: 'Signature matcha soft serve.', price: 5.30, image: 'https://static.wixstatic.com/media/f07ad2_eb18153a79094168be2439883f82a3fc~mv2.png/v1/fill/w_359,h_359,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/f07ad2_eb18153a79094168be2439883f82a3fc~mv2.png', category: 'Dessert', available: true },
    { id: 'hokkaido-milk', name: 'Hokkaido Milk Soft Serve', description: 'Rich and creamy Hokkaido milk soft serve.', price: 5.30, image: 'https://static.wixstatic.com/media/f07ad2_753f8aeeb51d46c8a006ef066a80d81e~mv2.png/v1/fill/w_359,h_359,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/f07ad2_753f8aeeb51d46c8a006ef066a80d81e~mv2.png', category: 'Dessert', available: true },
    { id: 'genmai-tea', name: 'Genmai Tea Soft Serve', description: 'Roasted rice and green tea flavor.', price: 5.50, image: 'https://static.wixstatic.com/media/f07ad2_c94b1f00af9f4cd392f04552933e0af8~mv2.png/v1/fill/w_359,h_359,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/f07ad2_c94b1f00af9f4cd392f04552933e0af8~mv2.png', category: 'Dessert', available: true },
    { id: 'black-sesame', name: 'Black Sesame Soft Serve', description: 'Rich in nutrients, beloved in Japan.', price: 5.50, image: 'https://static.wixstatic.com/media/f07ad2_bc995b28b95843d3bf47aabc879ac258~mv2.png/v1/fill/w_49,h_84,al_c,q_85,usm_0.66_1.00_0.01,blur_2,enc_auto/f07ad2_bc995b28b95843d3bf47aabc879ac258~mv2.png', category: 'Dessert', available: true },
    { id: 'mix-flavour', name: 'Mix Flavour Soft Serve', description: 'Current mix soft serve, ask staff.', price: 6.30, image: 'https://static.wixstatic.com/media/f07ad2_12418228d9f54c338cafc72cce66b1e4~mv2.png/v1/fill/w_49,h_84,al_c,q_85,usm_0.66_1.00_0.01,blur_2,enc_auto/f07ad2_12418228d9f54c338cafc72cce66b1e4~mv2.png', category: 'Dessert', available: true },
    { id: 'deluxe-warabi-mochi', name: 'Deluxe Soft Serve w/Warabi Mochi', description: 'Soft serve with red beans, matcha and kinako warabi mochi.', price: 10.20, image: 'https://static.wixstatic.com/media/f07ad2_03165e85dced4e4795573ef176b5d9da~mv2.png/v1/fill/w_79,h_120,al_c,q_85,usm_0.66_1.00_0.01,blur_2,enc_auto/f07ad2_03165e85dced4e4795573ef176b5d9da~mv2.png', category: 'Dessert', available: true },
    { id: 'mochi-float', name: 'Mochi Float with Pearls', description: 'Drink and soft serve of your choice with pearls.', price: 10.50, image: 'https://static.wixstatic.com/media/f07ad2_54191ad5e8c84f1793d163f407865569~mv2.png/v1/fill/w_49,h_84,al_c,q_85,usm_0.66_1.00_0.01,blur_2,enc_auto/f07ad2_54191ad5e8c84f1793d163f407865569~mv2.png', category: 'Dessert', available: true },
    { id: 'matcha-parfait', name: 'Matcha Parfait', description: 'Ultimate parfait for matcha lovers.', price: 17.80, image: 'https://static.wixstatic.com/media/f07ad2_1ebba13768d848ffa54d0040cd507460~mv2.png/v1/fill/w_49,h_84,al_c,q_85,usm_0.66_1.00_0.01,blur_2,enc_auto/f07ad2_1ebba13768d848ffa54d0040cd507460~mv2.png', category: 'Dessert', available: true },
    { id: 'strawberry-short-cake', name: 'Strawberry Short Cake', description: 'With a soft serve of your choice.', price: 9.80, image: 'https://static.wixstatic.com/media/f07ad2_d308e24ec1084bdb8a6b6212ef072f91~mv2.png/v1/fill/w_49,h_31,al_c,q_85,usm_0.66_1.00_0.01,blur_2,enc_auto/f07ad2_d308e24ec1084bdb8a6b6212ef072f91~mv2.png', category: 'Dessert', available: true },
    { id: 'warabi-mochi-set', name: 'Warabi Mochi Set', description: 'Warabi matcha, hojicha, kinako mochi with soft serve.', price: 9.80, image: 'https://static.wixstatic.com/media/f07ad2_75601ee51a0040af9410d542cc540c73~mv2.png/v1/fill/w_49,h_84,al_c,q_85,usm_0.66_1.00_0.01,blur_2,enc_auto/f07ad2_75601ee51a0040af9410d542cc540c73~mv2.png', category: 'Dessert', available: true },
    { id: 'ice-matcha-latte', name: 'Ice Matcha Latte', description: 'Most popular cold beverage. Milk alternatives available.', price: 6.80, image: 'https://static.wixstatic.com/media/f07ad2_a1a477745c7d4f888fdbb46f964c53ed~mv2.png/v1/fill/w_49,h_84,al_c,q_85,usm_0.66_1.00_0.01,blur_2,enc_auto/f07ad2_a1a477745c7d4f888fdbb46f964c53ed~mv2.png', category: 'Drink', available: true },
    { id: 'hot-matcha-latte', name: 'Hot Matcha Latte', description: 'Best of our hot beverages. Milk alternative available.', price: 5.80, image: 'https://static.wixstatic.com/media/f07ad2_8ac6ab9a15a2412db0c5256ae7b6c5bb~mv2.png/v1/fill/w_49,h_84,al_c,q_85,usm_0.66_1.00_0.01,blur_2,enc_auto/f07ad2_8ac6ab9a15a2412db0c5256ae7b6c5bb~mv2.png', category: 'Drink', available: true },
    { id: 'japanese-chips', name: 'Japanese Chips', description: 'Choose your seasoning: Soy Butter & Seaweed, Matcha Garlic, Chili & Garlic, Paprika, Salt.', price: 5.80, image: 'https://static.wixstatic.com/media/f07ad2_80d0dc9f3b7d4016be4909657d6218c2~mv2.png/v1/fill/w_49,h_38,al_c,q_85,usm_0.66_1.00_0.01,blur_2,enc_auto/f07ad2_80d0dc9f3b7d4016be4909657d6218c2~mv2.png', category: 'Food', available: true },
    { id: 'takoyaki', name: 'Takoyaki', description: 'Japanese pancake balls with octopus inside.', price: 7.80, image: 'https://static.wixstatic.com/media/f07ad2_5ddde8e5b3344390a1f384d20b6642e8~mv2.png/v1/fill/w_49,h_23,al_c,q_85,usm_0.66_1.00_0.01,blur_2,enc_auto/f07ad2_5ddde8e5b3344390a1f384d20b6642e8~mv2.png', category: 'Food', available: true },
    { id: 'karaage-chicken', name: 'Karaage Fried Chicken', description: 'Japanese style deep fried boneless chicken thigh. Original or spicy.', price: 10.80, image: 'https://static.wixstatic.com/media/f07ad2_acf3ca3fc99a40a896aa6bd925c3ba6c~mv2.png/v1/fill/w_49,h_28,al_c,q_85,usm_0.66_1.00_0.01,blur_2,enc_auto/f07ad2_acf3ca3fc99a40a896aa6bd925c3ba6c~mv2.png', category: 'Food', available: true },
  ];

  const categories = Array.from(new Set(ohMatchaMenu.map(item => item.category)));
  const filteredItems = categoryFilter === 'all'
    ? ohMatchaMenu
    : ohMatchaMenu.filter(item => item.category === categoryFilter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const itemData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      image: formData.image || 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc3ByZXNzbyUyMGNvZmZlZXxlbnwxfHx8fDE3NjA3OTg4MDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      available: formData.available,
    };

    if (editingItem) {
      onUpdateItem(editingItem.id, itemData);
      toast.success('Menu item updated successfully');
      setEditingItem(null);
    } else {
      onAddItem(itemData);
      toast.success('Menu item added successfully');
      setIsAddDialogOpen(false);
    }

    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Coffee',
      image: '',
      available: true,
    });
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image,
      available: item.available ?? true,
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      onDeleteItem(id);
      toast.success('Menu item deleted');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2">Oh Matcha Menu</h1>
          <p className="text-gray-600">Shop 11/501 George St, Sydney NSW 2000</p>
          <p className="text-gray-600">Authentic Japanese flavors, dairy-free options, and health benefits of matcha.</p>
          <p className="text-gray-600">Hours: Mon–Wed/Sun 9:00AM–9:30PM, Thu–Sat 9:00AM–10PM</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Menu Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Caramel Latte"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="5.50"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value: string) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Coffee">Coffee</SelectItem>
                    <SelectItem value="Iced">Iced</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Dessert">Dessert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your menu item..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked: boolean) => setFormData({ ...formData, available: checked })}
                />
                <Label htmlFor="available">Available for order</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Add Item</Button>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <Card className="p-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="relative h-48">
              <ImageWithFallback
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              {item.available === false && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="secondary">Unavailable</Badge>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="mb-1">{item.name}</h3>
                  <Badge variant="outline" className="mb-2">{item.category}</Badge>
                </div>
                <p className="ml-2">${item.price.toFixed(2)}</p>
              </div>
              <p className="text-sm text-gray-600 mb-4">{item.description}</p>
              <div className="flex gap-2">
                <Dialog open={editingItem?.id === item.id} onOpenChange={(open: boolean) => !open && setEditingItem(null)}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(item)}>
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Menu Item</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-name">Name *</Label>
                          <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-price">Price ($) *</Label>
                          <Input
                            id="edit-price"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="edit-category">Category</Label>
                        <Select value={formData.category} onValueChange={(value: string) => setFormData({ ...formData, category: value })}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Coffee">Coffee</SelectItem>
                            <SelectItem value="Iced">Iced</SelectItem>
                            <SelectItem value="Food">Food</SelectItem>
                            <SelectItem value="Dessert">Dessert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                          id="edit-description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="mt-1"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="edit-image">Image URL</Label>
                        <Input
                          id="edit-image"
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          className="mt-1"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          id="edit-available"
                          checked={formData.available}
                          onCheckedChange={(checked: boolean) => setFormData({ ...formData, available: checked })}
                        />
                        <Label htmlFor="edit-available">Available for order</Label>
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">Save Changes</Button>
                        <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(item.id, item.name)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card className="p-12 text-center">
          <Coffee className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="mb-2">No menu items found</h3>
          <p className="text-gray-600 mb-4">Start by adding your first menu item</p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Menu Item
          </Button>
        </Card>
      )}
    </div>
  );
}
