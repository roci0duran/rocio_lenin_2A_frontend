import {
    obtenerReservas,
    obtenerReservaPorId,
    crearReserva,
    actualizarReserva,
    eliminarReserva
} from "../service/reservasServicie.js";
import { obtenerClientes } from "../service/clientesService.js";
import { obtenerVehiculos } from "../service/vehiculosService.js";

const formulario = document.getElementById("formReserva");
const titulo = document.getElementById("tituloFormulario");
const tabla = document.getElementById("tablaReservas");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const grupoEstado = document.getElementById("grupoEstado");

const campos = {
    cliente: document.getElementById("idCliente"),
    vehiculo: document.getElementById("idVehiculo"),
    nombre: document.getElementById("txtNombreReserva"),
    fecha: document.getElementById("txtFechaReserva"),
    pasajeros: document.getElementById("txtPasajeros"),
    dias: document.getElementById("txtDias"),
    estado: document.getElementById("txtEstado")
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

function llenarSelect(select, items, campoValor, textoItem, placeholder) {
    select.replaceChildren();

    const base = document.createElement("option");
    base.value = "";
    base.textContent = placeholder;
    select.appendChild(base);

    items.forEach(item => {
        const opcion = document.createElement("option");
        opcion.value = item[campoValor];
        opcion.textContent = textoItem(item);
        select.appendChild(opcion);
    });
}

async function cargarSelects() {
    try {
        const [clientes, vehiculos] = await Promise.all([obtenerClientes(), obtenerVehiculos()]);
        llenarSelect(campos.cliente, clientes.data, "id_cliente",
            c => `${c.nombre} ${c.apellido}`, "Selecciona un cliente");
        llenarSelect(campos.vehiculo, vehiculos.data, "id_vehiculo",
            v => `${v.marca} ${v.modelo} - ${v.placa} (cap. ${v.capacidad})`, "Selecciona un vehículo");
    } catch (error) {
        mostrarAlerta(error.message, "danger");
    }
}

function leerFormulario() {
    const reserva = {
        id_cliente: Number(campos.cliente.value),
        id_vehiculo: Number(campos.vehiculo.value),
        nombre_reserva: campos.nombre.value.trim(),
        fecha_reserva: campos.fecha.value,
        cantidad_pasajeros: Number(campos.pasajeros.value),
        cantidad_dias: Number(campos.dias.value)
    };
    if (idEditando !== null) reserva.estado = campos.estado.value;
    return reserva;

function validar(r) {
    if (!r.id_cliente) return "Selecciona un cliente";
    if (!r.id_vehiculo) return "Selecciona un vehículo";
    if (!r.nombre_reserva) return "El nombre de la reserva es obligatorio";
    if (!r.fecha_reserva) return "La fecha de la reserva es obligatoria";
    if (!Number.isInteger(r.cantidad_pasajeros) || r.cantidad_pasajeros <= 0)
        return "La cantidad de pasajeros debe ser un entero mayor a 0";
    if (!Number.isInteger(r.cantidad_dias) || r.cantidad_dias <= 0)
        return "La cantidad de días debe ser un entero mayor a 0";
    if (!Number.isInteger(r.cantidad_pasajeros) || r.cantidad_pasajeros >= 6)
        return "La cantidad de pasajeros debe ser un entero menor a 6";
    if (!Number.isInteger(r.cantidad_dias) || r.cantidad_dias >= 14)
        return "La cantidad de días debe ser un entero mayor a 12";
    return null;
}

function reiniciarFormulario() {
    formulario.reset();
    idEditando = null;
    titulo.textContent = "Registrar reserva";
    btnGuardar.textContent = "Guardar";
    btnCancelar.classList.add("d-none");
    grupoEstado.classList.add("d-none");
}

function dinero(valor) {
    return Number(valor).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function pintarTabla(reservas) {
    tabla.replaceChildren();

    if (reservas.length === 0) {
        const fila = document.createElement("tr");
        const td = celda("No hay reservas registradas");
        td.colSpan = 9;
        td.className = "text-center text-muted";
        fila.appendChild(td);
        tabla.appendChild(fila);
        return;
    }

    reservas.forEach(r => {
        const fila = document.createElement("tr");
        fila.appendChild(celda(r.nombre_cliente));
        fila.appendChild(celda(r.nombre_vehiculo));
        fila.appendChild(celda(r.nombre_reserva));
        fila.appendChild(celda(r.fecha_reserva));
        fila.appendChild(celda(r.cantidad_pasajeros));
        fila.appendChild(celda(r.cantidad_dias));
        fila.appendChild(celda(dinero(r.total_pago)));
        fila.appendChild(celda(r.estado));

        const acciones = document.createElement("td");
        acciones.appendChild(boton("Editar", "btn-warning", () => prepararEdicion(r.id_reserva)));
        acciones.appendChild(boton("Eliminar", "btn-danger", () => borrar(r.id_reserva)));
        fila.appendChild(acciones);

        tabla.appendChild(fila);
    });
}

async function cargarReservas() {
    try {
        const respuesta = await obtenerReservas();
        pintarTabla(respuesta.data);
    } catch (error) {
        mostrarAlerta(error.message, "danger");
    }
}

async function prepararEdicion(id) {
    try {
        const respuesta = await obtenerReservaPorId(id);
        const r = respuesta.data;
        campos.cliente.value = r.id_cliente;
        campos.vehiculo.value = r.id_vehiculo;
        campos.nombre.value = r.nombre_reserva;
        campos.fecha.value = r.fecha_reserva;
        campos.pasajeros.value = r.cantidad_pasajeros;
        campos.dias.value = r.cantidad_dias;
        campos.estado.value = r.estado;

        idEditando = id;
        titulo.textContent = "Editar reserva";
        btnGuardar.textContent = "Actualizar";
        btnCancelar.classList.remove("d-none");
        grupoEstado.classList.remove("d-none");
        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
        mostrarAlerta(error.message, "danger");
    }
}

async function borrar(id) {
    if (!confirm("¿Seguro que deseas eliminar esta reserva?")) return;
    try {
        const respuesta = await eliminarReserva(id);
        mostrarAlerta(respuesta.message, "success");
        if (idEditando === id) reiniciarFormulario();
        await cargarReservas();
    } catch (error) {
        mostrarAlerta(error.message, "danger");
    }
}

formulario.addEventListener("submit", async evento => {
    evento.preventDefault();

    const datos = leerFormulario();
    const error = validar(datos);
    if (error) {
        mostrarAlerta(error, "warning");
        return;
    }

    try {
        const respuesta = idEditando === null
            ? await crearReserva(datos)
            : await actualizarReserva(idEditando, datos);
        mostrarAlerta(respuesta.message, "success");
        reiniciarFormulario();
        await cargarReservas();
    } catch (err) {
        mostrarAlerta(err.message, "danger");
    }
});

btnCancelar.addEventListener("click", reiniciarFormulario);

cargarSelects();
cargarReservas();
}