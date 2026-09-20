import { Truck, ShieldCheck, Sparkles } from "lucide-react";

export default function AnnouncementBar() {
  const items = [
    {
      icon: Truck,
      text: "Free Delivery Across Pakistan",
    },
    {
      icon: ShieldCheck,
      text: "7 Days Money-Back Warranty",
    },
    {
      icon: Sparkles,
      text: "100% Authentic Artisanal Fragrances",
    },
  ];

  // Render 4 repeating sets so the infinite marquee flows continuously on any screen width
  const repeatedSets = [0, 1, 2, 3];

  return (
    <div className="relative z-50 w-full overflow-hidden bg-stone-950 text-stone-200 border-b border-stone-800/80 select-none">
      <div className="flex w-max animate-marquee py-2 items-center">
        {repeatedSets.map((setIndex) => (
          <div key={setIndex} className="flex items-center space-x-8 shrink-0 px-4">
            {items.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="text-[11px] font-medium tracking-widest uppercase font-sans text-stone-300">
                    {item.text}
                  </span>
                  <span className="text-stone-600 ml-6 text-[10px]">✦</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
