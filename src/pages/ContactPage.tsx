import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle } from 'lucide-react';

export const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-5xl mx-auto py-16 px-4 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Get in <span className="text-[#1A73E8]">Touch</span>
        </h1>
        <p className="max-w-2xl mx-auto text-gray-300">
          Have questions or want to partner with E-Sports Pakistan? Send us a message and our team will get back to you shortly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-transparent border border-white/10 p-6 rounded-2xl flex items-start gap-4">
            <div className="p-3 bg-[#E8F0FE] text-[#1A73E8] rounded-xl shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Email Us</h3>
              <p className="text-sm text-gray-400 mt-1">Our inbox is open</p>
              <a href="mailto:hello@e-sports.pk" className="text-sm text-[#1A73E8] font-medium block mt-2">hello@e-sports.pk</a>
            </div>
          </div>

          <div className="bg-transparent border border-white/10 p-6 rounded-2xl flex items-start gap-4">
            <div className="p-3 bg-[#E6F4EA] text-[#137333] rounded-xl shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Call Us</h3>
              <p className="text-sm text-gray-400 mt-1">Mon - Fri, 9am - 6pm</p>
              <a href="tel:+923001234567" className="text-sm text-[#137333] font-medium block mt-2">+92 (300) 123-4567</a>
            </div>
          </div>

          <div className="bg-transparent border border-white/10 p-6 rounded-2xl flex items-start gap-4">
            <div className="p-3 bg-[#FEF7E0] text-[#B06000] rounded-xl shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Headquarters</h3>
              <p className="text-sm text-gray-400 mt-1">Lahore, Pakistan</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          {submitted ? (
            <div className="bg-[#E6F4EA] border border-[#A3E2B5] p-8 rounded-2xl text-center space-y-4">
              <div className="w-16 h-16 bg-[#137333] text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-[#137333]">Message Received!</h2>
              <p className="text-gray-200 max-w-md mx-auto">
                Thank you for reaching out to E-Sports Pakistan. One of our support staff will reply to you within 24 hours.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2 bg-[#137333] hover:bg-[#0F5A27] text-white rounded-full text-sm font-medium transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-transparent border border-white/10 p-8 rounded-2xl space-y-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-200">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-transparent border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-200">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-transparent border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-gray-200">Subject</label>
                <input
                  id="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 bg-transparent border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                  placeholder="How can we help you?"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-gray-200">Message</label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 bg-transparent border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                  placeholder="Type your message here..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1A73E8] hover:bg-[#1967D2] text-white font-medium py-3 rounded-full transition-colors shadow-sm"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
