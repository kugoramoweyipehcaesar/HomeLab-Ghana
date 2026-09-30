export default function Footer() {
  return (
    <footer className="bg-[#0A1931] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src="/logo-icon.svg" alt="HomeLab GH" className="w-8 h-8" />
            <span className="font-bold text-lg">HomeLab GH</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            Reliable lab testing services in Ghana. Licensed & accredited by GHS.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-400">Quick Links</h4>
          <ul className="text-sm text-gray-300 space-y-2">
            <li className="hover:text-white cursor-pointer">About Us</li>
            <li className="hover:text-white cursor-pointer">How It Works</li>
            <li className="hover:text-white cursor-pointer">FAQs</li>
            <li className="hover:text-white cursor-pointer">Contact Us</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-400">Support</h4>
          <p className="text-sm text-gray-300">help@homelabgh.com</p>
          <p className="text-sm text-gray-300 mt-1">+233 30 234 5678</p>
          <p className="text-sm text-gray-300 mt-1">Accra, Ghana</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-400">Opening Hours</h4>
          <p className="text-sm text-gray-300">Mon – Sat: 7:00am – 6:00pm</p>
          <p className="text-sm text-gray-300 mt-1">Sunday: 9:00am – 4:00pm</p>
        </div>
      </div>
      <div className="border-t border-gray-700 text-center py-4 text-xs text-gray-400">
        © 2024 HomeLab GH. All rights reserved. • Privacy Policy • Terms & Conditions
      </div>
    </footer>
  );
}