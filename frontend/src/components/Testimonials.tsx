"use client";
import { useEffect, useState } from 'react';
import { getTestimonials } from '@/lib/api-public';

export default function Testimonials() {
  const defaultReviews = [
    {
      name: "Ayush Jaiswal",
      location: "Lucknow, Uttar Pradesh",
      text: "I had to travel from Delhi to Lucknow last minute, but my forex card was scheduled for Delhi delivery. The customer service team seamlessly rerouted it to Lucknow.",
      avatar: "👨🏻",
      initial: false
    },
    {
      name: "Ashish Rana",
      location: "Noida, Uttar Pradesh",
      text: "Forexmate is highly recommended for anyone needing quick and reliable currency exchange at their doorstep, especially in urgent situations.",
      avatar: "A",
      initial: true
    },
    {
      name: "Shani Saroj",
      location: "Gurugram, Haryana",
      text: "Forexmate's exchange rates are among the best in the market, with complete transparency and no hidden charges.",
      avatar: "👨🏽",
      initial: false
    }
  ];

  const [reviews, setReviews] = useState(defaultReviews);

  useEffect(() => {
    getTestimonials()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setReviews(data.map((t: any) => ({
            name: t.customerName,
            location: t.location || 'India',
            text: t.reviewText,
            avatar: t.avatarUrl || '👨🏻',
            initial: !t.avatarUrl
          })));
        }
      })
      .catch(err => console.error("Failed to load testimonials", err));
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto mb-20 font-sans overflow-hidden">
      <h2 className="text-2xl font-extrabold text-gray-900 mb-8">Forexmate Customer Reviews & Testimonials</h2>

      <div className="flex space-x-6 overflow-x-auto pb-6 scrollbar-hide">
        {reviews.map((review, i) => (
          <div key={i} className="min-w-[320px] md:min-w-[380px] bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              {review.initial ? (
                <div className="w-12 h-12 bg-gray-400 text-white rounded-full flex items-center justify-center text-xl font-bold mr-4">
                  {review.avatar}
                </div>
              ) : (
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl mr-4 relative">
                  {review.avatar}
                  <div className="absolute -bottom-1 -right-1 bg-gray-400 rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  </div>
                </div>
              )}
              <div>
                <h4 className="font-bold text-gray-900">{review.name}</h4>
                <p className="text-xs text-gray-500 mb-1">{review.location}</p>
                <div className="flex text-yellow-400 text-sm">
                  ★★★★★
                </div>
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {review.text}
            </p>
          </div>
        ))}
      </div>

      <div className="text-center mt-4 text-sm font-semibold text-gray-600">
        Forexmate is Rated <span className="font-bold text-gray-900">4.7 out of 5 Stars.</span> Based on <span className="text-blue-600 cursor-pointer hover:underline">37000+ Reviews</span>
      </div>
    </div>
  );
}
