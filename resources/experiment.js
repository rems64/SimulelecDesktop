var formula = [];

document.getElementById("btn1").addEventListener("click", () => {
    let a = document.getElementById("formula").value;
    let both = tokenify(a);
    formula = stackify(both.tokens);
    graph1.update();
    panel1.update();
})

var graph1 = new Graph("sin(x)", document.getElementsByTagName("body")[0], func);
var panel1 = new Panel({x: 100, y: 100}, {width: 300, height: 400}, {title: "Graph1", docked: false, parent: document.getElementsByTagName("body")[0], roundness: 10, maximized: false}, graph1, continuousUpdate=false);

function func(x)
{
    return evaluateStackified(formula, {x: x});
}

function frame()
{
    panel1.update();
    window.requestAnimationFrame(frame);
}

window.onload = () => {    
    window.requestAnimationFrame(frame);
}