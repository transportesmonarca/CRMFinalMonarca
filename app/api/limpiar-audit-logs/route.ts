import { NextRequest, NextResponse } from "next/server"
import { limpiarAuditLogsAntiguos } from "@/lib/audit"
import { supabase } from "@/lib/supabase"

// Allow using process.env inside this route handler without installing @types/node
declare const process: any

export async function POST(request: NextRequest) {
    try {
        // Verificación server-side: se requiere un token secreto en la cabecera
        // (por ejemplo: `x-admin-token`). Configure ADMIN_API_TOKEN en el entorno.
    const adminToken = (process as any)?.env?.ADMIN_API_TOKEN
        const provided = request.headers.get("x-admin-token") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
        if (!adminToken || provided !== adminToken) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        // Obtener parámetros del body (opcional, por defecto 6 meses)
        const body = await request.json().catch(() => ({}))
        const mesesRetencion = body.mesesRetencion || 6

        // Ejecutar limpieza
        const resultado = await limpiarAuditLogsAntiguos(mesesRetencion)

        if (resultado.success) {
            // Obtener estadísticas después de la limpieza
            const countResp = await supabase.from("audit_logs").select("*", { count: "exact", head: true })
            const registrosRestantes = (countResp as any).count ?? 0

            return NextResponse.json({
                message: "Limpieza completada exitosamente",
                eliminados: resultado.eliminados,
                registrosRestantes: registrosRestantes || 0,
                mesesRetencion
            })
        } else {
            return NextResponse.json(
                { error: resultado.error },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error("Error en API de limpieza de audit logs:", error)
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        )
    }
}

// También permitir GET para verificar estado (opcional)
export async function GET(request: Request) {
    try {
        // Verificación server-side igual que en POST
    const adminToken = (process as any)?.env?.ADMIN_API_TOKEN
        const provided = (request as any).headers?.get?.("x-admin-token") || (request as any).headers?.get?.("authorization")?.replace(/^Bearer\s+/i, "")
        if (!adminToken || provided !== adminToken) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        // Obtener estadísticas actuales
        const totalResp = await supabase.from("audit_logs").select("*", { count: "exact", head: true })
        const totalRegistros = (totalResp as any).count ?? 0

        const fechaLimite = new Date()
        fechaLimite.setMonth(fechaLimite.getMonth() - 6)
        const antiguosResp = await supabase
            .from("audit_logs")
            .select("*", { count: "exact", head: true })
            .lt("fecha_creacion", fechaLimite.toISOString())
        const registrosAntiguos = (antiguosResp as any).count ?? 0

        return NextResponse.json({
            totalRegistros: totalRegistros,
            registrosAntiguos: registrosAntiguos,
            registrosActivos: totalRegistros - registrosAntiguos
        })
    } catch (error) {
        console.error("Error obteniendo estadísticas:", error)
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        )
    }
}