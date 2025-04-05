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
            const data = docSnap.data();
            console.log("📦 Datos obtenidos:", data);

            // Compatibilidad con 'Destino' o 'destino'
            let destino = data.Destino || data.destino;
            const clics = data.Clics || 0;

            if (!destino) {
                document.body.innerHTML = "<h2>Error: Enlace sin destino válido</h2>";
                return;
            }

            // Limpiar comillas al inicio y final si existen
            destino = destino.replace(/^"(.*)"$/, "$1");

            // Mostrar mensaje de espera
            document.body.innerHTML = "<h2>Espera unos segundos...</h2>";

            // Esperar 5 segundos (o el tiempo que quieras)
            setTimeout(() => {
                // Aumentar el contador de clics
                updateDoc(docRef, { Clics: clics + 1 })
                    .then(() => console.log("✅ Contador actualizado"))
                    .catch(err => console.error("❌ Error actualizando contador:", err));

                console.log("🔗 Redirigiendo a:", destino);

                // Redirigir al destino
                window.location.href = destino;
            }, 5000); // <-- Aquí puedes cambiar el tiempo en milisegundos
        } else {
            document.body.innerHTML = "<h2>❌ Enlace no encontrado</h2>";
        }
    }).catch(error => {
        console.error("🔥 Error obteniendo el enlace:", error);
        document.body.innerHTML = "<h2>⚠️ Error al cargar el enlace</h2>";
    });
} else {
    document.body.innerHTML = "<h2>❌ ID no especificado en la URL</h2>";
}
