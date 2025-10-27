import { CoffeeShop } from '../types';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Star, Clock, DollarSign, MapPin } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CoffeeShopCardProps {
  shop: CoffeeShop;
  onClick: () => void;
}

export function CoffeeShopCard({ shop, onClick }: CoffeeShopCardProps) {
  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={shop.image}
          alt={shop.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="flex-1">{shop.name}</h3>
          <Badge variant="secondary" className="ml-2 flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {shop.rating}
          </Badge>
        </div>
        <p className="text-gray-600 mb-3">{shop.description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-600">
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
    </Card>
  );
}
