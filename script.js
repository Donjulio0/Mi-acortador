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

const body = document.body;

if (!id) {
    body.innerHTML = "<h2 style='color: red;'>ID no proporcionado en la URL</h2>";
} else {
    const docRef = doc(db, "Enlaces", id);

    getDoc(docRef)
        .then((docSnap) => {
            if (!docSnap.exists()) {
                body.innerHTML = "<h2 style='color: red;'>Enlace no encontrado</h2>";
                return;
            }

            const data = docSnap.data();
            const destino = data.Destino;
            const clics = data.Clics || 0;

            if (!destino || typeof destino !== "string" || !destino.startsWith("http")) {
                body.innerHTML = "<h2 style='color: red;'>URL de destino inválida</h2>";
                return;
            }

            // Mostrar UI de redirección
            mostrarTemporizador(destino, docRef, clics);
        })
        .catch((error) => {
            console.error("Error al obtener el documento:", error);
            body.innerHTML = "<h2 style='color: red;'>Error al cargar el enlace</h2>";
        });
}

function mostrarTemporizador(destino, docRef, clics) {
    // Crear elementos
    body.innerHTML = `
        <div style="text-align: center; font-family: sans-serif; margin-top: 20vh;">
            <h2>Redirigiendo en <span id="contador">15</span> segundos...</h2>
            <button id="saltarBtn" disabled style="padding: 10px 20px; font-size: 16px; cursor: not-allowed; background-color: #ccc; border: none; border-radius: 5px;">
                Saltar anuncio
            </button>
        </div>
    `;

    const contador = document.getElementById("contador");
    const saltarBtn = document.getElementById("saltarBtn");
    let segundos = 15;

    const intervalo = setInterval(() => {
        segundos--;
        contador.textContent = segundos;

        if (segundos <= 0) {
            clearInterval(intervalo);
            saltarBtn.disabled = false;
            saltarBtn.textContent = "Ir al sitio";
            saltarBtn.style.backgroundColor = "#007bff";
            saltarBtn.style.color = "#fff";
            saltarBtn.style.cursor = "pointer";

            // Agrega listener al botón
            saltarBtn.addEventListener("click", () => {
                updateDoc(docRef, { Clics: clics + 1 }).then(() => {
                    window.location.href = destino;
                }).catch((error) => {
                    console.error("Error al actualizar los clics:", error);
                    body.innerHTML = "<h2>Error al registrar el clic</h2>";
                });
            });

            // También redirige automáticamente
            updateDoc(docRef, { Clics: clics + 1 }).then(() => {
                window.location.href = destino;
            });
        }
    }, 1000);
}
