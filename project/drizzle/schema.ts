import { integer, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */

// Enum para roles de usuário
export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de voluntários do Health Army
 * Armazena informações de cadastro dos profissionais voluntários
 */

// Enums para voluntários
export const projectEnum = pgEnum("project", ["borahae_terapias", "purple_army"]);
export const serviceTypeEnum = pgEnum("service_type", ["gratuito", "valor_social", "ambos"]);
export const modalityEnum = pgEnum("modality", ["online", "presencial"]);
export const frequencyEnum = pgEnum("frequency", ["semanal", "quinzenal", "pontual"]);
export const statusEnum = pgEnum("status", ["ativo", "inativo", "pendente"]);

export const volunteers = pgTable("volunteers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  /** Nome completo do profissional */
  fullName: varchar("fullName", { length: 255 }).notNull(),
  /** Email de contato */
  email: varchar("email", { length: 320 }).notNull(),
  /** Telefone/WhatsApp */
  phone: varchar("phone", { length: 20 }).notNull(),
  /** Área de atuação (ex: Psicologia, Psiquiatria, Terapia Ocupacional) */
  specialization: varchar("specialization", { length: 255 }).notNull(),
  /** Registro profissional (CRP, CRM, etc) */
  professionalRegistration: varchar("professionalRegistration", { length: 100 }).notNull(),
  /** Projeto em que atua */
  project: projectEnum("project").notNull(),
  /** Tipo de atendimento oferecido */
  serviceType: serviceTypeEnum("serviceType").notNull(),
  /** Modalidade do atendimento */
  modality: modalityEnum("modality").notNull(),
  /** Duração média da sessão em minutos */
  sessionDuration: integer("sessionDuration").notNull().default(50),
  /** Frequência de atendimento preferencial */
  frequency: frequencyEnum("frequency").notNull(),
  /** Observações adicionais */
  notes: text("notes"),
  /** Endereço (para atendimentos presenciais) */
  address: text("address"),
  /** Status do cadastro */
  status: statusEnum("status").default("pendente").notNull(),
  /** Timestamps */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Volunteer = typeof volunteers.$inferSelect;
export type InsertVolunteer = typeof volunteers.$inferInsert;

/**
 * Tabela de disponibilidade de horários dos voluntários
 * Armazena os horários de disponibilidade por dia da semana
 */
export const volunteerAvailability = pgTable("volunteerAvailability", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  /** Referência ao voluntário */
  volunteerId: integer("volunteerId")
    .notNull()
    .references(() => volunteers.id, { onDelete: "cascade" }),
  /** Dia da semana (0 = domingo, 1 = segunda, ..., 6 = sábado) */
  dayOfWeek: integer("dayOfWeek").notNull(), // 0-6
  /** Horário de início (formato HH:mm) */
  startTime: varchar("startTime", { length: 5 }).notNull(),
  /** Horário de término (formato HH:mm) */
  endTime: varchar("endTime", { length: 5 }).notNull(),
  /** Timestamps */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type VolunteerAvailability = typeof volunteerAvailability.$inferSelect;
export type InsertVolunteerAvailability = typeof volunteerAvailability.$inferInsert;
