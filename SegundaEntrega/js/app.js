// js/app.js

const servicios = [
  { nombre: "Corte de cabello", precio: 3000 },
  { nombre: "Coloración", precio: 7000 },
  { nombre: "Peinado", precio: 2500 },
  { nombre: "Tratamiento capilar", precio: 4000 }
];

let carritoServicios = JSON.parse(localStorage.getItem("carritoServicios")) || [];
let nombreCliente = localStorage.getItem("nombreCliente") || "";

const el = {
  formCliente: document.querySelector("#form-cliente"),
  inputNombre: document.querySelector("#nombre"),
  saludo: document.querySelector("#saludo"),
  listaServicios: document.querySelector("#lista-servicios"),
  carrito: document.querySelector("#carrito"),
  total: document.querySelector("#total"),
  confirmar: document.querySelector("#confirmar"),
  estado: document.querySelector("#estado"),
};

// Mostrar saludo si ya hay nombre guardado
if (nombreCliente) {
  el.saludo.textContent = `Bienvenido/a, ${nombreCliente}`;
  el.inputNombre.value = nombreCliente;
}

// Guardar nombre en localStorage
el.formCliente.addEventListener("submit", (e) => {
  e.preventDefault();
  nombreCliente = el.inputNombre.value.trim();
  if (nombreCliente) {
    localStorage.setItem("nombreCliente", nombreCliente);
    el.saludo.textContent = `Bienvenido/a, ${nombreCliente}`;
  }
});

// Renderizar servicios 
function mostrarServicios() {
  el.listaServicios.innerHTML = "";
  servicios.forEach((srv, i) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${srv.nombre}</h3>
      <p>Precio: $${srv.precio}</p>
      <button data-index="${i}">Agregar</button>
    `;
    el.listaServicios.appendChild(div);
  });
}

// Renderizar carrito
function mostrarCarrito() {
  el.carrito.innerHTML = "";
  let total = 0;
  carritoServicios.forEach((srv, i) => {
    const li = document.createElement("li");
    li.className = "item";
    li.innerHTML = `
      ${srv.nombre} - $${srv.precio}
      <button data-remove="${i}" class="danger">Quitar</button>
    `;
    el.carrito.appendChild(li);
    total += srv.precio;
  });
  el.total.textContent = total;
  localStorage.setItem("carritoServicios", JSON.stringify(carritoServicios));
}

// Agregar servicio
el.listaServicios.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    const index = e.target.dataset.index;
    carritoServicios.push(servicios[index]);
    mostrarCarrito();
  }
});

// Quitar servicio
el.carrito.addEventListener("click", (e) => {
  if (e.target.dataset.remove !== undefined) {
    const index = e.target.dataset.remove;
    carritoServicios.splice(index, 1);
    mostrarCarrito();
  }
});

// Confirmar turno
el.confirmar.addEventListener("click", () => {
  if (!nombreCliente) {
    el.estado.textContent = "⚠️ Primero ingresa tu nombre.";
    return;
  }
  if (carritoServicios.length === 0) {
    el.estado.textContent = "⚠️ El carrito está vacío.";
    return;
  }
  el.estado.textContent = `✅ Turno confirmado para ${nombreCliente}. ¡Gracias por reservar!`;
  carritoServicios = [];
  mostrarCarrito();
});

mostrarServicios();
mostrarCarrito();
