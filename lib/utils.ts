export function gerarId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
