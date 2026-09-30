"use client";

export default function TestCard({ test, isSelected, onToggle }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
      <div className="mb-3">
        <span
          className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
            test.fasting
              ? "bg-orange-50 text-orange-600 border border-orange-100"
              : "bg-green-50 text-green-600 border border-green-100"
          }`}
        >
          {test.fasting ? `⏱ Fasting Required • ${test.hours}` : "✓ No Fasting Required"}
        </span>
      </div>
      <h3 className="font-bold text-[#0A1931] text-lg leading-tight">{test.name}</h3>
      <p className="text-sm text-gray-500 mt-1.5 mb-4 leading-relaxed">{test.desc}</p>
      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <span className="text-xl font-bold text-[#0D6EFD]">GH₵ {test.price}</span>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggle(test)}
              className="w-4 h-4 text-[#0D6EFD] rounded border-gray-300 focus:ring-[#0D6EFD]"
            />
            <span className="text-sm text-gray-600">Add to cart</span>
          </label>
          <button className="text-sm text-[#0D6EFD] font-medium hover:underline">Details</button>
        </div>
      </div>
    </div>
  );
}