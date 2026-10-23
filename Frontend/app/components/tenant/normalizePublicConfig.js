

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

  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const result = [];

  for (const [halaman, sections] of Object.entries(data)) {
    if (!sections || typeof sections !== "object") {
      continue;
    }

    if ("section" in sections) {
      result.push({
        ...sections,
        halaman: sections.halaman || halaman,
      });
      continue;
    }

    for (const [section, config] of Object.entries(sections)) {
      if (!config || typeof config !== "object") {
        continue;
      }

      result.push({
        ...config,
        halaman: config.halaman || halaman,
        section: config.section || section,
      });
    }
  }

  return result;
}

