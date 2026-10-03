"use client";

import { useRouter } from "next/navigation";
import { CheckCircle, Shield, Award, Users } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  return (
    <div>
      {/* Hero - exact template match with real nurse photo */}
      <section className="bg-gradient-to-br from-[#E8F0FE] via-[#f0f7ff] to-teal-50/40 py-14 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full text-sm mb-5 shadow-sm border border-gray-100">
              <img src="https://flagcdn.com/w20/gh.png" alt="Ghana" className="w-5 h-3.5 rounded-sm object-cover" />
              <span className="font-medium text-gray-700">Serving Ghana | Accra • Kumasi • Tema</span>
            </div>

            <h1 className="text-4xl md:text-[3.25rem] font-extrabold text-[#0A1931] leading-[1.12] tracking-tight">
              We Come To You<br />Sample to Result
            </h1>

            <p className="mt-5 text-gray-600 text-lg leading-relaxed max-w-md">
              Professional medical sample collection at your home or office. Trusted, safe, and reliable lab testing across Ghana. Results delivered in 24–48 hours via our secure app.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => router.push("/book-test")}
                className="btn-primary px-6 py-3.5 flex items-center gap-2.5 text-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 16l2 2 4-4"/></svg>
                Book Now
              </button>
              <button
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                className="btn-outline px-6 py-3.5 flex items-center gap-2 text-sm"
              >
                ▶ Learn How It Works
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
              <span className="flex items-center gap-1.5"><CheckCircle size={15} className="text-green-500" /> Ghana Health Service Licensed</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={15} className="text-green-500" /> Certified Labs</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={15} className="text-green-500" /> Secure & Confidential</span>
            </div>
          </div>

          {/* Hero visual - real nurse with medical kit */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="relative h-[340px] md:h-[400px] w-full">
                <img
                  src="/nurse-hero.jpg"
                  alt="Certified HomeLab GH phlebotomist with home collection medical kit"
                  className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-4 pb-4 pt-16">
                  <p className="font-bold text-white text-lg drop-shadow">Certified Phlebotomist</p>
                  <p className="text-sm text-white/90">Ready to visit your home</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-3 -right-2 bg-white px-3.5 py-1.5 rounded-full shadow-md text-sm font-medium flex items-center gap-1.5 border border-gray-100 z-10">
              <img src="https://flagcdn.com/w20/gh.png" alt="GH" className="w-4 h-3 rounded-sm" />
              Now available across Ghana
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - exact 3 steps from template */}
      <section id="how-it-works" className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#0A1931]">How It Works</h2>
          <p className="text-gray-500 mt-2">Get tested from the comfort of your home in 3 simple steps</p>

          <div className="grid md:grid-cols-3 gap-10 mt-12">
            <div className="text-center">
              <div className="w-[72px] h-[72px] bg-[#E8F0FE] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0D6EFD" strokeWidth="1.8">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                  <path d="M9 16l2 2 4-4"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg text-[#0A1931]">1. Book Appointment</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed px-2">
                Choose your test and schedule a visit online or via phone. We confirm instantly.
              </p>
            </div>

            <div className="text-center">
              <div className="w-[72px] h-[72px] bg-[#E8F0FE] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="36" height="36" viewBox="0 0 48 48" fill="none" stroke="#0D6EFD" strokeWidth="2">
                  <path d="M8 22 L24 10 L40 22 V40 H8 Z"/>
                  <path d="M20 40 V28 H28 V40"/>
                  <rect x="34" y="14" width="8" height="18" rx="1"/>
                  <line x1="38" y1="10" x2="38" y2="14"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg text-[#0A1931]">2. Home Visit & Sample</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed px-2">
                Our certified phlebotomist visits your home, collects the sample safely & hygienically.
              </p>
            </div>

            <div className="text-center">
              <div className="w-[72px] h-[72px] bg-[#E8F0FE] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="34" height="34" viewBox="0 0 48 48" fill="none" stroke="#0D6EFD" strokeWidth="2">
                  <rect x="6" y="6" width="22" height="30" rx="2"/>
                  <path d="M12 14h10M12 20h10M12 26h6"/>
                  <path d="M14 16l2 2 4-4" strokeWidth="1.5"/>
                  <rect x="30" y="16" width="12" height="20" rx="2"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg text-[#0A1931]">3. Results via App</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed px-2">
                Lab analyzes your sample & results are delivered securely to your phone within 24–48hrs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted & Certified strip */}
      <section className="py-10 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold text-gray-400 mb-5 uppercase tracking-widest">Trusted & Certified</p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-100">
              <Shield size={15} className="text-[#0D6EFD]" /> Licensed by Ghana Health Service
            </div>
            <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-100">
              <Award size={15} className="text-[#0D6EFD]" /> ISO 15189 Certified Lab
            </div>
            <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-100">
              <Shield size={15} className="text-[#0D6EFD]" /> Secure, Confidential Results
            </div>
            <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-100">
              <Users size={15} className="text-[#0D6EFD]" /> 5000+ Samples Collected
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
