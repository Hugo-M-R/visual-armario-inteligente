export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatStatusArmario(status: string): string {
  const labels: Record<string, string> = {
    DISPONIVEL: 'Disponível',
    OCUPADO: 'Ocupado',
    MANUTENCAO: 'Manutenção',
  };
  return labels[status] ?? status;
}

export function formatStatusRetirada(status: string): string {
  const labels: Record<string, string> = {
    PENDENTE: 'Pendente',
    RETIRADA: 'Retirada',
  };
  return labels[status] ?? status;
}

export function formatTipoUsuario(tipo: string): string {
  const labels: Record<string, string> = {
    ADMIN: 'Administrador',
    PORTEIRO: 'Porteiro',
    MORADOR: 'Morador',
  };
  return labels[tipo] ?? tipo;
}

export function getApiErrorMessage(error: unknown, fallback = 'Ocorreu um erro inesperado.'): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as {
      response?: {
        data?: {
          detail?: string;
          title?: string;
          errors?: Array<{ field?: string; message?: string }>;
        };
      };
    }).response;
    const data = response?.data;

    if (data?.errors?.length) {
      return data.errors
        .map((item) => (item.field ? `${item.field}: ${item.message}` : item.message))
        .filter(Boolean)
        .join(' | ');
    }

    return data?.detail ?? data?.title ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
