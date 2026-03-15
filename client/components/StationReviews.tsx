import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Loader2, User, Filter } from 'lucide-react';
import { api, Review } from '@/services/api';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { toast } from './ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface StationReviewsProps {
    stationId: string;
}

const StationReviews: React.FC<StationReviewsProps> = ({ stationId }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [stationId]);

    const fetchReviews = async () => {
        try {
            const data = await api.getStationReviews(stationId);
            setReviews(data);
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setIsSubmitting(true);
        try {
            await api.createStationReview(stationId, comment, rating);
            toast({
                title: "Review Submitted",
                description: "Thank you for your feedback.",
            });
            setComment('');
            setRating(5);
            fetchReviews();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
        : 0;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-24">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-500 max-w-5xl mx-auto">
            {/* Overview & Input */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-lg text-center shadow-sm">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Average Rating</p>
                        <div className="text-6xl font-semibold text-white mb-2">{averageRating}</div>
                        <div className="flex justify-center gap-1.5 mb-2 text-orange-500">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-5 h-5 ${star <= Number(averageRating) ? 'fill-current' : 'text-slate-800'}`}
                                />
                            ))}
                        </div>
                        <p className="text-sm font-medium text-slate-400">{reviews.length} Verified Reviews</p>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-lg shadow-sm">
                        <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-tight">Write a Review</h3>
                        <form onSubmit={handleSubmitReview} className="space-y-6">
                            <div className="flex items-center gap-4">
                                <p className="text-sm text-slate-400 font-medium">Experience Rating:</p>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`w-6 h-6 ${star <= rating ? 'text-orange-500 fill-orange-500' : 'text-slate-800'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Textarea
                                placeholder="Describe your experience with this partner..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-700 min-h-[120px] rounded-lg focus:border-orange-500"
                            />
                            <Button
                                type="submit"
                                disabled={isSubmitting || !comment.trim()}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 h-12 rounded-lg"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "LOG FEEDBACK"}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <h3 className="text-xl font-semibold text-white uppercase tracking-tight">Customer Reviews</h3>
                    <Button variant="ghost" size="sm" className="text-slate-500 text-[10px] font-bold uppercase gap-2">
                        <Filter className="w-3 h-3" /> Filter: Most Recent
                    </Button>
                </div>

                {reviews.length === 0 ? (
                    <div className="py-16 text-center bg-slate-900 border border-dashed border-slate-800 rounded-lg">
                        <p className="text-slate-500 font-medium">No reviews for this station yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {reviews.map((review) => (
                            <div key={review._id} className="p-8 bg-slate-900 border border-slate-800 rounded-lg transition-all hover:border-slate-700 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-1 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="w-12 h-12 border border-slate-800">
                                            <AvatarImage src={review.userId?.avatar} />
                                            <AvatarFallback className="bg-slate-950 text-slate-600 font-bold">
                                                {review.userId?.name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-bold text-white text-lg">
                                                {review.userId?.name || 'User'}
                                            </p>
                                            <p className="text-xs text-slate-500 font-mono">
                                                DATE: {new Date(review.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 text-orange-500">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-4 h-4 ${star <= review.rating ? 'fill-current' : 'text-slate-800'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-slate-300 leading-relaxed max-w-3xl ml-16">
                                    {review.comment}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StationReviews;
