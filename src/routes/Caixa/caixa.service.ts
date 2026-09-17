import { prisma } from "../../lib/prismaclient";

type CaixaLevel = "ABERTA" | "FECHADA";

interface CaixaData {
    id: string;
    status: CaixaLevel;
    operador: string;
    operador_id: string;
    data_abertura?: Date;
    data_fechadura?: Date;
}

export async function createCaixa(data: CaixaData) {
    try {
        const caixa = await prisma.caixa.create({
            data: {
                status: data.status,
                data_fechadura: new Date() ?? data.data_fechadura,
                operadorId: data.operador_id,
                data_abertura: data.data_abertura ?? new Date(),
                id: data.id,
                operador: data.operador ? "OPERADOR" : "ADMINISTRADOR"
            },
        });
        return caixa;
    } catch (error) {
        console.error("Erro ao criar caixa:", error);
        return null;
    }
}