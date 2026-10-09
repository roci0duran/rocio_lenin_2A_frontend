import {
    obtenerCLientes,
    obtenerClientePorId,
    crearCliente,
    ActualizarCliente,
    eliminarCliente
} from "../service/clientesService.js";

const formulario = document.getElementById("formCliente");
const titulo = document.getElementById("tituloFormulario");
const tabla = document.getElementById("tablaClientes");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");

const campos = {
    nombre: document.getElementById("txtNombre"),
    apellido: document.getElementById("txtApellido"),
    telefono: document.getElementById("txtTelefono"),
    email: document.getElementById("txtEmail"),
    direccion: document.getElementById("txtDireccion")
};

let idEditando = null;

function mostrarAlerta(mensaje, tipo) {
    const contenedor = document.getElementById("alertas");
    const alerta = document.createElement("div");
    alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    alerta.setAttribute("role", "alert");
    alerta.textContent = mensaje;

    const cerrar = document.createElement("button");
    cerrar.type = "button";
    cerrar.className = "btn-close";
    cerrar.setAttribute("data-bs-dismiss", "alert");
    alerta.appendChild(cerrar);

    contenedor.replaceChildren(alerta);
    setTimeout(() => alerta.remove(), 4000);
}

function celda(texto) {
    const td = document.createElement("td");
    td.textContent = texto ?? "";
    return td;
}

function boton(texto, clase, accion) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `btn btn-sm ${clase} me-1`;
    b.textContent = texto;
    b.addEventListener("click", accion);
    return b;
}

function leerFormulario() {
    return {
        nombre: campos.nombre.value.trim(),
        apellido: campos.apellido.value.trim(),
        telefono: campos.telefono.value.trim(),
        email: campos.email.value.trim(),
        direccion: campos.direccion.value.trim()
    };
}

function validar(c) {
    if (!c.nombre) return "El nombre es obligatorio";
    if (!c.apellido) return "El apellido es obligatorio";
    if (!c.telefono) return "El teléfono es obligatorio";
    if (!/^[0-9+() -]{7,15}$/.test(c.telefono)) return "El teléfono debe tener entre 7 y 15 caracteres válidos";
    if (!c.email) return "El email es obligatorio";
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(c.email)) return "El email no tiene un formato válido";
    return null;
}

function reiniciarFormulario() {
    formulario.reset();
    idEditando = null;
    titulo.textContent = "Registrar cliente";
    btnGuardar.textContent = "Guardar";
    btnCancelar.classList.add("d-none");
}

function pintarTabla(clientes) {
    tabla.replaceChildren();

    if (clientes.length === 0) {
        const fila = document.createElement("tr");
        const td = celda("No hay clientes registrados");
        td.colSpan = 7;
        td.className = "text-center text-muted";
        fila.appendChild(td);
        tabla.appendChild(fila);
        return;
    }

    clientes.forEach(c => {
        const fila = document.createElement("tr");
        fila.appendChild(celda(c.id_cliente));
        fila.appendChild(celda(c.nombre));
        fila.appendChild(celda(c.apellido));
        fila.appendChild(celda(c.telefono));
        fila.appendChild(celda(c.email));
        fila.appendChild(celda(c.direccion));

        const acciones = document.createElement("td");
        acciones.appendChild(boton("Editar", "btn-warning", () => prepararEdicion(c.id_cliente)));
        acciones.appendChild(boton("Eliminar", "btn-danger", () => borrar(c.id_cliente)));
        fila.appendChild(acciones);

        tabla.appendChild(fila);
    });
}

async function cargar() {
    try {
        const respuesta = await obtenerClientes();
        pintarTabla(respuesta.data);
    } catch (error) {
        mostrarAlerta(error.message, "danger");
    }
}

async function prepararEdicion(id) {
    try {
        const respuesta = await obtenerClientePorId(id);
        const c = respuesta.data;
        campos.nombre.value = c.nombre;
        campos.apellido.value = c.apellido;
        campos.telefono.value = c.telefono;
        campos.email.value = c.email;
        campos.direccion.value = c.direccion ?? "";

        idEditando = id;
        titulo.textContent = "Editar cliente";
        btnGuardar.textContent = "Actualizar";
        btnCancelar.classList.remove("d-none");
        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
        mostrarAlerta(error.message, "danger");
    }
}

async function borrar(id) {
    if (!confirm("¿Seguro que deseas eliminar este cliente?")) return;
    try {
        const respuesta = await eliminarCliente(id);
        mostrarAlerta(respuesta.message, "success");
        if (idEditando === id) reiniciarFormulario();
        await cargar();
    } catch (error) {
        mostrarAlerta(error.message, "danger");
    }
}

formulario.addEventListener("submit", async evento => {
    evento.preventDefault();

    const cliente = leerFormulario();
    const error = validar(cliente);
    if (error) {
        mostrarAlerta(error, "warning");
        return;
    }

    try {
        const respuesta = idEditando === null
            ? await crearCliente(cliente)
            : await actualizarCliente(idEditando, cliente);
        mostrarAlerta(respuesta.message, "success");
        reiniciarFormulario();
        await cargar();
    } catch (err) {
        mostrarAlerta(err.message, "danger");
    }
});

btnCancelar.addEventListener("click", reiniciarFormulario);

cargar();