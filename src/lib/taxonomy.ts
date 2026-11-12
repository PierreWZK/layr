import type { Locale } from '@/i18n/config';
import { getPool } from './db';

export type CategoryItem = {
  slug: string;
  name: string;
  description: string;
};

type CategoryRow = {
  slug: string;
  name_fr: string;
  name_en: string;
  description_fr: string;
  description_en: string;
};

// null = base non configurée. Lève une erreur si la requête échoue.
export async function listCategories(locale: Locale): Promise<CategoryItem[] | null> {
  const pool = getPool();
  if (!pool) return null;

  const { rows } = await pool.query<CategoryRow>(
    'select slug, name_fr, name_en, description_fr, description_en from categories order by id',
  );

  return rows.map((row) =>
    locale === 'fr'
      ? { slug: row.slug, name: row.name_fr, description: row.description_fr }
      : { slug: row.slug, name: row.name_en, description: row.description_en },
  );
}
