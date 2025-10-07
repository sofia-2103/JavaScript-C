// js/app.js

const state = {
  productos: [],
  carrito: JSON.parse(localStorage.getItem('sim_carrito')) || [],
  usuario: JSON.parse(localStorage.getItem('sim_usuario')) || { nombre: '', email: '', direccion: '' },
  historial: JSON.parse(localStorage.getItem('sim_historial')) || [],
  favoritos: JSON.parse(localStorage.getItem('sim_favoritos')) || []
};

const el = {
  productosCont: document.getElementById('productos'),
  buscar: document.getElementById('buscar'),
  filtroCategoria: document.getElementById('filtro-categoria'),
  listaCarrito: document.getElementById('lista-carrito'),
  totalSpan: document.getElementById('monto-total'),
  formUsuario: document.getElementById('form-usuario'),
  inputNombre: document.getElementById('nombre'),
  inputEmail: document.getElementById('email'),
  inputDireccion: document.getElementById('direccion'),
  btnGuardar: document.getElementById('guardar-datos'),
  btnVaciar: document.getElementById('vaciar-carrito'),
  btnCheckout: document.getElementById('checkout'),
  historialList: document.getElementById('historial'),
  btnLimpiarHistorial: document.getElementById('limpiar-historial'),
  cartCount: document.getElementById('cart-count'),
  btnOpenCart: document.getElementById('btn-open-cart')
};

function guardarLocal() {
  localStorage.setItem('sim_carrito', JSON.stringify(state.carrito));
  localStorage.setItem('sim_usuario', JSON.stringify(state.usuario));
  localStorage.setItem('sim_historial', JSON.stringify(state.historial));
  localStorage.setItem('sim_favoritos', JSON.stringify(state.favoritos));
}

function formatearPrecio(n) {
  return n.toLocaleString('es-AR');
}

async function cargarProductos() {
  try {
    const resp = await fetch('./data/products.json');
    if (!resp.ok) throw new Error('No se pudo cargar products.json');
    state.productos = await resp.json();
    poblarFiltroCategorias();
    renderizarProductos(state.productos);
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los productos.' });
  }
}

function renderizarProductos(lista) {
  el.productosCont.innerHTML = '';
  if (!lista.length) {
    el.productosCont.innerHTML = '<p class="muted">No hay productos que coincidan.</p>';
    return;
  }

  lista.forEach(producto => {
    const isFav = state.favoritos.includes(producto.id);
    const fallback = producto.imageUrl || 'https://via.placeholder.com/600x400?text=Sin+imagen';
    const card = document.createElement('article');
    card.className = 'product';
    card.innerHTML = `
      <div class="media">
        <img src="${producto.image || producto.imageUrl}" alt="${producto.nombre}"
             loading="lazy"
             onerror="this.onerror=null;this.src='${fallback}';">
      </div>
      <div class="body">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <h3>${producto.nombre}</h3>
          <div class="product-meta">
            <div class="price">$${formatearPrecio(producto.precio)}</div>
          </div>
        </div>
        <p class="meta">${producto.categoria} • Stock: ${producto.stock}</p>
        <p class="meta">${producto.descripcion}</p>

        <div class="actions">
          <div class="btns">
            <button class="icon-btn detalle" data-id="${producto.id}" title="Ver detalle">
              <i class="fa-regular fa-eye"></i>
            </button>
            <button class="icon-btn agregar" data-id="${producto.id}" title="Agregar al carrito">
              <i class="fa-solid fa-cart-plus"></i>
            </button>
          </div>
          <div>
            <button class="icon-btn fav-btn ${isFav ? 'fav' : ''}" data-id="${producto.id}" title="Marcar favorito">
              <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    el.productosCont.appendChild(card);
  });
}

function poblarFiltroCategorias() {
  const categorias = Array.from(new Set(state.productos.map(p => p.categoria))).sort();
  el.filtroCategoria.innerHTML = '<option value="">Todas las categorías</option>';
  categorias.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    el.filtroCategoria.appendChild(opt);
  });
}

function renderizarCarrito() {
  el.listaCarrito.innerHTML = '';
  if (!state.carrito.length) {
    el.listaCarrito.innerHTML = '<li>No hay items en el carrito.</li>';
    el.totalSpan.textContent = '0';
    actualizarCartCount();
    guardarLocal();
    return;
  }

  let total = 0;
  state.carrito.forEach((item, idx) => {
    const producto = state.productos.find(p => p.id === item.id) || {};
    const thumb = producto.image || producto.imageUrl || 'https://via.placeholder.com/200x140?text=Sin+imagen';
    const li = document.createElement('li');
    li.innerHTML = `
      <img class="thumb" src="${thumb}" alt="${item.nombre}" onerror="this.onerror=null;this.src='https://via.placeholder.com/120x90?text=Sin+imagen'">
      <div class="cart-item-info">
        <div class="cart-item-row">
          <strong>${item.nombre}</strong>
          <div style="margin-left:auto;">$${formatearPrecio(item.precio * item.cantidad)}</div>
        </div>
        <div class="meta">Precio unit: $${formatearPrecio(item.precio)} • Cant: ${item.cantidad}</div>
      </div>
      <div>
        <button class="icon-btn remove" data-idx="${idx}" title="Quitar"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
    el.listaCarrito.appendChild(li);
    total += item.precio * item.cantidad;
  });

  el.totalSpan.textContent = formatearPrecio(total);
  actualizarCartCount();
  guardarLocal();
}

function actualizarCartCount() {
  const cuenta = state.carrito.reduce((s, it) => s + it.cantidad, 0);
  el.cartCount.textContent = cuenta;
}

function agregarAlCarrito(id) {
  const producto = state.productos.find(p => p.id === Number(id));
  if (!producto) return;
  const existente = state.carrito.find(it => it.id === producto.id);
  const cantidadActual = existente ? existente.cantidad : 0;
  if (cantidadActual + 1 > producto.stock) {
    Swal.fire({ icon: 'warning', title: 'Stock insuficiente', text: 'No hay más unidades disponibles.' });
    return;
  }
  if (existente) existente.cantidad += 1;
  else state.carrito.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1 });

  renderizarCarrito();
  Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Agregado al carrito', showConfirmButton: false, timer: 900 });
}

function quitarDelCarrito(idx) {
  if (!indexValido(idx, state.carrito.length)) return;
  state.carrito.splice(Number(idx), 1);
  renderizarCarrito();
}

function indexValido(idx, longitud) {
  const n = Number(idx);
  return Number.isInteger(n) && n >= 0 && n < longitud;
}

function precargarDatosUsuario() {
  el.inputNombre.value = state.usuario.nombre || 'Sofía Sayago';
  el.inputEmail.value = state.usuario.email || 'sofia@example.com';
  el.inputDireccion.value = state.usuario.direccion || 'Av. Ejemplo 123';
}

function guardarDatosUsuario() {
  const nombre = el.inputNombre.value.trim();
  const email = el.inputEmail.value.trim();
  const direccion = el.inputDireccion.value.trim();
  if (!nombre || !email) {
    Swal.fire({ icon: 'warning', title: 'Completa los datos', text: 'Nombre y email son obligatorios.' });
    return;
  }
  state.usuario = { nombre, email, direccion };
  guardarLocal();
  Swal.fire({ icon: 'success', title: 'Datos guardados', text: `Gracias, ${nombre}` });
}

async function checkoutSimulado() {
  if (!state.usuario.nombre || !state.usuario.email) {
    Swal.fire({ icon: 'info', title: 'Falta información', text: 'Primero guarda tus datos en "Tu info".' });
    return;
  }
  if (!state.carrito.length) {
    Swal.fire({ icon: 'info', title: 'Carrito vacío', text: 'Agrega productos al carrito para simular el pago.' });
    return;
  }

  const total = state.carrito.reduce((s, it) => s + it.precio * it.cantidad, 0);
  const htmlResumen = `
    <strong>Cliente:</strong> ${state.usuario.nombre} <br>
    <strong>Email:</strong> ${state.usuario.email} <br>
    <strong>Total:</strong> $${formatearPrecio(total)} <br>
    <strong>Items:</strong> ${state.carrito.length}
  `;

  const { isConfirmed } = await Swal.fire({
    title: 'Confirmar compra simulada',
    html: htmlResumen,
    showCancelButton: true,
    confirmButtonText: 'Simular pago',
    cancelButtonText: 'Cancelar'
  });

  if (!isConfirmed) return;

  Swal.fire({ title: 'Procesando pago...', didOpen: () => Swal.showLoading() });
  await new Promise(resolve => setTimeout(resolve, 1000));

  const transaccion = {
    id: Date.now(),
    fecha: new Date().toISOString(),
    cliente: state.usuario.nombre,
    total,
    items: state.carrito.map(i => ({ id: i.id, nombre: i.nombre, cantidad: i.cantidad, precio: i.precio }))
  };
  state.historial.unshift(transaccion);
  state.carrito = [];
  guardarLocal();
  renderizarCarrito();
  renderizarHistorial();
  Swal.fire({ icon: 'success', title: 'Pago simulado', text: 'La transacción fue registrada en historial.' });
}

function renderizarHistorial() {
  el.historialList.innerHTML = '';
  if (!state.historial.length) {
    el.historialList.innerHTML = '<li>No hay transacciones.</li>';
    return;
  }
  state.historial.forEach(tx => {
    const li = document.createElement('li');
    li.innerHTML = `<div>${new Date(tx.fecha).toLocaleString()} - $${formatearPrecio(tx.total)} <div class="meta">${tx.cliente}</div></div>`;
    el.historialList.appendChild(li);
  });
}

async function limpiarHistorial() {
  const { isConfirmed } = await Swal.fire({
    title: '¿Borrar historial?',
    text: 'Esta acción eliminará todas las transacciones registradas localmente.',
    showCancelButton: true,
    confirmButtonText: 'Sí, borrar',
    cancelButtonText: 'Cancelar'
  });
  if (!isConfirmed) return;
  state.historial = [];
  guardarLocal();
  renderizarHistorial();
  Swal.fire({ icon: 'success', title: 'Historial borrado' });
}

function toggleFavorito(id, buttonEl) {
  const numericId = Number(id);
  const idx = state.favoritos.indexOf(numericId);
  if (idx === -1) {
    state.favoritos.push(numericId);
  } else {
    state.favoritos.splice(idx, 1);
  }
  guardarLocal();
  
  const i = buttonEl.querySelector('i');
  if (i) {
    const isFavNow = state.favoritos.includes(numericId);
    i.classList.remove('fa-regular', 'fa-solid');
    i.classList.add(isFavNow ? 'fa-solid' : 'fa-regular');
  }
}

function verDetalle(id) {
  const producto = state.productos.find(p => p.id === Number(id));
  if (!producto) return;
  const imgSrc = producto.image || producto.imageUrl || 'https://via.placeholder.com/600x400?text=Sin+imagen';
  Swal.fire({
    title: producto.nombre,
    html: `
      <img src="${imgSrc}" alt="${producto.nombre}" style="width:100%;max-width:420px;border-radius:8px;margin-bottom:8px;" onerror="this.onerror=null;this.src='https://via.placeholder.com/600x400?text=Sin+imagen'">
      <p>${producto.descripcion}</p>
      <p><strong>Precio:</strong> $${formatearPrecio(producto.precio)}</p>
      <p><strong>Stock:</strong> ${producto.stock}</p>
    `,
    showCancelButton: true,
    confirmButtonText: 'Agregar al carrito',
    cancelButtonText: 'Cerrar'
  }).then(result => {
    if (result.isConfirmed) agregarAlCarrito(producto.id);
  });
}

function bindEvents() {
  el.productosCont.addEventListener('click', (e) => {
    const agregarBtn = e.target.closest('button.agregar');
    if (agregarBtn) {
      agregarAlCarrito(agregarBtn.dataset.id);
      return;
    }
    const favBtn = e.target.closest('button.fav-btn');
    if (favBtn) {
      toggleFavorito(favBtn.dataset.id, favBtn);
      return;
    }
    const detBtn = e.target.closest('button.detalle');
    if (detBtn) {
      verDetalle(detBtn.dataset.id);
      return;
    }
  });

  el.listaCarrito.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('button.remove');
    if (removeBtn) {
      quitarDelCarrito(removeBtn.dataset.idx);
    }
  });

  el.buscar.addEventListener('input', filtrarYRenderizar);
  el.filtroCategoria.addEventListener('change', filtrarYRenderizar);
  el.btnGuardar.addEventListener('click', guardarDatosUsuario);

  el.btnVaciar.addEventListener('click', async () => {
    const { isConfirmed } = await Swal.fire({
      title: 'Vaciar carrito?',
      showCancelButton: true,
      confirmButtonText: 'Sí, vaciar',
      cancelButtonText: 'Cancelar'
    });
    if (isConfirmed) {
      state.carrito = [];
      guardarLocal();
      renderizarCarrito();
      Swal.fire({ icon: 'success', title: 'Carrito vacío' });
    }
  });

  el.btnCheckout.addEventListener('click', checkoutSimulado);
  el.btnLimpiarHistorial.addEventListener('click', limpiarHistorial);

  el.formUsuario.addEventListener('input', () => {
    state.usuario.nombre = el.inputNombre.value;
    state.usuario.email = el.inputEmail.value;
    state.usuario.direccion = el.inputDireccion.value;
  });

  
  el.btnOpenCart.addEventListener('click', () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  });
}

function filtrarYRenderizar() {
  const q = el.buscar.value.trim().toLowerCase();
  const cat = el.filtroCategoria.value;
  const resultado = state.productos.filter(p => {
    const matchQ = p.nombre.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q);
    const matchCat = !cat || p.categoria === cat;
    return matchQ && matchCat;
  });
  renderizarProductos(resultado);
}

async function init() {
  if (state.usuario && (state.usuario.nombre || state.usuario.email)) {
    el.inputNombre.value = state.usuario.nombre;
    el.inputEmail.value = state.usuario.email;
    el.inputDireccion.value = state.usuario.direccion;
  } else {
    precargarDatosUsuario();
  }
  bindEvents();
  renderizarCarrito();
  renderizarHistorial();
  await cargarProductos();
}

init();