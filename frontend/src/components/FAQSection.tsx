"use client";
import React, { useState } from 'react';

export default function FAQSection() {
  const [activeTab, setActiveTab] = useState('card');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "What is a Forex Card?",
      a: "A Forex Card is a prepaid travel card that you can load with a foreign currency of your choice. It allows you to pay for your expenses abroad in the local currency without worrying about fluctuating exchange rates."
    },
    {
      q: "What are the benefits of using a Forex Card over a Credit/Debit Card?",
      a: "Forex cards offer zero markup fees on transactions abroad, protect you against currency fluctuations by locking in the rate when you load it, and generally have much lower ATM withdrawal fees compared to standard credit or debit cards."
    },
    {
      q: "How can I reload my Forexmate card while traveling?",
      a: "You can instantly reload your Forexmate card online through our website or mobile app using net banking, UPI, or a debit card. The funds are typically available on your card within minutes."
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto mb-20 font-sans">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-4 md:mb-0">Frequently Asked Questions</h2>
        
        <div className="flex space-x-4">
          <button 
            onClick={() => setActiveTab('card')}
            className={`px-6 py-2 rounded-lg text-sm font-bold border transition-colors ${activeTab === 'card' ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-gray-600 hover:bg-gray-100'}`}
          >
            Forex Card
          </button>
          <button 
            onClick={() => setActiveTab('notes')}
            className={`px-6 py-2 rounded-lg text-sm font-bold border transition-colors ${activeTab === 'notes' ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-gray-600 hover:bg-gray-100'}`}
          >
            Foreign Currency Notes
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-2 shadow-sm">
        {faqs.map((faq, i) => (
          <div key={i} className="border-b border-gray-100 last:border-0">
            <button 
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full text-left p-4 md:p-6 flex justify-between items-center hover:bg-gray-50 transition-colors focus:outline-none"
            >
              <span className="font-bold text-gray-900 text-lg">{faq.q}</span>
              <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${openIndex === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            
            {openIndex === i && (
              <div className="px-4 md:px-6 pb-6 text-gray-600 leading-relaxed text-sm">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
