import Image from "next/image";
import { Music, Award, Clock, Users } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section id="home" className="pt-24 pb-12 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <a href="https://www.rcmusic.ca" target="_blank" rel="noopener noreferrer">
                <Image
                  src="/images/rcm-cet.png"
                  alt="Royal Conservatory of Music Certified Teacher"
                  width={333}
                  height={216}
                  className="max-w-full h-auto"
                />
              </a>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome to Anna Piano Lessons
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Richmond Hill 钢琴教学
            </p>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">关于 Anna Chen</h2>

            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Anna Chen是加拿大皇家音乐学院 RCM Advanced Certified Teacher, 上海师范大学音乐学院钢琴教育专业毕业。
                20多年钢琴教学经验，注重基本功，循循善诱，因材施教。她独特的教学形式使学生对音乐充满兴趣与自信。
              </p>

              <p className="font-semibold text-indigo-600">
                RCM考级通过率100%，学生在各个级别的RCM考试中都有获得90分以上First Class Honours with Distinction的优异成绩。
              </p>

              <p className="font-semibold text-indigo-600">
                学生曾获得CCC Piano Competition第一名，Gold Awards in Kiwanis Music Festival of Great Toronto。
              </p>
            </div>

            {/* Teacher Credentials Images */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/images/rcm-teacher-certificate.jpg"
                  alt="RCM Teacher Certificate"
                  width={800}
                  height={1000}
                  className="w-full h-auto"
                />
              </div>
              <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/images/rcm-level-10-certificate.jpg"
                  alt="RCM Level 10 Certificate"
                  width={611}
                  height={800}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">教学特色</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                <Award className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">RCM认证教师</h3>
              <p className="text-gray-600">加拿大皇家音乐学院高级认证教师</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">20+年教学经验</h3>
              <p className="text-gray-600">专业的钢琴教育背景</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
                <Clock className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">100%通过率</h3>
              <p className="text-gray-600">RCM考级通过率100%</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                <Music className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">因材施教</h3>
              <p className="text-gray-600">独特的教学方法，激发学习兴趣</p>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Tools */}
      <section className="py-12 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Interactive Learning Tools</h2>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-4">
                <Music className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Read Music Notes</h3>
              <p className="text-gray-600 mb-6">
                Practice reading music notes on the staff with an interactive piano keyboard.
                Perfect for beginners and intermediate students to improve sight-reading skills.
              </p>
              <a
                href="/learn/read-notes"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
              >
                <Music className="w-5 h-5" />
                Start Learning
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Student Achievements */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">学生成绩 | Student Achievements</h2>
          <p className="text-center text-gray-600 mb-8">RCM钢琴考级</p>

          <div className="max-w-4xl mx-auto space-y-3">
            {/* 2025 Achievements */}
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <p className="text-gray-800">
                <span className="font-semibold text-gray-900">祝贺</span>双胞胎兄弟俩Lucas在2025年RCM 8级考试中获得<span className="text-red-600 font-semibold">First Class Honours with Distinction</span> <span className="font-semibold">90分</span>, Dennis获得First Class Honours 88分的好成绩。
              </p>
            </div>

            {/* 2024 Achievements */}
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <p className="text-gray-800">
                <span className="font-semibold text-gray-900">祝贺</span>Brayden Liu在2024年RCM 8级考试中获得<span className="text-red-600 font-semibold">First Class Honours with Distinction</span> <span className="font-semibold">93分</span>的好成绩。
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <p className="text-gray-800">
                <span className="font-semibold text-gray-900">祝贺</span>Tyler Zhang在2024年RCM 6级考试中获得<span className="text-red-600 font-semibold">First Class Honours with Distinction</span> <span className="font-semibold">90分</span>的好成绩。
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <p className="text-gray-800">
                <span className="font-semibold text-gray-900">祝贺</span>Yizhou Dong在2024年RCM 6级考试中获得<span className="text-red-600 font-semibold">First Class Honours with Distinction</span> <span className="font-semibold">90分</span>的好成绩。
              </p>
            </div>

            {/* 2023 Achievements */}
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <p className="text-gray-800">
                <span className="font-semibold text-gray-900">祝贺</span>Jayden Wang在2023年RCM 6级考试中获得<span className="text-red-600 font-semibold">First Class Honours with Distinction</span> <span className="font-semibold">93分</span>的好成绩。
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <p className="text-gray-800">
                <span className="font-semibold text-gray-900">祝贺</span>Clair Hou在2023年RCM 6级考试中获得<span className="text-red-600 font-semibold">First Class Honours with Distinction</span> <span className="font-semibold">90分</span>的好成绩。
              </p>
            </div>

            {/* 2022 Achievements */}
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <p className="text-gray-800">
                <span className="font-semibold text-gray-900">祝贺</span>Chloe Feng在2022年RCM 8级考试中获得<span className="text-red-600 font-semibold">First Class Honours with Distinction</span> <span className="font-semibold">92分</span>的好成绩。
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <p className="text-gray-800">
                <span className="font-semibold text-gray-900">祝贺</span>Junji Zhu在2022年RCM 8级考试中获得<span className="text-red-600 font-semibold">First Class Honours with Distinction</span> <span className="font-semibold">91分</span>的好成绩。
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <p className="text-gray-800">
                <span className="font-semibold text-gray-900">祝贺</span>Jason Wang在2022年RCM 6级考试中获得<span className="text-red-600 font-semibold">First Class Honours with Distinction</span> <span className="font-semibold">92分</span>的好成绩。
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <p className="text-gray-800">
                <span className="font-semibold text-gray-900">祝贺</span>Brayden Liu在2022年RCM 6级考试中获得<span className="text-red-600 font-semibold">First Class Honours with Distinction</span> <span className="font-semibold">90分</span>的好成绩。
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <p className="text-gray-800">
                <span className="font-semibold text-gray-900">祝贺</span>Abigail Qian在2022年RCM 10级考试中获得First Class Honours 86分的好成绩。
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <p className="text-gray-800">
                <span className="font-semibold text-gray-900">祝贺</span>Avrail Qian在2022年RCM 8级考试中获得First Class Honours 88分的好成绩。
              </p>
            </div>

            {/* 2020 Achievements */}
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <p className="text-gray-800">
                <span className="font-semibold text-gray-900">祝贺</span>Caleb Xu, Catherine Chen, Patrick Tang在疫情之下参加的RCM10级线上考试中全部获得First Class Honours的好成绩。
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <p className="text-gray-800">
                <span className="font-semibold text-gray-900">祝贺</span>Roy Li在2020年RCM 8级考试中获得<span className="text-red-600 font-semibold">First Class Honours with Distinction</span> <span className="font-semibold">93分</span>的好成绩。
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <p className="text-gray-800">
                <span className="font-semibold text-gray-900">祝贺</span>Brayden Liu在2020年CCC Piano Competition二级组获得第一名。
              </p>
            </div>

            {/* 2019 Achievements */}
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <p className="text-gray-800">
                <span className="font-semibold text-gray-900">祝贺</span>Catherine Chen在2019年Kiwanis Music Festival of Great Toronto八级组获得Gold Awards。
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <p className="text-gray-800">
                <span className="font-semibold text-gray-900">祝贺</span>Katharine Yin 在2019年CCC Piano Competition二级组获得第二名。
              </p>
            </div>

            {/* 2018 Achievements */}
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <p className="text-gray-800">
                <span className="font-semibold text-gray-900">祝贺</span>Caleb Xu在2018年RCM 8级考试中获得<span className="text-red-600 font-semibold">First Class Honours with Distinction</span> <span className="font-semibold">90分</span>的好成绩
              </p>
            </div>

            {/* 2017 Achievements */}
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <p className="text-gray-800">
                <span className="font-semibold text-gray-900">祝贺</span>Summer Xu在2017年RCM 10级考试中获得<span className="text-red-600 font-semibold">First Class Honours with Distinction</span> <span className="font-semibold">90分</span>的好成绩
              </p>
            </div>

            {/* 2013 Achievements */}
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <p className="text-gray-800">
                <span className="font-semibold text-gray-900">祝贺</span>Summer Xu在2013年夏季RCM 6级考试中获得<span className="text-red-600 font-semibold">First Class Honours with Distinction</span> <span className="font-semibold">91分</span>的好成绩。
              </p>
            </div>

            {/* 2011 Achievements */}
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <p className="text-gray-800">
                <span className="font-semibold text-gray-900">祝贺</span>Amy Xie在2011年CCC Piano Competition六级组获得第一名
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 italic">...以及更多优秀学生成绩</p>
          </div>

          {/* CCC Piano Competition Image */}
          <div className="mt-12 flex justify-center">
            <div className="rounded-2xl overflow-hidden shadow-xl" style={{ width: '300px' }}>
              <Image
                src="/images/ccc-piano.jpg"
                alt="CCC Piano Competition Award"
                width={300}
                height={225}
                className="w-full h-auto"
              />
              <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white text-center py-2">
                <p className="text-base font-semibold">CCC Piano Competition Award</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
