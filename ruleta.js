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
    document.getElementById("iniciar").onclick = () => girarNormal();
    await cargarListaNumeros();
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
    ctx.beginPath();
    ctx.moveTo(c.width/2 - 10, 0);
    ctx.lineTo(c.width/2 + 10, 0);
    ctx.lineTo(c.width/2, 30);
    ctx.closePath();
    ctx.fillStyle = "red";
    ctx.fill();
}

function girarNormal() {
    if (ruleta.length === 0) return mostrarGanador("No hay números en la ruleta.");
    const t = ruleta.length;
    const a = 2 * Math.PI / t;
    let randomIndex = Math.floor(Math.random() * t);
    let spins = 5;
    let currentRotation = 0;
    const targetRotation = 2 * Math.PI * spins + randomIndex * a + a / 2;
    const duration = 4000;
    const start = performance.now();
    function anim(time) {
        let elapsed = time - start;
        let progress = Math.min(elapsed / duration, 1);
        let ease = 1 - Math.pow(1 - progress, 3);
        currentRotation = targetRotation * ease;
        drawRotation(currentRotation);
        if (progress < 1) requestAnimationFrame(anim);
        else mostrarGanador(ruleta[randomIndex]);
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
        ctx.moveTo(c.width/2, c.height/2);
        ctx.fillStyle = `hsl(${i * 40}, 80%, 60%)`;
        ctx.arc(c.width/2, c.height/2, c.width/2, a*i+rotation, a*(i+1)+rotation);
        ctx.fill();

        ctx.save();
        ctx.translate(c.width/2, c.height/2);
        ctx.rotate(a*i + a/2 + rotation);
        ctx.fillStyle = "#000";
        ctx.font = "20px Arial";
        ctx.fillText(ruleta[i], 60, 10);
        ctx.restore();
    }

    ctx.beginPath();
    ctx.moveTo(c.width/2 - 10, 0);
    ctx.lineTo(c.width/2 + 10, 0);
    ctx.lineTo(c.width/2, 30);
    ctx.closePath();
    ctx.fillStyle = "red";
    ctx.fill();
}

function mostrarGanador(valor) {
    let modal = document.getElementById("modalGanador");
    if(!modal){
        modal = document.createElement("div");
        modal.id = "modalGanador";
        modal.style.cssText = "display:flex;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);justify-content:center;align-items:center;";
        const contenido = document.createElement("div");
        contenido.style.cssText = "background:white;padding:20px;border-radius:12px;text-align:center;position:relative;";
        const texto = document.createElement("h2");
        texto.id = "textoGanador";
        contenido.appendChild(texto);
        const cerrar = document.createElement("span");
        cerrar.innerHTML = "&times;";
        cerrar.style.cssText = "position:absolute;top:10px;right:20px;cursor:pointer;font-size:24px;";
        cerrar.onclick = ()=> modal.style.display="none";
        contenido.appendChild(cerrar);
        modal.appendChild(contenido);
        document.body.appendChild(modal);
    }
    document.getElementById("textoGanador").textContent = "¡Ganó el número " + valor + "!";
    modal.style.display = "flex";
}

function validarNumero(valor) {
    return /^[0-9]{4}$/.test(valor);
}

async function agregarNumero() {
    let numero = document.getElementById("numeroInput").value.trim();
    let msg = document.getElementById("mensaje");
    let lista = await getNumeros();
    if(lista.some(n=>n.valor==numero)){
        msg.textContent="Este número ya fue colocado.";
        msg.style.color="red";
        return;
    }
    if(!validarNumero(numero)){
        msg.textContent="El número debe ser de 4 dígitos.";
        msg.style.color="red";
        return;
    }
    const data = { valor: numero };
    let r = await fetch(`${SUPABASE_URL}/rest/v1/numero`, {
        method:"POST",
        headers:{
            "apikey": API_KEY,
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "Prefer":"return=minimal"
        },
        body: JSON.stringify(data)
    });
    if(r.ok){
        msg.textContent="Número guardado.";
        msg.style.color="green";
        document.getElementById("numeroInput").value="";
        await cargarListaNumeros();
        await iniciarRuleta();
    }
}

async function cargarListaNumeros() {
    let numeros = await getNumeros();
    let lista = document.getElementById("listaNumeros");
    lista.innerHTML="";
    numeros.forEach(n=>{
        let li=document.createElement("li");
        li.innerHTML=`${n.valor} <button onclick="borrarNumero(${n.id})">X</button>`;
        lista.appendChild(li);
    });
}

async function borrarNumero(id) {
    await fetch(`${SUPABASE_URL}/rest/v1/numero?id=eq.${id}`,{
        method:"DELETE",
        headers:{"apikey":API_KEY,"Authorization":`Bearer ${API_KEY}`}
    });
    await cargarListaNumeros();
    await iniciarRuleta();
}

document.getElementById("numeroInput").addEventListener("input",function(){
    this.value=this.value.replace(/[^0-9]/g,"");
    if(this.value.length>4) this.value=this.value.slice(0,4);
});

document.addEventListener("DOMContentLoaded",iniciarRuleta);

