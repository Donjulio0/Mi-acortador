// Importar Firebase y Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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

// Obtener ID y referencia de la URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const ref = params.get("ref") || "desconocido";

const body = document.body;

if (!id) {
    body.innerHTML = "<h2 style='color: red;'>ID no proporcionado en la URL</h2>";
} else {
    const docRef = doc(db, "Enlaces", id);

    getDoc(docRef)
        .then(async (docSnap) => {
            if (!docSnap.exists()) {
                body.innerHTML = "<h2 style='color: red;'>Enlace no encontrado</h2>";
                return;
            }

            const data = docSnap.data();
            const destino = data.Destino;
            let clics = parseInt(data.Clics) || 0;

            if (!destino || typeof destino !== "string" || !destino.startsWith("http")) {
                body.innerHTML = "<h2 style='color: red;'>URL de destino inválida</h2>";
                return;
            }

            // ✅ Capturar info del visitante y guardarla
            await guardarVisita(id, ref);

            // ⏱️ Mostrar temporizador
            mostrarTemporizador(destino, docRef, clics);
        })
        .catch((error) => {
            console.error("Error al obtener el documento:", error);
            body.innerHTML = "<h2 style='color: red;'>Error al cargar el enlace</h2>";
        });
}

// Guardar visita en Firestore
async function guardarVisita(id, ref) {
    try {
        const res = await fetch("https://ipwho.is/");
        const data = await res.json();

        const ip = data.ip || "desconocida";
        const pais = data.country || "desconocido";
        const ciudad = data.city || "desconocido";
        const navegador = navigator.userAgent || "desconocido";
        const sistema = navigator.platform || "desconocido";

        const adblock = await detectarAdBlock();

        const visita = {
            ip,
            pais,
            ciudad,
            navegador,
            sistema,
            adblock,
            timestamp: serverTimestamp(),
            ref
        };

        const visitasRef = collection(db, "Enlaces", id, "Visitas");
        await addDoc(visitasRef, visita);
    } catch (err) {
        console.error("Error al guardar visita:", err);
    }
}

// Detectar AdBlock
function detectarAdBlock() {
    return new Promise((resolve) => {
        const bait = document.createElement("div");
        bait.className = "adsbox";
        bait.style.position = "absolute";
        bait.style.height = "1px";
        bait.style.width = "1px";
        bait.style.left = "-10000px";
        document.body.appendChild(bait);

        setTimeout(() => {
            resolve(!bait.offsetParent);
            bait.remove();
        }, 100);
    });
}

// Mostrar temporizador y redireccionar
function mostrarTemporizador(destino, docRef, clics) {
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

            saltarBtn.click(); // Click automático
        }
    }, 1000);

    saltarBtn.addEventListener("click", () => {
        updateDoc(docRef, { Clics: clics + 1 })
            .then(() => {
                window.location.href = destino;
            })
            .catch((error) => {
                console.error("Error al registrar el clic:", error);
                body.innerHTML = "<h2>Error al registrar el clic</h2>";
            });
    });
}
