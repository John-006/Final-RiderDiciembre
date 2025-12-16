const API_MONGO = 'http://localhost:3000/api/datos';
const API_EXTERNA = 'https://jsonplaceholder.typicode.com/users'; // Nueva API: Lista de usuarios
let itemSeleccionado = null; 

// ----------------------------------------------------------------------
// Función de Ayuda: Obtener y establecer valores anidados usando 'clave.subclave'
// ----------------------------------------------------------------------

// Obtener valor (ej. getValue(obj, 'address.street'))
function getValue(obj, path) {
    return path.split('.').reduce((o, i) => o ? o[i] : undefined, obj);
}

// Establecer valor (ej. setValue(obj, 'address.street', 'Nueva Calle'))
function setValue(obj, path, value) {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length; i++) {
        // Si el valor es null, undefined, o string vacío, lo manejamos como una cadena simple.
        let finalValue = value;
        
        if (i === parts.length - 1) {
            // Última parte de la ruta: asigna el valor.
            current[parts[i]] = finalValue;
        } else {
            // Si es un objeto, asegura que exista y avanza.
            // Si el objeto intermedio no existe, lo crea como objeto vacío.
            current[parts[i]] = current[parts[i]] || {}; 
            current = current[parts[i]];
        }
    }
}

// Genera una lista plana de claves anidadas (ej. ['name', 'address.street', ...])
function getNestedKeys(obj, prefix = '') {
    return Object.keys(obj).flatMap(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        
        // Ignorar claves internas de Mongo
        if (key === '_id' || key === '__v') return []; 
        
        // Si es un objeto y no es nulo/array, buscar anidados
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            return [fullKey, ...getNestedKeys(value, fullKey)];
        }
        return fullKey;
    });
}

// ----------------------------------------------------------------------
// INICIO Y CRUD (CREATE, READ, UPDATE, DELETE)
// ----------------------------------------------------------------------

// 1. INICIAR: Consumir API Externa (Ahora maneja una lista)
async function iniciarConsumo() {
    try {
        await cargarDatosMongo(); 
        
        // Si hay datos en Mongo, ya no hace falta la API externa.
        if (document.getElementById('lista-datos').childElementCount > 0) return;

        console.log(`Llamando a la API Externa (Lista): ${API_EXTERNA}`);
        const resExt = await fetch(API_EXTERNA);
        const listaExterna = await resExt.json();
        
        if (listaExterna.length > 0) {
            // Guardamos CADA elemento de la lista externa en Mongo
            for (const item of listaExterna) {
                // Borramos la clave 'id' para que Mongo genere '_id'
                delete item.id; 
                await guardarDatoExterno(item);
            }
            alert(`Se han guardado ${listaExterna.length} elementos de la API externa en Mongo.`);
            await cargarDatosMongo(); // Recargar la lista desde Mongo
        }

    } catch (error) {
        console.error("Error al iniciar el consumo o guardar el dato:", error);
        alert("Hubo un error al obtener datos de la API externa o al guardarlos en Mongo. Asegúrate que tu servidor Node.js esté corriendo.");
    }
}

// 2. READ: Cargar datos desde MongoDB
async function cargarDatosMongo() {
    const res = await fetch(API_MONGO);
    const datos = await res.json();
    const lista = document.getElementById('lista-datos');
    lista.innerHTML = '';

    datos.forEach(dato => {
        const div = document.createElement('div');
        div.className = 'item-json';
        
        // Mostrar datos relevantes en la lista para hacerlo más legible
        const nombre = dato.name || 'Sin Nombre';
        const usuario = dato.username || 'N/A';
        const ciudad = (dato.address && dato.address.city) ? dato.address.city : 'Sin Ciudad';

        div.innerText = `ID: ${dato._id.substring(0, 5)}... | Nombre: ${nombre} | Usuario: ${usuario} | Ciudad: ${ciudad}`; 
        
        div.onclick = () => seleccionarItem(dato);
        lista.appendChild(div);
    });
}

// 3. CREATE: Guardar el dato de la API externa en MongoDB (Helper)
async function guardarDatoExterno(dato) {
    await fetch(API_MONGO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dato) 
    });
}

// 4. CREATE: Crear un nuevo dato desde el formulario (CRUD C)
async function crearNuevoDato() {
    const jsonString = document.getElementById('json-crear').value.trim();

    if (!jsonString) return alert("Pega un JSON válido en el campo de texto primero.");

    let nuevoObjeto;
    try {
        nuevoObjeto = JSON.parse(jsonString);
    } catch (e) {
        return alert("Error: El texto que pegaste no es un JSON válido.");
    }

    await fetch(API_MONGO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoObjeto)
    });

    alert("¡Dato creado y guardado con éxito!");
    document.getElementById('json-crear').value = ''; 
    cargarDatosMongo(); 
}

// 5. DELETE: Borrar un dato (CRUD D)
async function borrarDato() {
    if (!itemSeleccionado) return alert("Selecciona un dato para borrar.");

    if (!confirm(`¿Estás seguro de que quieres borrar el ID: ${itemSeleccionado._id}?`)) {
        return;
    }

    await fetch(`${API_MONGO}/${itemSeleccionado._id}`, {
        method: 'DELETE',
    });

    alert("Dato borrado.");
    itemSeleccionado = null;
    document.getElementById('json-original').value = ''; 
    document.getElementById('json-nuevo').value = '';
    cargarDatosMongo(); 
}

// 6. UPDATE: Llenar el selector con claves anidadas
function seleccionarItem(dato) {
    itemSeleccionado = dato;
    document.getElementById('json-original').value = JSON.stringify(dato, null, 4);
    
    const selector = document.getElementById('selector-clave');
    selector.innerHTML = '';
    
    // Añadir una opción inicial para evitar errores si no se selecciona nada
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.innerText = '-- Selecciona una clave --';
    selector.appendChild(defaultOpt);

    // Usar la función getNestedKeys para obtener claves anidadas
    const nestedKeys = getNestedKeys(dato);
    
    nestedKeys.forEach(clave => {
        const opt = document.createElement('option');
        opt.value = clave;
        opt.innerText = clave;
        selector.appendChild(opt);
    });

    // Resetear los campos de edición
    document.getElementById('nueva-clave-input').value = ''; 
    document.getElementById('nuevo-valor').value = '';
    document.getElementById('json-nuevo').value = JSON.stringify(dato, null, 4);
}

// 7. UPDATE: Previsualizar cambios (Maneja anidados, edición y creación de claves)
function actualizarPreview() {
    if (!itemSeleccionado) return;

    // 1. Obtener la clave a usar:
    const claveExistente = document.getElementById('selector-clave').value;
    const claveNueva = document.getElementById('nueva-clave-input').value.trim();
    const valorInput = document.getElementById('nuevo-valor').value;

    let clave;
    if (claveNueva) {
        clave = claveNueva;
    } else if (claveExistente) {
        clave = claveExistente;
    } else {
        // Si no hay nada, la preview es igual al original
        document.getElementById('json-nuevo').value = document.getElementById('json-original').value;
        return;
    }

    let copiaPreview = JSON.parse(JSON.stringify(itemSeleccionado));

    // Usar la función setValue para modificar/crear la clave (anidada o nueva)
    setValue(copiaPreview, clave, valorInput);

    document.getElementById('json-nuevo').value = JSON.stringify(copiaPreview, null, 4);
}

// 8. UPDATE: Guardar Cambios (CRUD U) - Incluye lógica para crear la clave
async function guardarCambios() {
    if (!itemSeleccionado) return alert("Selecciona un dato primero");

    const claveExistente = document.getElementById('selector-clave').value;
    const claveNueva = document.getElementById('nueva-clave-input').value.trim();
    const valor = document.getElementById('nuevo-valor').value;

    let claveAGuardar;

    if (claveNueva) {
        claveAGuardar = claveNueva;
    } else if (claveExistente) {
        claveAGuardar = claveExistente;
    } else {
        return alert("Debes seleccionar una clave existente o escribir una nueva.");
    }
    
    if (valor === '') {
        return alert("El campo 'Nuevo Valor' no puede estar vacío.");
    }

    const id = itemSeleccionado._id;

    // Nota: El servidor recibe la clave (puede ser nueva, existente, o anidada) y el valor
    await fetch(`${API_MONGO}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clave: claveAGuardar, valor })
    });

    alert(`¡Cambio guardado en Mongo! Clave '${claveAGuardar}' actualizada/creada.`);
    
    // Recargar la interfaz y resetear la vista
    cargarDatosMongo(); 
    document.getElementById('json-original').value = ''; 
    document.getElementById('json-nuevo').value = '';
    document.getElementById('nueva-clave-input').value = ''; 
}

iniciarConsumo();