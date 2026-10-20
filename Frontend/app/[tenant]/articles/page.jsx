
import ArticlesPageClient from "./ArticlesPageClient";

export default async function ArticlesPage({ params }) {
  const { tenant } = await params;

  return <ArticlesPageClient tenant={tenant} />;
}
