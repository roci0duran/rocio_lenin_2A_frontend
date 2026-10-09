const API_URL=""

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

export async function obtenerVehiculos() {
    return procesar(await enviar(API_URL));
}

export async function obtenerVehiculoPorId(id) {
    return procesar(await enviar(`${API_URL}/${id}`));
}