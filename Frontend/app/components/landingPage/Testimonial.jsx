import Image from "next/image";
import { Quote, Star } from "lucide-react";

export default function Testimonial() {
  const testimonials = [
    {
      name: "Dr. Andi Pratama",
      role: "Kepala Sekolah",
      image: "/testimonial/user1.jpg",
      text: "Smart School membuat pengelolaan administrasi sekolah menjadi jauh lebih cepat. Guru dan staf kini bekerja lebih efisien karena seluruh data sudah terintegrasi.",
      featured: true,
    },
    {
      name: "Siti Rahma",
      role: "Guru",
      image: "/testimonial/user2.jpg",
      text: "Penilaian, absensi, dan jadwal sekarang jauh lebih mudah dikelola. Sistemnya sangat membantu kegiatan belajar mengajar.",
    },
    {
      name: "Budi Santoso",
      role: "Orang Tua",
      image: "/testimonial/user3.jpg",
      text: "Saya bisa memantau perkembangan anak secara langsung tanpa harus datang ke sekolah. Sangat praktis.",
    },
  ];

  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600">
            Testimoni
          </span>

          <h2 className="mt-5 text-4xl font-bold text-slate-900">
            Apa Kata Pengguna
            <span className="text-blue-600"> Smart School?</span>
          </h2>

          <p className="mt-5 text-gray-500 leading-8">
            Ribuan guru, kepala sekolah, dan orang tua telah merasakan
            kemudahan menggunakan Smart School.
          </p>
        </div>

        {/* Content */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">

          {/* Left Card */}
          <div className="lg:col-span-2 rounded-3xl bg-blue-600 p-10 text-white shadow-xl">

            <Quote size={52} className="opacity-20" />

            <p className="mt-8 text-lg leading-9">
              &quot;{testimonials[0].text}&quot;
            </p>

            <div className="mt-10 flex gap-1">
              {[1,2,3,4,5].map((i)=>(
                <Star
                  key={i}
                  size={18}
                  fill="white"
                  className="text-white"
                />
              ))}
            </div>

            <div className="mt-10 flex items-center gap-4">

              <Image
                src={testimonials[0].image}
                alt={testimonials[0].name}
                width={70}
                height={70}
                className="rounded-full object-cover border-2 border-white"
              />

              <div>
                <h4 className="font-semibold text-lg">
                  {testimonials[0].name}
                </h4>

                <p className="text-blue-100">
                  {testimonials[0].role}
                </p>
              </div>

            </div>

          </div>

          {/* Right */}
          <div className="flex flex-col gap-6">

            {testimonials.slice(1).map((item, index) => (
              <div
                key={index}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition"
              >

                <div className="flex gap-1 text-yellow-400">
                  {[1,2,3,4,5].map((i)=>(
                    <Star
                      key={i}
                      size={16}
                      fill="currentColor"
                    />
                  ))}
                </div>

                <p className="mt-5 text-sm leading-7 text-gray-600">
                  &quot;{item.text}&quot;
                </p>

                <div className="mt-6 flex items-center gap-3">

                  <Image
                    src={item.image}
                    alt={item.name}
                    width={50}
                    height={50}
                    className="rounded-full object-cover"
                  />

                  <div>
                    <h5 className="font-semibold text-slate-900">
                      {item.name}
                    </h5>

                    <p className="text-sm text-gray-500">
                      {item.role}
                    </p>
                  </div>

                </div>

              </div>
            ))}

          </div>

        </div>

      </div>
    </section>
  );
}