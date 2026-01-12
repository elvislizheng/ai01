import Image from "next/image";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Course Information */}
      <section className="pt-24 pb-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">课程介绍 | Course Information</h1>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 mb-8">
              <p className="text-lg text-gray-700 mb-4">
                <span className="font-semibold">采用YAMAHA U3钢琴教学，高级别使用YAMAHA C3X三角钢琴。</span>
              </p>
            </div>

            <div className="space-y-8">
              {/* Piano Course */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-600">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">1. 钢琴课</h3>
                <div className="space-y-3 text-gray-700">
                  <p>
                    招收各个年龄段和各个级别的钢琴学生，教材选用加拿大皇家音乐学院（
                    <a href="http://rcmusic.ca/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-semibold">
                      RCM
                    </a>
                    ）指定教材。
                  </p>
                  <p className="font-semibold text-indigo-600">中、英双语一对一教学。</p>
                </div>
              </div>

              {/* Adult Piano Course */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">2. 成人钢琴兴趣课</h3>
                <div className="space-y-4 text-gray-700">
                  <p>
                    您想在朋友聚会的时候弹出一首流畅动听的钢琴小曲吗？您想弹出自己所喜爱的流行歌曲或经典怀旧老歌吗？您想为心爱的宝宝弹出他想听的儿歌吗？
                  </p>
                  <p>
                    成人钢琴兴趣班可以帮助您实现心中的梦想，能让您在短时期内掌握正确地钢琴弹奏方法与技巧，加强对音乐的鉴赏力和感悟力，在轻松学习乐理、识谱等知识的同时，更加注重独立演奏的能力。
                  </p>

                  <div className="bg-purple-50 rounded-lg p-4 mt-4">
                    <p className="font-semibold text-purple-900 mb-2">我们的宗旨：</p>
                    <p className="text-gray-700">帮助那些想弹钢琴的成年人实现梦想，让更多的人感受音乐无穷的魅力。</p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="font-semibold text-purple-900 mb-2">学习内容：</p>
                    <p className="text-gray-700">零起步，从识谱开始，教授基本的演奏方法，掌握钢琴基本技巧，独立弹奏简单曲目。</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Studio Image */}
            <div className="mt-8 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/studio-1.jpg"
                alt="YAMAHA Piano Studio"
                width={1024}
                height={768}
                className="w-full h-auto"
              />
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-3">
                <p className="text-lg font-semibold">YAMAHA Piano Studio</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
