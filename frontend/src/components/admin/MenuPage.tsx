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
  menuItems: MenuItem[];
  onAddItem: (item: Omit<MenuItem, 'id'>) => void;
  onUpdateItem: (id: string, item: Partial<MenuItem>) => void;
  onDeleteItem: (id: string) => void;
  cafeName?: string;
  cafeAddress?: string;
  cafeDescription?: string;
}

export function MenuPage({ menuItems, onAddItem, onUpdateItem, onDeleteItem, cafeName = 'Cafe', cafeAddress, cafeDescription }: MenuPageProps) {
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
    customizations: {
      size: { options: ['Small', 'Medium', 'Large'], default: 'Medium', enabled: false },
      milk: { options: ['Whole', 'Skim', 'Oat', 'Almond', 'Soy'], default: 'Whole', enabled: false },
      sugar: { options: ['None', '1', '2', '3', 'Extra'], default: 'None', enabled: false },
      ice: { options: ['None', 'Light', 'Regular', 'Extra'], default: 'Regular', enabled: false },
    },
  });

  const categories = Array.from(new Set(menuItems.map(item => item.category)));
  const filteredItems = categoryFilter === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === categoryFilter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Build customizations object only with enabled options
    const customizations: any = {};
    if (formData.customizations.size.enabled) {
      customizations.size = {
        options: formData.customizations.size.options,
        default: formData.customizations.size.default,
      };
    }
    if (formData.customizations.milk.enabled) {
      customizations.milk = {
        options: formData.customizations.milk.options,
        default: formData.customizations.milk.default,
      };
    }
    if (formData.customizations.sugar.enabled) {
      customizations.sugar = {
        options: formData.customizations.sugar.options,
        default: formData.customizations.sugar.default,
      };
    }
    if (formData.customizations.ice.enabled) {
      customizations.ice = {
        options: formData.customizations.ice.options,
        default: formData.customizations.ice.default,
      };
    }

    const itemData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      image: formData.image || 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc3ByZXNzbyUyMGNvZmZlZXxlbnwxfHx8fDE3NjA3OTg4MDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      available: formData.available,
      customizations: Object.keys(customizations).length > 0 ? customizations : undefined,
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
      customizations: {
        size: { options: ['Small', 'Medium', 'Large'], default: 'Medium', enabled: false },
        milk: { options: ['Whole', 'Skim', 'Oat', 'Almond', 'Soy'], default: 'Whole', enabled: false },
        sugar: { options: ['None', '1', '2', '3', 'Extra'], default: 'None', enabled: false },
        ice: { options: ['None', 'Light', 'Regular', 'Extra'], default: 'Regular', enabled: false },
      },
    });
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    const customizations = item.customizations || {};
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image,
      available: item.available ?? true,
      customizations: {
        size: {
          options: customizations.size?.options || ['Small', 'Medium', 'Large'],
          default: customizations.size?.default || 'Medium',
          enabled: !!customizations.size,
        },
        milk: {
          options: customizations.milk?.options || ['Whole', 'Skim', 'Oat', 'Almond', 'Soy'],
          default: customizations.milk?.default || 'Whole',
          enabled: !!customizations.milk,
        },
        sugar: {
          options: customizations.sugar?.options || ['None', '1', '2', '3', 'Extra'],
          default: customizations.sugar?.default || 'None',
          enabled: !!customizations.sugar,
        },
        ice: {
          options: customizations.ice?.options || ['None', 'Light', 'Regular', 'Extra'],
          default: customizations.ice?.default || 'Regular',
          enabled: !!customizations.ice,
        },
      },
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
          <h1 className="mb-2">{cafeName} Menu</h1>
          {cafeAddress && <p className="text-gray-600">{cafeAddress}</p>}
          {cafeDescription && <p className="text-gray-600">{cafeDescription}</p>}
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Add New Menu Item</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2 -mr-2">
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

              {/* Customizations Section */}
              <div className="space-y-4 border-t pt-4">
                <Label className="text-base font-semibold">Customization Options</Label>
                <p className="text-sm text-gray-600">Enable customization options that customers can choose when ordering</p>
                
                {/* Size */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.customizations.size.enabled}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        customizations: {
                          ...formData.customizations,
                          size: { ...formData.customizations.size, enabled: checked },
                        },
                      })}
                    />
                    <Label>Size Options</Label>
                  </div>
                  {formData.customizations.size.enabled && (
                    <div className="ml-8 space-y-2">
                      <div className="flex gap-2 flex-wrap">
                        {formData.customizations.size.options.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <Input
                              value={opt}
                              onChange={(e) => {
                                const newOptions = [...formData.customizations.size.options];
                                newOptions[idx] = e.target.value;
                                setFormData({
                                  ...formData,
                                  customizations: {
                                    ...formData.customizations,
                                    size: { ...formData.customizations.size, options: newOptions },
                                  },
                                });
                              }}
                              className="w-24"
                            />
                          </div>
                        ))}
                      </div>
                      <Select
                        value={formData.customizations.size.default}
                        onValueChange={(value) => setFormData({
                          ...formData,
                          customizations: {
                            ...formData.customizations,
                            size: { ...formData.customizations.size, default: value },
                          },
                        })}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Default size" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.customizations.size.options.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Milk */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.customizations.milk.enabled}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        customizations: {
                          ...formData.customizations,
                          milk: { ...formData.customizations.milk, enabled: checked },
                        },
                      })}
                    />
                    <Label>Milk Options</Label>
                  </div>
                  {formData.customizations.milk.enabled && (
                    <div className="ml-8 space-y-2">
                      <div className="flex gap-2 flex-wrap">
                        {formData.customizations.milk.options.map((opt, idx) => (
                          <Input
                            key={idx}
                            value={opt}
                            onChange={(e) => {
                              const newOptions = [...formData.customizations.milk.options];
                              newOptions[idx] = e.target.value;
                              setFormData({
                                ...formData,
                                customizations: {
                                  ...formData.customizations,
                                  milk: { ...formData.customizations.milk, options: newOptions },
                                },
                              });
                            }}
                            className="w-24"
                          />
                        ))}
                      </div>
                      <Select
                        value={formData.customizations.milk.default}
                        onValueChange={(value) => setFormData({
                          ...formData,
                          customizations: {
                            ...formData.customizations,
                            milk: { ...formData.customizations.milk, default: value },
                          },
                        })}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Default milk" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.customizations.milk.options.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Sugar */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.customizations.sugar.enabled}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        customizations: {
                          ...formData.customizations,
                          sugar: { ...formData.customizations.sugar, enabled: checked },
                        },
                      })}
                    />
                    <Label>Sugar Options</Label>
                  </div>
                  {formData.customizations.sugar.enabled && (
                    <div className="ml-8 space-y-2">
                      <div className="flex gap-2 flex-wrap">
                        {formData.customizations.sugar.options.map((opt, idx) => (
                          <Input
                            key={idx}
                            value={opt}
                            onChange={(e) => {
                              const newOptions = [...formData.customizations.sugar.options];
                              newOptions[idx] = e.target.value;
                              setFormData({
                                ...formData,
                                customizations: {
                                  ...formData.customizations,
                                  sugar: { ...formData.customizations.sugar, options: newOptions },
                                },
                              });
                            }}
                            className="w-24"
                          />
                        ))}
                      </div>
                      <Select
                        value={formData.customizations.sugar.default}
                        onValueChange={(value) => setFormData({
                          ...formData,
                          customizations: {
                            ...formData.customizations,
                            sugar: { ...formData.customizations.sugar, default: value },
                          },
                        })}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Default sugar" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.customizations.sugar.options.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Ice */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.customizations.ice.enabled}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        customizations: {
                          ...formData.customizations,
                          ice: { ...formData.customizations.ice, enabled: checked },
                        },
                      })}
                    />
                    <Label>Ice Options</Label>
                  </div>
                  {formData.customizations.ice.enabled && (
                    <div className="ml-8 space-y-2">
                      <div className="flex gap-2 flex-wrap">
                        {formData.customizations.ice.options.map((opt, idx) => (
                          <Input
                            key={idx}
                            value={opt}
                            onChange={(e) => {
                              const newOptions = [...formData.customizations.ice.options];
                              newOptions[idx] = e.target.value;
                              setFormData({
                                ...formData,
                                customizations: {
                                  ...formData.customizations,
                                  ice: { ...formData.customizations.ice, options: newOptions },
                                },
                              });
                            }}
                            className="w-24"
                          />
                        ))}
                      </div>
                      <Select
                        value={formData.customizations.ice.default}
                        onValueChange={(value) => setFormData({
                          ...formData,
                          customizations: {
                            ...formData.customizations,
                            ice: { ...formData.customizations.ice, default: value },
                          },
                        })}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Default ice" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.customizations.ice.options.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked: boolean) => setFormData({ ...formData, available: checked })}
                />
                <Label htmlFor="available">Available for order</Label>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1">Add Item</Button>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
              </form>
            </div>
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
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                      <DialogTitle>Edit Menu Item</DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto flex-1 pr-2 -mr-2">
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

                      {/* Customizations Section - Same as Add form */}
                      <div className="space-y-4 border-t pt-4">
                        <Label className="text-base font-semibold">Customization Options</Label>
                        <p className="text-sm text-gray-600">Enable customization options that customers can choose when ordering</p>
                        
                        {/* Size */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={formData.customizations.size.enabled}
                              onCheckedChange={(checked) => setFormData({
                                ...formData,
                                customizations: {
                                  ...formData.customizations,
                                  size: { ...formData.customizations.size, enabled: checked },
                                },
                              })}
                            />
                            <Label>Size Options</Label>
                          </div>
                          {formData.customizations.size.enabled && (
                            <div className="ml-8 space-y-2">
                              <div className="flex gap-2 flex-wrap">
                                {formData.customizations.size.options.map((opt, idx) => (
                                  <Input
                                    key={idx}
                                    value={opt}
                                    onChange={(e) => {
                                      const newOptions = [...formData.customizations.size.options];
                                      newOptions[idx] = e.target.value;
                                      setFormData({
                                        ...formData,
                                        customizations: {
                                          ...formData.customizations,
                                          size: { ...formData.customizations.size, options: newOptions },
                                        },
                                      });
                                    }}
                                    className="w-24"
                                  />
                                ))}
                              </div>
                              <Select
                                value={formData.customizations.size.default}
                                onValueChange={(value) => setFormData({
                                  ...formData,
                                  customizations: {
                                    ...formData.customizations,
                                    size: { ...formData.customizations.size, default: value },
                                  },
                                })}
                              >
                                <SelectTrigger className="w-48">
                                  <SelectValue placeholder="Default size" />
                                </SelectTrigger>
                                <SelectContent>
                                  {formData.customizations.size.options.map((opt) => (
                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>

                        {/* Milk */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={formData.customizations.milk.enabled}
                              onCheckedChange={(checked) => setFormData({
                                ...formData,
                                customizations: {
                                  ...formData.customizations,
                                  milk: { ...formData.customizations.milk, enabled: checked },
                                },
                              })}
                            />
                            <Label>Milk Options</Label>
                          </div>
                          {formData.customizations.milk.enabled && (
                            <div className="ml-8 space-y-2">
                              <div className="flex gap-2 flex-wrap">
                                {formData.customizations.milk.options.map((opt, idx) => (
                                  <Input
                                    key={idx}
                                    value={opt}
                                    onChange={(e) => {
                                      const newOptions = [...formData.customizations.milk.options];
                                      newOptions[idx] = e.target.value;
                                      setFormData({
                                        ...formData,
                                        customizations: {
                                          ...formData.customizations,
                                          milk: { ...formData.customizations.milk, options: newOptions },
                                        },
                                      });
                                    }}
                                    className="w-24"
                                  />
                                ))}
                              </div>
                              <Select
                                value={formData.customizations.milk.default}
                                onValueChange={(value) => setFormData({
                                  ...formData,
                                  customizations: {
                                    ...formData.customizations,
                                    milk: { ...formData.customizations.milk, default: value },
                                  },
                                })}
                              >
                                <SelectTrigger className="w-48">
                                  <SelectValue placeholder="Default milk" />
                                </SelectTrigger>
                                <SelectContent>
                                  {formData.customizations.milk.options.map((opt) => (
                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>

                        {/* Sugar */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={formData.customizations.sugar.enabled}
                              onCheckedChange={(checked) => setFormData({
                                ...formData,
                                customizations: {
                                  ...formData.customizations,
                                  sugar: { ...formData.customizations.sugar, enabled: checked },
                                },
                              })}
                            />
                            <Label>Sugar Options</Label>
                          </div>
                          {formData.customizations.sugar.enabled && (
                            <div className="ml-8 space-y-2">
                              <div className="flex gap-2 flex-wrap">
                                {formData.customizations.sugar.options.map((opt, idx) => (
                                  <Input
                                    key={idx}
                                    value={opt}
                                    onChange={(e) => {
                                      const newOptions = [...formData.customizations.sugar.options];
                                      newOptions[idx] = e.target.value;
                                      setFormData({
                                        ...formData,
                                        customizations: {
                                          ...formData.customizations,
                                          sugar: { ...formData.customizations.sugar, options: newOptions },
                                        },
                                      });
                                    }}
                                    className="w-24"
                                  />
                                ))}
                              </div>
                              <Select
                                value={formData.customizations.sugar.default}
                                onValueChange={(value) => setFormData({
                                  ...formData,
                                  customizations: {
                                    ...formData.customizations,
                                    sugar: { ...formData.customizations.sugar, default: value },
                                  },
                                })}
                              >
                                <SelectTrigger className="w-48">
                                  <SelectValue placeholder="Default sugar" />
                                </SelectTrigger>
                                <SelectContent>
                                  {formData.customizations.sugar.options.map((opt) => (
                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>

                        {/* Ice */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={formData.customizations.ice.enabled}
                              onCheckedChange={(checked) => setFormData({
                                ...formData,
                                customizations: {
                                  ...formData.customizations,
                                  ice: { ...formData.customizations.ice, enabled: checked },
                                },
                              })}
                            />
                            <Label>Ice Options</Label>
                          </div>
                          {formData.customizations.ice.enabled && (
                            <div className="ml-8 space-y-2">
                              <div className="flex gap-2 flex-wrap">
                                {formData.customizations.ice.options.map((opt, idx) => (
                                  <Input
                                    key={idx}
                                    value={opt}
                                    onChange={(e) => {
                                      const newOptions = [...formData.customizations.ice.options];
                                      newOptions[idx] = e.target.value;
                                      setFormData({
                                        ...formData,
                                        customizations: {
                                          ...formData.customizations,
                                          ice: { ...formData.customizations.ice, options: newOptions },
                                        },
                                      });
                                    }}
                                    className="w-24"
                                  />
                                ))}
                              </div>
                              <Select
                                value={formData.customizations.ice.default}
                                onValueChange={(value) => setFormData({
                                  ...formData,
                                  customizations: {
                                    ...formData.customizations,
                                    ice: { ...formData.customizations.ice, default: value },
                                  },
                                })}
                              >
                                <SelectTrigger className="w-48">
                                  <SelectValue placeholder="Default ice" />
                                </SelectTrigger>
                                <SelectContent>
                                  {formData.customizations.ice.options.map((opt) => (
                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          id="edit-available"
                          checked={formData.available}
                          onCheckedChange={(checked: boolean) => setFormData({ ...formData, available: checked })}
                        />
                        <Label htmlFor="edit-available">Available for order</Label>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button type="submit" className="flex-1">Save Changes</Button>
                        <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                          Cancel
                        </Button>
                      </div>
                      </form>
                    </div>
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
