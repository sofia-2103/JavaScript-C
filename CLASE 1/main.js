

function agregarLibro(titulo, autor) {
    return { titulo, autor };
}

function mostrarDetalleLibro(libro) {
    console.log(`Título: ${libro.titulo}, Autor: ${libro.autor}`);
}

// Agregar un libro
let libro1 = agregarLibro("1984", "George Orwell");

// Mostrar detalles del libro
mostrarDetalleLibro(libro1);
// Muestra: Título: 1984, Autor: George Orwell