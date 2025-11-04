import { CoffeeShop, MenuItem, CartItem } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Star, Clock, DollarSign, MapPin, Plus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ShopDetailProps {
  shop: CoffeeShop;
  menuItems: MenuItem[];
  onBack: () => void;
  onAddToCart: (item: MenuItem) => void;
}

export function ShopDetail({ shop, menuItems, onBack, onAddToCart }: ShopDetailProps) {
  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-64 overflow-hidden">
        <ImageWithFallback
          src={shop.image}
          alt={shop.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Button
          onClick={onBack}
          variant="ghost"
          className="absolute top-4 left-4 bg-white/90 hover:bg-white"
          size="icon"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-white">{shop.name}</h1>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {shop.rating}
            </Badge>
          </div>
          <p className="text-white/90 mb-2">{shop.description}</p>
          <div className="flex items-center gap-4 text-sm text-white/90">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {shop.deliveryTime}
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              ${shop.deliveryFee} fee
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {shop.distance}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-6xl mx-auto">
        {categories.map(category => (
          <div key={category} className="mb-8">
            <h2 className="mb-4">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems
                .filter(item => item.category === category)
                .map(item => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="flex gap-4 p-4">
                      <div className="flex-1">
                        <h3 className="mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        <p className="mb-3">${item.price.toFixed(2)}</p>
                        <Button
                          onClick={() => onAddToCart(item)}
                          size="sm"
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add to Cart
                        </Button>
                      </div>
                      <div className="w-24 h-24 flex-shrink-0">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
