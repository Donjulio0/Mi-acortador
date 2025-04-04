// Importar Firebase y Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBxZ4LOUTd8Q3PrE1r6vdREE8C9XhKQn_Q",
    authDomain: "mi-acortador.firebaseapp.com",
    projectId: "mi-acortador",
    storageBucket: "mi-acortador.firebasestorage.app",
    messagingSenderId: "432327378237",
    appId: "1:432327378237:web:24fd59e9b484d39ba97154",
    measurementId: "G-7GCSSBB673"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Obtener ID de la URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (id) {
    const docRef = doc(db, "Enlaces", id);
    getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
            const destino = docSnap.data().Destino;
            const clics = docSnap.data().Clics || 0;

            // Mostrar mensaje mientras carga el anuncio
            document.body.innerHTML = "<h2>Espera unos segundos...</h2>";

            // Simular la espera de un anuncio (puedes agregar código real de anuncios aquí)
            setTimeout(() => {
                // Incrementar el contador de clics en Firebase
                updateDoc(docRef, { Clics: clics + 1 });

                // Redirigir a la URL de destino
                window.location.href = destino;
            }, 50000); // Espera 5 segundos antes de redirigir
        } else {
            document.body.innerHTML = "<h2>Enlace no encontrado</h2>";
        }
    }).catch(error => {
        console.error("Error obteniendo el enlace:", error);
        document.body.innerHTML = "<h2>Error al cargar el enlace</h2>";
    });
} else {
    document.body.innerHTML = "<h2>ID no especificado en la URL</h2>";
}