const API_URL = "https://retoolapi.dev/al4rtY/jefefinal"

async function procesar(resp) {
    let cuerpo = null;
    try {
        cuerpo = await resp.json();
    } catch (e) {
        cuerpo = null;
    }
    if (!resp.ok) {
        throw new Error(cuerpo?.message ?? `Error ${resp.status} del servidor`);
    }
    return cuerpo;
}

async function enviar(url, opciones) {
    try {
        return await fetch(url, opciones);
    } catch (e) {
        throw new Error("No se pudo conectar con el servidor");
    }
}

export async function obtenerReservas() {
    return procesar(await enviar(API_URL));
}

export async function obtenerReservaPorId(id) {
    return procesar(await enviar(`${API_URL}/${id}`));
}

export async function crearReserva(reserva) {
    return procesar(await enviar(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reserva)
    }));
}

export async function actualizarReserva(id, reserva) {
    return procesar(await enviar(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reserva)
    }));
}

export async function eliminarReserva(id) {
    return procesar(await enviar(`${API_URL}/${id}`, { method: "DELETE" }));
}