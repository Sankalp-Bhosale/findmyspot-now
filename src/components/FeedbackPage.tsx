
import React, { useState } from 'react';
import NavBar from '@/components/ui/NavBar';
import NavigationDrawer from '@/components/ui/NavigationDrawer';
import { Button } from '@/components/ui/Button';
import { Star, Send } from 'lucide-react';
import { toast } from 'sonner';

const FeedbackPage: React.FC = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    if (!feedback.trim()) {
      toast.error('Please provide feedback');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Thank you for your feedback!');
      setRating(0);
      setFeedback('');
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Navigation */}
      <div className="fixed top-0 left-0 right-0 bg-white z-50 px-4 py-3 flex items-center border-b border-parking-lightgray">
        <NavigationDrawer />
        <h1 className="text-lg font-medium ml-4">Feedback</h1>
      </div>
      
      <div className="flex-1 pt-16 p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center my-8">
            <h2 className="text-xl font-bold">How was your experience?</h2>
            <p className="text-parking-gray mt-2">
              We'd love to hear your thoughts to improve our service
            </p>
          </div>
          
          {/* Star Rating */}
          <div className="flex justify-center space-x-2 my-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  size={36}
                  fill={(hoverRating || rating) >= star ? '#FFC107' : 'none'}
                  color={(hoverRating || rating) >= star ? '#FFC107' : '#EEEEEE'}
                  strokeWidth={1}
                />
              </button>
            ))}
          </div>
          
          {/* Rating Label */}
          <p className="text-center font-medium mb-6">
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
            {rating === 0 && 'Select a rating'}
          </p>
          
          {/* Feedback Form */}
          <form onSubmit={handleSubmitFeedback} className="space-y-6">
            <div>
              <label htmlFor="feedback" className="block text-sm font-medium text-parking-dark mb-2">
                Your Feedback
              </label>
              <textarea
                id="feedback"
                rows={5}
                className="w-full p-3 border border-parking-lightgray rounded-lg focus:ring-parking-yellow focus:border-parking-yellow resize-none"
                placeholder="Tell us what you liked or what we can improve..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
              ></textarea>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isSubmitting}
              icon={<Send size={18} />}
              iconPosition="right"
            >
              Submit Feedback
            </Button>
          </form>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <NavBar type="bottom" />
    </div>
  );
};

export default FeedbackPage;
