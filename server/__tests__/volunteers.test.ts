import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";

describe("Volunteers Router", () => {
  const caller = appRouter.createCaller({} as any);

  const mockVolunteerData = {
    fullName: "João Silva",
    email: "joao@example.com",
    phone: "11987654321",
    specialization: "Psicologia",
    professionalRegistration: "CRP 06/123456",
    project: "borahae_terapias" as const,
    serviceType: "gratuito" as const,
    modality: "online" as const,
    sessionDuration: 50,
    frequency: "semanal" as const,
    notes: "Disponível para atender em português",
    address: undefined,
    availability: [
      {
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "12:00",
      },
      {
        dayOfWeek: 3,
        startTime: "14:00",
        endTime: "17:00",
      },
    ],
  };

  describe("create", () => {
    it("deve criar um novo voluntário com sucesso", async () => {
      const result = await caller.volunteers.create(mockVolunteerData);

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("message");
      expect(result.message).toContain("sucesso");
      expect(typeof result.id).toBe("number");
      expect(result.id).toBeGreaterThan(0);
    });

    it("deve validar email inválido", async () => {
      const invalidData = {
        ...mockVolunteerData,
        email: "email-invalido",
      };

      try {
        await caller.volunteers.create(invalidData);
        expect.fail("Deveria ter lançado erro");
      } catch (error: any) {
        expect(error.message).toBeTruthy();
      }
    });

    it("deve validar nome obrigatório", async () => {
      const invalidData = {
        ...mockVolunteerData,
        fullName: "",
      };

      try {
        await caller.volunteers.create(invalidData);
        expect.fail("Deveria ter lançado erro");
      } catch (error: any) {
        expect(error.message).toBeTruthy();
      }
    });

    it("deve validar telefone com mínimo de dígitos", async () => {
      const invalidData = {
        ...mockVolunteerData,
        phone: "123",
      };

      try {
        await caller.volunteers.create(invalidData);
        expect.fail("Deveria ter lançado erro");
      } catch (error: any) {
        expect(error.message).toBeTruthy();
      }
    });

    it("deve validar especialidade obrigatória", async () => {
      const invalidData = {
        ...mockVolunteerData,
        specialization: "",
      };

      try {
        await caller.volunteers.create(invalidData);
        expect.fail("Deveria ter lançado erro");
      } catch (error: any) {
        expect(error.message).toBeTruthy();
      }
    });

    it("deve validar registro profissional obrigatório", async () => {
      const invalidData = {
        ...mockVolunteerData,
        professionalRegistration: "",
      };

      try {
        await caller.volunteers.create(invalidData);
        expect.fail("Deveria ter lançado erro");
      } catch (error: any) {
        expect(error.message).toBeTruthy();
      }
    });

    it("deve validar projeto obrigatório", async () => {
      const invalidData = {
        ...mockVolunteerData,
        project: "" as any,
      };

      try {
        await caller.volunteers.create(invalidData);
        expect.fail("Deveria ter lançado erro");
      } catch (error: any) {
        expect(error.message).toBeTruthy();
      }
    });

    it("deve validar tipo de atendimento obrigatório", async () => {
      const invalidData = {
        ...mockVolunteerData,
        serviceType: "" as any,
      };

      try {
        await caller.volunteers.create(invalidData);
        expect.fail("Deveria ter lançado erro");
      } catch (error: any) {
        expect(error.message).toBeTruthy();
      }
    });

    it("deve validar modalidade obrigatória", async () => {
      const invalidData = {
        ...mockVolunteerData,
        modality: "" as any,
      };

      try {
        await caller.volunteers.create(invalidData);
        expect.fail("Deveria ter lançado erro");
      } catch (error: any) {
        expect(error.message).toBeTruthy();
      }
    });

    it("deve validar frequência obrigatória", async () => {
      const invalidData = {
        ...mockVolunteerData,
        frequency: "" as any,
      };

      try {
        await caller.volunteers.create(invalidData);
        expect.fail("Deveria ter lançado erro");
      } catch (error: any) {
        expect(error.message).toBeTruthy();
      }
    });

    it("deve validar formato de hora inválido", async () => {
      const invalidData = {
        ...mockVolunteerData,
        availability: [
          {
            dayOfWeek: 1,
            startTime: "9:00",
            endTime: "12:00",
          },
        ],
      };

      try {
        await caller.volunteers.create(invalidData);
        expect.fail("Deveria ter lançado erro");
      } catch (error: any) {
        expect(error.message).toBeTruthy();
      }
    });
  });

  describe("list", () => {
    it("deve listar todos os voluntários", async () => {
      const result = await caller.volunteers.list();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getById", () => {
    it("deve retornar null para ID inexistente", async () => {
      const result = await caller.volunteers.getById({ id: 999999 });
      expect(result).toBeNull();
    });

    it("deve obter um voluntário criado", async () => {
      // Criar um voluntário
      const created = await caller.volunteers.create(mockVolunteerData);
      const volunteerId = created.id;

      // Obter o voluntário
      const result = await caller.volunteers.getById({ id: volunteerId });

      expect(result).not.toBeNull();
      expect(result?.id).toBe(volunteerId);
      expect(result?.fullName).toBe(mockVolunteerData.fullName);
      expect(result?.email).toBe(mockVolunteerData.email);
      expect(result?.availability).toBeDefined();
      expect(Array.isArray(result?.availability)).toBe(true);
    });
  });

  describe("update", () => {
    it("deve atualizar um voluntário", async () => {
      // Criar um voluntário
      const created = await caller.volunteers.create(mockVolunteerData);
      const volunteerId = created.id;

      // Atualizar
      const updateData = {
        id: volunteerId,
        data: {
          fullName: "João Silva Atualizado",
          status: "ativo" as const,
        },
      };

      const result = await caller.volunteers.update(updateData);
      expect(result).toHaveProperty("message");
      expect(result.message).toContain("sucesso");

      // Verificar se a atualização foi aplicada
      const updated = await caller.volunteers.getById({ id: volunteerId });
      expect(updated?.fullName).toBe("João Silva Atualizado");
      expect(updated?.status).toBe("ativo");
    });

    it("deve validar email ao atualizar", async () => {
      // Criar um voluntário
      const created = await caller.volunteers.create(mockVolunteerData);
      const volunteerId = created.id;

      const updateData = {
        id: volunteerId,
        data: {
          email: "email-invalido",
        },
      };

      try {
        await caller.volunteers.update(updateData);
        expect.fail("Deveria ter lançado erro");
      } catch (error: any) {
        expect(error.message).toBeTruthy();
      }
    });
  });

  describe("delete", () => {
    it("deve deletar um voluntário", async () => {
      // Criar um voluntário para deletar
      const created = await caller.volunteers.create(mockVolunteerData);
      const volunteerId = created.id;

      // Deletar
      const result = await caller.volunteers.delete({ id: volunteerId });
      expect(result).toHaveProperty("message");
      expect(result.message).toContain("sucesso");

      // Verificar se foi deletado
      const deleted = await caller.volunteers.getById({ id: volunteerId });
      expect(deleted).toBeNull();
    });
  });
});
