import Image from "next/image";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Contact Section */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">联系方式 | Contact</h1>
          <p className="text-xl text-gray-600 mb-12 text-center">
            欢迎咨询钢琴课程信息
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* WeChat QR Code */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">微信联系 | WeChat</h3>
              <div className="flex justify-center mb-4">
                <Image
                  src="/images/wechat.png"
                  alt="WeChat QR Code"
                  width={300}
                  height={300}
                  className="rounded-lg"
                />
              </div>
              <p className="text-center text-gray-600">扫描二维码添加微信</p>
              <p className="text-center text-sm text-gray-500 mt-2">Scan QR code to add WeChat</p>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">地址 | Location</h3>
              <div className="flex justify-center mb-4">
                <Image
                  src="/images/location.png"
                  alt="Location Map"
                  width={400}
                  height={300}
                  className="rounded-lg"
                />
              </div>
              <div className="text-center">
                <p className="text-gray-700 font-semibold">Richmond Hill, Ontario</p>
                <p className="text-sm text-gray-500 mt-2">Greater Toronto Area</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Welcome students of all ages and levels
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
