import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Owner, Beauty Haven',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80',
    content: 'Since implementing Loopify\'s digital stamp cards, our customer retention has increased by 40%. The system is incredibly easy to use and our customers love it!',
    rating: 5
  },
  {
    name: 'David Wong',
    role: 'CEO, Urban Cafe Group',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80',
    content: 'The points system has transformed how we reward our loyal customers. We\'ve seen a 25% increase in repeat visits since launching our rewards program with Loopify.',
    rating: 5
  },
  {
    name: 'Lisa Rahman',
    role: 'Marketing Director, Fashion Boutique',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80',
    content: 'Our lucky draw campaigns are a huge hit! The automated system saves us hours of work, and customers are excited about the chance to win. It\'s a win-win.',
    rating: 5
  }
];

export function Testimonials() {
  return (
    <div className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block bg-blue-50 px-4 py-2 rounded-full mb-4">
            <span className="text-blue-600 font-medium">Success Stories</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Trusted by Leading Businesses
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how businesses are transforming their customer loyalty programs with Loopify
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className="text-gray-600 italic">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}