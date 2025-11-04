import { Review } from '../../types';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Star, TrendingUp, MessageSquare } from 'lucide-react';
import { Progress } from '../ui/progress';

interface ReviewsPageProps {
  reviews: Review[];
}

export function ReviewsPage({ reviews }: ReviewsPageProps) {
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: (reviews.filter(r => r.rating === rating).length / reviews.length) * 100,
  }));

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="mb-2">Oh Matcha Reviews</h1>
        <p className="text-gray-600">Enjoy authentic Japanese flavors, health benefits of matcha, and dairy-free options at Shop 11/501 George St, Sydney NSW 2000.</p>
      </div>

      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
              <h1>{averageRating.toFixed(1)}</h1>
            </div>
            <p className="text-gray-600">Average Rating</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2>{reviews.length}</h2>
              <p className="text-gray-600">Total Reviews</p>
              <Badge variant="secondary" className="mt-2 text-green-600 bg-green-50">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% this month
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4">Rating Distribution</h3>
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm w-8">{rating} ★</span>
                <Progress value={percentage} className="flex-1" />
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="p-6">
            <div className="flex gap-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback>{getInitials(review.customerName)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="mb-1">{review.customerName}</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline">Order {review.orderId}</Badge>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            </div>
          </Card>
        ))}

        {reviews.length === 0 && (
          <Card className="p-12 text-center">
            <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="mb-2">No reviews yet</h3>
            <p className="text-gray-600">Reviews will appear here once customers leave feedback</p>
          </Card>
        )}
      </div>
    </div>
  );
}
