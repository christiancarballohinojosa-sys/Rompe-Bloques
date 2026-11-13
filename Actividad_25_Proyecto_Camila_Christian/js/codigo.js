// ELEMENTOS DEL HTML Y CANVAS
const canvas = document.getElementById("juego");
const ctx = canvas.getContext("2d");
const puntosHTML = document.getElementById("puntos");
const vidasHTML = document.getElementById("vidas");
const mensaje = document.getElementById("mensaje");
const botonInicio = document.getElementById("inicio");

let puntos = 0;
let vidas = 3;
let jugando = false;
let izquierda = false;
let derecha = false;
let animacion;

// OBJETO JUGADOR: PLATAFORMA
const jugador = {
    x: 225, y: 370, ancho: 100, alto: 12,

    mover() {
        if (izquierda) this.x -= 6;
        if (derecha) this.x += 6;
        this.x = Math.max(0, Math.min(550 - this.ancho, this.x));
    },

    dibujar() {
        let colores = ["#ed1c24", "#ffd700", "#009739"];

        colores.forEach((color, i) => {
            ctx.fillStyle = color;
            ctx.fillRect(
                this.x + i * this.ancho / 3,
                this.y,
                this.ancho / 3,
                this.alto
            );
        });
    }
};

// OBJETO PELOTA
const pelota = {
    x: 275, y: 340, dx: 3, dy: -3, radio: 8,

    mover() {
        this.x += this.dx;
        this.y += this.dy;

        if (this.x < this.radio || this.x > 550 - this.radio) {
            this.dx *= -1;
        }
        if (this.y < this.radio) {
            this.dy *= -1;
        }
    },

    dibujar() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
    }
};

// ARREGLO DE BLOQUES: OBSTACULOS
let bloques = [];

function crearBloques() {
    bloques = [];
    let colores = ["#ed1c24", "#ffd700", "#009739"];

    for (let f = 0; f < 3; f++) {
        for (let c = 0; c < 6; c++) {
            bloques.push({
                x: 25 + c * 85,
                y: 40 + f * 30,
                color: colores[f],
                visible: true
            });
        }
    }
}

// OBJETO META: COMPRUEBA LA VICTORIA
const meta = {
    comprobar() {
        return bloques.every(b => !b.visible);
    }
};

// DIBUJAR EL ESCENARIO Y LOS OBJETOS
function dibujar() {
    ctx.clearRect(0, 0, 550, 400);

    bloques.forEach(b => {
        if (b.visible) {
            ctx.fillStyle = b.color;
            ctx.fillRect(b.x, b.y, 75, 20);
        }
    });

    jugador.dibujar();
    pelota.dibujar();
}

// REINICIAR POSICION DE PELOTA Y JUGADOR
function nuevaPelota() {
    pelota.x = 275;
    pelota.y = 340;
    pelota.dx = 3;
    pelota.dy = -3;
    jugador.x = 225;
}

// FINALIZAR PARTIDA
function terminar(texto) {
    jugando = false;
    cancelAnimationFrame(animacion);
    mensaje.textContent = texto;
    botonInicio.textContent = "INICIAR / PAUSAR";
}

// ACTUALIZAR MOVIMIENTOS Y COLISIONES
function actualizar() {
    if (!jugando) return;

    jugador.mover();
    pelota.mover();

    // COLISION CON LA PLATAFORMA
    if (
        pelota.dy > 0 &&
        pelota.y + pelota.radio >= jugador.y &&
        pelota.y - pelota.radio <= jugador.y + jugador.alto &&
        pelota.x >= jugador.x &&
        pelota.x <= jugador.x + jugador.ancho
    ) {
        pelota.dy = -Math.abs(pelota.dy);
    }

    // COLISION CON LOS BLOQUES
    let bloque = bloques.find(b =>
        b.visible &&
        pelota.x + pelota.radio > b.x &&
        pelota.x - pelota.radio < b.x + 75 &&
        pelota.y + pelota.radio > b.y &&
        pelota.y - pelota.radio < b.y + 20
    );

    if (bloque) {
        bloque.visible = false;
        pelota.dy *= -1;
        puntos += 10;
        puntosHTML.textContent = puntos;
    }

    // CONDICION DE VICTORIA
    if (meta.comprobar()) {
        terminar("¡GANASTE!");
    }

    // PERDER UNA VIDA
    if (pelota.y > 410) {
        vidas--;
        vidasHTML.textContent = vidas;

        if (vidas <= 0) {
            terminar("¡FIN DEL JUEGO!");
        } else {
            nuevaPelota();
        }
    }

    dibujar();

    if (jugando) {
        animacion = requestAnimationFrame(actualizar);
    }
}

// EVENTOS DEL TECLADO
document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") {
        izquierda = true;
        e.preventDefault();
    }

    if (e.key === "ArrowRight") {
        derecha = true;
        e.preventDefault();
    }
});

document.addEventListener("keyup", e => {
    if (e.key === "ArrowLeft") izquierda = false;
    if (e.key === "ArrowRight") derecha = false;
});

// BOTONES TACTILES PARA CELULAR Y TABLET
function controlarBoton(id, direccion) {
    const boton = document.getElementById(id);

    boton.addEventListener("pointerdown", e => {
        e.preventDefault();
        direccion(true);
    });

    ["pointerup", "pointerleave", "pointercancel"].forEach(evento => {
        boton.addEventListener(evento, () => direccion(false));
    });
}

controlarBoton("izquierda", valor => izquierda = valor);
controlarBoton("derecha", valor => derecha = valor);

// CONTROL CON MOUSE EN COMPUTADORA
canvas.addEventListener("mousemove", e => {
    if (!jugando) return;

    const r = canvas.getBoundingClientRect();

    jugador.x = (e.clientX - r.left) * 550 / r.width
        - jugador.ancho / 2;

    jugador.x = Math.max(0, Math.min(550 - jugador.ancho, jugador.x));
});

// BOTON INICIAR Y PAUSAR
botonInicio.addEventListener("click", () => {
    if (jugando) {
        jugando = false;
        cancelAnimationFrame(animacion);
        mensaje.textContent = "JUEGO PAUSADO";
        botonInicio.textContent = "CONTINUAR";
        return;
    }

    if (vidas <= 0 || meta.comprobar()) {
        reiniciar();
    }

    jugando = true;
    mensaje.textContent = "";
    botonInicio.textContent = "PAUSAR";
    actualizar();
});

// REINICIAR TODA LA PARTIDA
function reiniciar() {
    jugando = false;
    cancelAnimationFrame(animacion);

    puntos = 0;
    vidas = 3;
    izquierda = false;
    derecha = false;

    puntosHTML.textContent = puntos;
    vidasHTML.textContent = vidas;

    botonInicio.textContent = "INICIAR / PAUSAR";
    mensaje.textContent = "PARTIDA REINICIADA";

    crearBloques();
    nuevaPelota();
    dibujar();
}

// EVENTO DEL BOTON REINICIAR
document.getElementById("reiniciar").addEventListener("click", reiniciar);

// PREPARAR TABLERO INICIAL
crearBloques();
dibujar();