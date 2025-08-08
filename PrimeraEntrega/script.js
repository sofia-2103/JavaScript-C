// Lista de servicios
const servicios = [
    { nombre: "Corte de cabello", precio: 3000 },
    { nombre: "Coloración", precio: 7000 },
    { nombre: "Peinado", precio: 2500 },
    { nombre: "Tratamiento capilar", precio: 4000 }
];

let carritoServicios = [];

// Muestra servicios
function mostrarServicios() {
    console.log("Servicios disponibles:");
    let lista = "";
    for (let i = 0; i < servicios.length; i++) {
        console.log(`${i + 1} - ${servicios[i].nombre} $${servicios[i].precio}`);
        lista += `${i + 1} - ${servicios[i].nombre} ($${servicios[i].precio})\n`;
    }
    return lista;
}

//  Selecciona servicios
function seleccionarServicios() {
    let seguir = true;
    while (seguir) {
        let lista = mostrarServicios();
        let opcion = parseInt(prompt("Elige un servicio:\n" + lista));

        if (opcion >= 1 && opcion <= servicios.length) {
            carritoServicios.push(servicios[opcion - 1]);
            alert(`Has agregado: ${servicios[opcion - 1].nombre}`);
        } else {
            alert("Opción inválida, intenta de nuevo.");
        }

        seguir = confirm("¿Quieres agregar otro servicio?");
    }
}

//  Calculando total
function calcularTotal() {
    let total = 0;
    for (let i = 0; i < carritoServicios.length; i++) {
        total += carritoServicios[i].precio;
    }
    console.log("Servicios seleccionados:", carritoServicios);
    console.log("Total a pagar: $" + total);
    return total;
}

// Confirmando turno
function confirmarTurno(total) {
    let confirmacion = confirm(`El total de tu turno es $${total}.\n¿Deseas confirmar la reserva?`);
    if (confirmacion) {
        alert("✅ ¡Tu turno ha sido reservado!");
        console.log("Turno confirmado con éxito.");
    } else {
        alert("❌ Has cancelado la reserva.");
        console.log("Reserva cancelada.");
    }
}

//  Ejecucutando el simulador
alert("Bienvenido al simulador de turnos de Peluquería.");
let nombreCliente = prompt("Ingresa tu nombre:");
console.log("Cliente:", nombreCliente);

seleccionarServicios();
let total = calcularTotal();
confirmarTurno(total);
