import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Fornecedor extends Model {
  public id!: number;
  public razao_social!: string;
  public nome_fantasia?: string;
  public cnpj!: string;
  public telefone?: string;
  public email?: string;
  public rua?: string;
  public numero?: string;
  public bairro?: string;
  public cidade?: string;
  public estado?: string;
  public cep?: string;
  public criado_em?: Date;
  public atualizado_em?: Date;

  public toJSON(): object {
    return Object.assign({}, this.get());
  }
}

Fornecedor.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    razao_social: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    nome_fantasia: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    cnpj: {
      type: DataTypes.STRING(18),
      allowNull: false,
      unique: true,
    },
    telefone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    rua: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    numero: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    bairro: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    cidade: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    estado: {
      type: DataTypes.STRING(2),
      allowNull: true,
    },
    cep: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    criado_em: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    atualizado_em: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'fornecedores',
    timestamps: false,
  }
);
