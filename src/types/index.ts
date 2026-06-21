export type TipoUsuario = 'ADMIN' | 'PORTEIRO' | 'MORADOR';

export type ArmarioStatus = 'DISPONIVEL' | 'OCUPADO' | 'MANUTENCAO';

export type StatusRetirada = 'PENDENTE' | 'RETIRADA';

export interface AuthenticationResponse {
  token: string;
}

export interface AuthenticationRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  tipo: TipoUsuario;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface UsuarioCreateRequest {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  tipo: TipoUsuario;
}

export interface Armario {
  id: string;
  numero: string;
  status: ArmarioStatus;
  localizacao: string;
  encomendaAtual?: Encomenda | null;
}

export interface Encomenda {
  idEncomenda: string;
  descricao: string;
  remetente: string;
  dataRecebimento: string;
  armarioId: string | null;
  armarioNumero: string | null;
  usuarioId: string | null;
  usuarioEmail: string | null;
  statusRetirada: StatusRetirada;
  dataRetirada: string | null;
  dataExpiracaoCodigo: string | null;
}

export interface EncomendaRequest {
  idEncomenda: string;
  descricao: string;
  remetente: string;
  armarioId: string;
  usuarioId: string;
}

export interface CodigoAcessoResponse {
  codigo: string;
  dataExpiracao: string;
}

export interface Notificacao {
  idNotificacao: string;
  usuarioId: string;
  mensagem: string;
  dataEnvio: string;
  lida: boolean;
}

export interface RegistroAuditoria {
  idRegistro: number;
  acao: string;
  detalhes: string;
  dataHora: string;
}

export interface Compartimento {
  idCompartimento: string;
  armario?: Armario;
  ocupado: boolean;
  encomendaAtual?: Encomenda | null;
}

export interface ApiProblemDetail {
  title?: string;
  detail?: string;
  status?: number;
  path?: string;
  errors?: Array<{ field: string; message: string }>;
}

export type AuthUser = Usuario;
