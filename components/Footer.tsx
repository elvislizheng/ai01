import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Image
              src="/images/logo.png"
              alt="Anna Piano Lessons"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xl font-bold">Anna Piano Lessons</span>
          </div>
          <div className="text-gray-400 text-center md:text-right">
            <p>Richmond Hill, Ontario</p>
            <p className="text-sm mt-1">© 2026 Anna Piano Lessons. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
