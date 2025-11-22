let ruleta = [];

const SUPABASE_URL = "https://bifnkdsevykstbwzpqqp.supabase.co";
const API_KEY = "sb_publishable_FRxgP2w5yNG5sWufKCxGAg_01Z45wFL";

async function getGanadores() {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/ganador?select=*`, {
        headers: { "apikey": API_KEY, "Authorization": `Bearer ${API_KEY}` }
    });
    return await r.json();
}

async function getNumeros() {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/numero?select=*`, {
        headers: { "apikey": API_KEY, "Authorization": `Bearer ${API_KEY}` }
    });
    return await r.json();
}

async function iniciarRuleta() {
    let ganadores = await getGanadores();
    let numeros = await getNumeros();
    ruleta = numeros.map(n => n.valor).concat(ganadores.map(g => g.valor));
    dibujar();
    document.getElementById("iniciar").onclick = () => girarTrampa(ganadores);
}

function dibujar() {
    const c = document.getElementById("canvas");
    const ctx = c.getContext("2d");
    const t = ruleta.length;
    const a = 2 * Math.PI / t;
    ctx.clearRect(0, 0, c.width, c.height);
    for (let i = 0; i < t; i++) {
        ctx.beginPath();
        ctx.moveTo(c.width / 2, c.height / 2);
        ctx.fillStyle = `hsl(${i * 40}, 80%, 60%)`;
        ctx.arc(c.width / 2, c.height / 2, c.width / 2, a * i, a * (i + 1));
        ctx.fill();
        ctx.save();
        ctx.translate(c.width / 2, c.height / 2);
        ctx.rotate(a * i + a / 2);
        ctx.fillStyle = "#000";
        ctx.font = "20px Arial";
        ctx.fillText(ruleta[i], 60, 10);
        ctx.restore();
    }
}

function girarTrampa(ganadores) {
    if (ruleta.length === 0) return alert("No hay números en la ruleta.");
    if (ganadores.length === 0) return alert("No hay ganadores definidos.");
    const t = ruleta.length;
    const a = 2 * Math.PI / t;
    const ganadorSeleccionado = ganadores[Math.floor(Math.random() * ganadores.length)].valor;
    const index = ruleta.indexOf(ganadorSeleccionado);
    let spins = 5;
    let currentRotation = 0;
    const targetRotation = 2 * Math.PI * spins + index * a + a / 2;
    const duration = 4000;
    const start = performance.now();
    function anim(time) {
        let elapsed = time - start;
        let progress = Math.min(elapsed / duration, 1);
        let ease = 1 - Math.pow(1 - progress, 3);
        currentRotation = targetRotation * ease;
        drawRotation(currentRotation);
        if (progress < 1) requestAnimationFrame(anim);
        else alert("Resultado: " + ganadorSeleccionado);
    }
    requestAnimationFrame(anim);
}

function drawRotation(rotation) {
    const c = document.getElementById("canvas");
    const ctx = c.getContext("2d");
    const t = ruleta.length;
    const a = 2 * Math.PI / t;
    ctx.clearRect(0, 0, c.width, c.height);
    for (let i = 0; i < t; i++) {
        ctx.beginPath();
        ctx.moveTo(c.width / 2, c.height / 2);
        ctx.fillStyle = `hsl(${i * 40}, 80%, 60%)`;
        ctx.arc(c.width / 2, c.height / 2, c.width / 2, a * i + rotation, a * (i + 1) + rotation);
        ctx.fill();
        ctx.save();
        ctx.translate(c.width / 2, c.height / 2);
        ctx.rotate(a * i + a / 2 + rotation);
        ctx.fillStyle = "#000";
        ctx.font = "20px Arial";
        ctx.fillText(ruleta[i], 60, 10);
        ctx.restore();
    }
}

document.addEventListener("DOMContentLoaded", iniciarRuleta);
