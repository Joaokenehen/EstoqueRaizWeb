export interface Usuario {
    id: string;
    nome: string;
    email: string;
    senha:string;
    cargo: 'admin' | 'operador';
    createdAt: Date;
}