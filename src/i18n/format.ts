// Remplace {clé} dans un texte traduit : fmt("{n} results", { n: 3 })
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

export function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : fmt(many, { n });
}
