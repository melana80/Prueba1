// Espera que el DOM esté completamente cargado antes de ejecutar cualquier acción
document.addEventListener('DOMContentLoaded', () => {
  // Selectores de botones
  const cargarDatosBtn = document.getElementById('cargarDatos');
  const verDatosBtn = document.getElementById('verDatos');
  
  // Selectores de los elementos donde se mostrarán los datos o mensajes
  const errorMessage = document.getElementById('error-message');
  const dataContainer = document.getElementById('data-container');
  
  // Función que hace el fetch a un servicio web y obtiene los datos
  function cargarDatos() {
    // Limpiar los mensajes de error previos y los datos
    errorMessage.classList.add('hidden');
    dataContainer.innerHTML = '';

    // Hacer la solicitud al servicio web
    fetch('https://jsonplaceholder.typicode.com/posts') // API pública de ejemplo
      .then(response => {
        // Si la respuesta es exitosa (status 200-299), procesamos los datos
        if (!response.ok) {
          throw new Error('Error al obtener los datos');
        }
        return response.json();
      })
      .then(data => {
        // Mostrar los datos en pantalla
        mostrarDatos(data);

        // Almacenar los datos en IndexedDB
        almacenarEnIndexedDB(data);
      })
      .catch(error => {
        // En caso de error, mostrar el mensaje de error
        errorMessage.textContent = `Ocurrió un error: ${error.message}`;
        errorMessage.classList.remove('hidden');
      });
  }

  // Función para mostrar los datos en la pantalla
  function mostrarDatos(data) {
    // Crear una lista de elementos para cada dato
    const ul = document.createElement('ul');
    data.forEach(post => {
      const li = document.createElement('li');
      li.textContent = `ID: ${post.id} - Título: ${post.title}`;
      ul.appendChild(li);
    });

    // Insertar la lista en el contenedor de datos
    dataContainer.appendChild(ul);
  }

  // Función para almacenar los datos en IndexedDB
  function almacenarEnIndexedDB(data) {
    // Abrir (o crear) una base de datos llamada 'miBaseDeDatos' con la versión 1
    const request = indexedDB.open('miBaseDeDatos', 1);
    

    // Si la base de datos no existe, crearla
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      // Crear un almacén de objetos (object store) llamado 'posts' con la clave primaria 'id'
      if (!db.objectStoreNames.contains('posts')) {
        db.createObjectStore('posts', { keyPath: 'id' });

      }
    };

    // Si todo va bien, almacenamos los datos
    request.onsuccess = (e) => {
      const db = e.target.result;
      const transaction = db.transaction('posts', 'readwrite'); // Iniciar una transacción 'readwrite'
      const store = transaction.objectStore('posts');

      // Insertar cada post en el almacén de objetos
      data.forEach(post => {
        store.put(post); // 'put' inserta o actualiza un registro
      });

      transaction.oncomplete = () => {
        console.log('Datos almacenados en IndexedDB');
      };

      transaction.onerror = (error) => {
        console.error('Error al almacenar datos en IndexedDB', error);
      };
    };

    // Si hay algún error en la apertura de la base de datos
    request.onerror = (error) => {
      console.error('Error al abrir la base de datos', error);
    };
  }

  // Función para leer los datos almacenados en IndexedDB y mostrarlos en pantalla
  
  function verDatosAlmacenados() {
  // Limpiar el contenedor de datos antes de mostrar los almacenados
  dataContainer.innerHTML = '';
  errorMessage.classList.add('hidden');

  // Abrir la base de datos
  const request = indexedDB.open('miBaseDeDatos', 1);

  request.onsuccess = (e) => {
    const db = e.target.result;

    // Iniciar una transacción de solo lectura
    const transaction = db.transaction('posts', 'readonly');
    const store = transaction.objectStore('posts');

    // Obtener todos los registros
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
      const data = getAllRequest.result;

      if (data.length === 0) {
        dataContainer.textContent = 'No hay datos almacenados en IndexedDB.';
        return;
      }

      // Mostrar los datos
      mostrarDatos(data);
    };

    getAllRequest.onerror = () => {
      errorMessage.textContent = 'Error al leer datos almacenados.';
      errorMessage.classList.remove('hidden');
    };
  };

  request.onerror = (error) => {
    errorMessage.textContent = 'Error al abrir la base de datos.';
    errorMessage.classList.remove('hidden');
    console.error('Error al abrir la base de datos', error);
  };
}


  // Asignar eventos a los botones
  cargarDatosBtn.addEventListener('click', cargarDatos);
  verDatosBtn.addEventListener('click', verDatosAlmacenados);
  
});
