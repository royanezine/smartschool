
// import Script from "next/script";

// const THEME_BOOTSTRAP_SCRIPT = `
// (function () {
//   try {
//     var tema =
//       window.localStorage.getItem("theme") === "dark"
//         ? "dark"
//         : "light";

//     var root = document.documentElement;

//     root.classList.toggle("dark", tema === "dark");
//     root.setAttribute("data-theme", tema);
//     root.style.colorScheme = tema;
//   } catch (error) {}
// })();
// `;

// export default function ThemeBootstrap() {
//   return (
//     <Script
//       id="system-theme-bootstrap"
//       strategy="beforeInteractive"
//       dangerouslySetInnerHTML={{
//         __html: THEME_BOOTSTRAP_SCRIPT,
//       }}
//     />
//   );
// }
