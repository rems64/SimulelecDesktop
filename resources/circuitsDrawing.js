function frame()
{
    ctx.clearRect(0,  0, width, height);
    
    // panel1.update();
    
    circuit.update();
    circuit.draw();

    window.requestAnimationFrame(frame);
}


var cvs = document.getElementById("cvs");
var ctx = cvs.getContext("2d");

var drawing = false;
var base = {x: 0, y: 0};
var mouseLoc = {x: 0, y: 0};

// var graph1 = new Graph("sin(x)", document.getElementsByTagName("body")[0], func);
// var panel1 = new Panel({x: 100, y: 100}, {width: 300, height: 400}, {title: "Graph1", docked: false, parent: document.getElementById("playground"), roundness: 10, maximized: false}, graph1, continuousUpdate= false);

function func(x)
{
    return Math.sin(x);
}

var circuit = new Circuit(cvs);


cvs.addEventListener("mousedown", (evt) => {
    drawing = true;
    base.x = evt.clientX;
    base.y = evt.clientY;
});

document.addEventListener("mousemove", (evt) => {
    mouseLoc.x = evt.clientX;
    mouseLoc.y = evt.clientY;
})

document.addEventListener("mouseup", () => {
    drawing = false;
})

var width, height;

function sizeCanvas()
{
    let margin = {x: 2, y: 2};
    width = window.innerWidth - margin.x;
    height = window.innerHeight - margin.y;
    cvs.style.position = "absolute";
    cvs.style.top = margin.x/2+'px';
    cvs.style.left = margin.y/2+'px';
    cvs.width = width;
    cvs.height = height;
}

window.onload = () => {
    sizeCanvas();
    window.addEventListener("resize", sizeCanvas);
    window.requestAnimationFrame(frame);
}

document.getElementById("addLamp").addEventListener("click", () => {
    let l = new Lamp({x: mouseLoc.x, y: mouseLoc.y});
    circuit.addComponent(l);
    circuit.setNewlyAdded(l);
})


document.getElementById("addResistor").addEventListener("click", () => {
    let r = new Resistor({x: mouseLoc.x, y: mouseLoc.y});
    circuit.addComponent(r);
    circuit.setNewlyAdded(r);
});


document.getElementById("addCapacitor").addEventListener("click", () => {
    let c = new Capacitor({x: mouseLoc.x, y: mouseLoc.y});
    circuit.addComponent(c);
    circuit.setNewlyAdded(c);
});


document.getElementById("addCoil").addEventListener("click", () => {
    let c = new Coil({x: mouseLoc.x, y: mouseLoc.y});
    circuit.addComponent(c);
    circuit.setNewlyAdded(c);
});


document.getElementById("addVoltageSupply").addEventListener("click", () => {
    let v = new IdealVoltageSupply({x: mouseLoc.x, y: mouseLoc.y});
    circuit.addComponent(v);
    circuit.setNewlyAdded(v);
});