async function testRegister() {
  console.log("Testing Registration Endpoint...");
  const response = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "test.user@smartschool.dev", // email palsu untuk testing
      namaPengguna: "testuser123",
      namaLengkap: "Test User",
      kataSandi: "Password123", // Ada kapital dan angka
    }),
  });

  const data = await response.json();
  console.log("Register Response:", data);
  if (!data.success) {
    console.error("Test Register Gagal!");
    process.exit(1);
  }
  console.log("Test Register Sukses!");
}

testRegister().catch(console.error);
