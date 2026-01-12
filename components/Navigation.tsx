"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path ? "text-indigo-600 font-semibold" : "text-gray-700 hover:text-indigo-600";
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="Anna Piano Lessons"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="text-xl font-bold text-gray-900">Anna Piano Lessons</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link href="/" className={`transition-colors ${isActive("/")}`}>
              首页
            </Link>
            <Link href="/about" className={`transition-colors ${isActive("/about")}`}>
              课程介绍
            </Link>
            <Link href="/rcm-exam" className={`transition-colors ${isActive("/rcm-exam")}`}>
              RCM钢琴考级
            </Link>
            <Link href="/contact" className={`transition-colors ${isActive("/contact")}`}>
              微信联系方式
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/"
              className={`block px-4 py-2 rounded-md transition-colors ${isActive("/")}`}
              onClick={closeMenu}
            >
              首页
            </Link>
            <Link
              href="/about"
              className={`block px-4 py-2 rounded-md transition-colors ${isActive("/about")}`}
              onClick={closeMenu}
            >
              课程介绍
            </Link>
            <Link
              href="/rcm-exam"
              className={`block px-4 py-2 rounded-md transition-colors ${isActive("/rcm-exam")}`}
              onClick={closeMenu}
            >
              RCM钢琴考级
            </Link>
            <Link
              href="/contact"
              className={`block px-4 py-2 rounded-md transition-colors ${isActive("/contact")}`}
              onClick={closeMenu}
            >
              微信联系方式
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
