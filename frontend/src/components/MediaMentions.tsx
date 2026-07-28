export default function MediaMentions() {
  const mentions = [
    {
      logo: "ET TravelWorld",
      quote: "\"Forexmate sets industry benchmark with Lowest Rate Guarantee\""
    },
    {
      logo: "CNBC TV18",
      quote: "\"Forexmate enables same-day forex delivery, even on weekends\""
    },
    {
      logo: "The Economic Times",
      quote: "\"Forexmate launches same-day overseas education remittance service\""
    },
    {
      logo: "The Economic Times",
      quote: "\"Freeze forex rate today to transfer money abroad and pay later service launched\""
    },
    {
      logo: "ET BFSI",
      quote: "\"Forex cards are preferred over credit cards for foreign travel\""
    },
    {
      logo: "THE HINDU",
      quote: "\"Forexmate is demolishing opacity and introducing transparency\""
    },
    {
      logo: "THE TIMES OF INDIA",
      quote: "\"Forexmate to provide lowest rate guarantee & 3.3% cashback for winter travel\""
    },
    {
      logo: "moneycontrol",
      quote: "\"Now reload forex card in real time with Forexmate app\""
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto mb-20 font-sans">
      <h2 className="text-2xl font-extrabold text-gray-900 mb-8">Forexmate Media Mentions</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mentions.map((item, i) => (
          <div key={i} className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="h-12 flex items-center mb-4">
              {/* Fallback stylized text for logos since we don't have images */}
              <span className="font-serif font-black text-xl tracking-tighter text-gray-800">{item.logo}</span>
            </div>
            <p className="text-gray-800 font-medium text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: item.quote.replace(/Lowest Rate Guarantee|same-day forex delivery|education remittance service|Freeze forex rate|foreign travel|transparency|lowest rate guarantee|real time/g, (match) => `<strong>${match}</strong>`) }}></p>
          </div>
        ))}
      </div>
    </div>
  );
}
