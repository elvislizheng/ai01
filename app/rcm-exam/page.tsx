import Image from "next/image";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function RCMExamPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Student Achievements */}
      <section className="pt-24 pb-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">学生成绩 | Student Achievements</h1>
          <p className="text-xl text-gray-600 mb-12 text-center">RCM钢琴考级</p>

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
