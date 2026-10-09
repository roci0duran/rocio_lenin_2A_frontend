const API_URL="https://retoolapi.dev/al4rtY/jefefinal"


async function procesar(resp){
    let cuerpo=null;
    try{
        cuerpo=await resp.json();
    } catch (e){
        cuerpo=null;
    }
    if (!resp.ok){
        throw new error(cuerpo?.massage?? `Error ${resp.status} del Servidor`);
    }
    return cuerpo;
}

async function enviar(url,opciones){
    try{
        return await fetch(url,opciones);
    } catch (e) {
        throw new Error ("no se pudo contectar con el servidor");
    }
}

export async function obtenerCLientes(){
    return procesar(await enviar(API_URL));
}

export async function obtenerClientePorId(){
    return procesar(await enviar(`${API_URL}/${id}`));
}

export async function crearCliente(cliente){
    return procesar(await enviar(API_URL,{
    method:"POST",
    header:{"content-type":"application/json"},
    body:JSON.stringify(clientes)
}));
}
export async function ActualizarCliente(id,cliente){
    return procesar(await enviar(`${API_URL}/${id}`,{
    method:"PUT",
    header:{"content-type":"application/json"},
    body:JSON.stringify(clientes)
}));
}

export async function eliminarCliente(id){
    return procesar(await(`${API_URL}/${id}`,{method:"DELETE"}));
}


