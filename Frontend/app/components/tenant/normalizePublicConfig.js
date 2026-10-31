


export function normalizePublicConfig(response) {
  let data = response;

  for (let i = 0; i < 5; i += 1) {
    if (
      data &&
      typeof data === "object" &&
      !Array.isArray(data) &&
      "data" in data
    ) {
      data = data.data;
    } else {
      break;
    }
  }

  let items = [];

  if (Array.isArray(data)) {
    items = data;
  } else if (data && typeof data === "object") {
    for (const [halaman, sections] of Object.entries(data)) {
      if (!sections || typeof sections !== "object") continue;

      if (Array.isArray(sections)) {
        items.push(
          ...sections.map((config) => ({
            ...config,
            halaman:
              config.halaman ||
              config.halamanCms?.slug ||
              halaman,
          }))
        );
        continue;
      }

      if ("section" in sections) {
        items.push({
          ...sections,
          halaman:
            sections.halaman ||
            sections.halamanCms?.slug ||
            halaman,
        });
        continue;
      }

      for (const [section, config] of Object.entries(sections)) {
        if (!config || typeof config !== "object") continue;

        items.push({
          ...config,
          halaman:
            config.halaman ||
            config.halamanCms?.slug ||
            halaman,
          section: config.section || section,
        });
      }
    }
  }

  return items
    .map((item) => ({
      ...item,
      halaman:
        item.halaman ||
        item.halamanCms?.slug ||
        item.halamanCms?.judul ||
        "",
      section: item.section || "content",
      urutan: Number(item.urutan) || 1,
    }))
    .sort((a, b) => a.urutan - b.urutan);
}


