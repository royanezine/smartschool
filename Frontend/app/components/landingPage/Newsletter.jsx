export default function Newsletter() {
  return (
    <section className="py-20 bg-blue-600">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Dapatkan Informasi Terbaru SmartSchool
        </h2>

        <p className="text-blue-100 max-w-2xl mx-auto mb-8">
          Berlangganan newsletter kami untuk mendapatkan update fitur,
          tips pendidikan, dan informasi terbaru seputar SmartSchool.
        </p>

        <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="Masukkan email Anda"
            className="flex-1 px-5 py-3 rounded-lg bg-white text-gray-800 outline-none"
          />

          <button
            className="px-6 py-3 rounded-lg bg-white text-blue-600 font-semibold hover:bg-gray-100 transition"
          >
            Berlangganan
          </button>
        </div>
      </div>
    </section>
  );
}