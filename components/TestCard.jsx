"use client";

export default function TestCard({ test, isSelected, onToggle }) {
  return (
    <div
      className={`bg-white rounded-xl border p-4 sm:p-5 shadow-sm hover:shadow-md transition ${
        isSelected ? "border-[#0D6EFD] ring-1 ring-[#0D6EFD]/30" : "border-gray-200"
      }`}
    >
      <div className="mb-3">
        <span
          className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
            test.fasting
              ? "bg-orange-50 text-orange-600 border border-orange-100"
              : "bg-green-50 text-green-600 border border-green-100"
          }`}
        >
          {test.fasting ? `⏱ Fasting • ${test.hours || "8–12 hrs"}` : "✓ No Fasting Required"}
        </span>
      </div>
      <h3 className="font-bold text-[#0A1931] text-base sm:text-lg leading-tight">{test.name}</h3>
      <p className="text-sm text-gray-500 mt-1.5 mb-4 leading-relaxed line-clamp-2">
        {test.desc || test.sample || "Lab test"}
      </p>
      <div className="flex items-center justify-between pt-2 border-t border-gray-50 gap-2">
        <span className="text-lg sm:text-xl font-bold text-[#0D6EFD] whitespace-nowrap">
          GH₵ {test.price}
        </span>
        <label className="flex items-center gap-2 cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={!!isSelected}
            onChange={() => onToggle(test)}
            className="w-4 h-4 text-[#0D6EFD] rounded border-gray-300 focus:ring-[#0D6EFD] accent-[#0D6EFD]"
          />
          <span className="text-sm text-gray-600">{isSelected ? "In cart" : "Add"}</span>
        </label>
      </div>
    </div>
  );
}
