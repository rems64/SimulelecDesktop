function lerpVec(a, b, t) {
    return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t
    };
}

function isInRectangle(x, y, ax, ay, bx, by) {
    return x >= Math.min(ax, bx) && x <= Math.max(ax, bx) && y >= Math.min(ay, by) && y <= Math.max(ay, by);
}

function isInDilatedRectangle(x, y, ax, ay, bx, by, thickness) {
    return x >= Math.min(ax, bx) - thickness && x <= Math.max(ax, bx) + thickness && y >= Math.min(ay, by) - thickness && y <= Math.max(ay, by) + thickness;
}

function isOnLine(x, y, ax, ay, bx, by, thickness) {
    let dx = bx - ax;
    let dy = by - ay;
    let t = (x - ax) * dx + (y - ay) * dy;
    t /= (dx * dx + dy * dy);
    let px = ax + dx * t;
    let py = ay + dy * t;
    let dist = Math.sqrt((px - x) * (px - x) + (py - y) * (py - y));
    return dist <= thickness;
}

function isOnVerticalLine(x, y, ax, ay, bx, by, thickness) {
    return x>=Math.min(ax, bx)-thickness && x<=Math.max(ax, bx)+thickness && y>=Math.min(ay, by) && y<=Math.max(ay, by);
}

function isOnHorizontalLine(x, y, ax, ay, bx, by, thickness) {
    return y>=Math.min(ay, by)-thickness && y<=Math.max(ay, by)+thickness && x>=Math.min(ax, bx) && x<=Math.max(ax, bx);
}

function getBoundingBox(points, bonusPoints=[])
{
    let minX = Number.MAX_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;
    let maxX = Number.MIN_SAFE_INTEGER;
    let maxY = Number.MIN_SAFE_INTEGER;
    let element = points[0];
    for(let i=0; i<points.length; i++)
    {
        element = points[i];
        minX = Math.min(minX, element.x);
        minY = Math.min(minY, element.y);
        maxX = Math.max(maxX, element.x);
        maxY = Math.max(maxY, element.y);
    }
    for(let i=0; i<bonusPoints.length; i++)
    {
        element = bonusPoints[i];
        minX = Math.min(minX, element.x);
        minY = Math.min(minY, element.y);
        maxX = Math.max(maxX, element.x);
        maxY = Math.max(maxY, element.y);
    }
    return {
        minX: minX,
        minY: minY,
        maxX: maxX,
        maxY: maxY
    };
}


const wiresMargin = 30;
const wiresThickness = 4;

const wireColors = ["red", "green", "blue", "brown", "black"];

class Drawable
{
    constructor(position)
    {
        this.position = {x: position.x, y: position.y};
        this._visibility = "visible";
    }

    show()
    {
        this._visibility = "visible";
    }

    hide()
    {
        this._visibility = "hidden";
    }

    isVisible()
    {
        return this._visibility == "visible";
    }

    getPosition()
    {
        return this.position;
    }
}

class WireBezier extends Drawable
{
    constructor(position, end, color='red')
    {
        super(position);
        this._endPoint = {x: end.x, y: end.y};
        this._beginHandle = {x: Math.abs(end.x-position.x)*0.8, y: 0};
        this._endHandle = {x: -Math.abs(end.x-position.x)*0.8, y: 0};
        this._resolution = 100;
        this._color = color;
    }

    draw()
    {
        if(this._visibility == "hidden")
            return;
        let h = 0;
        let a = {x: this.position.x+this._beginHandle.x, y: this.position.y+this._beginHandle.y};
        let b = {x: this._endPoint.x+this._endHandle.x, y: this._endPoint.y+this._endHandle.y};
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        for(let i=0; i<=this._resolution; i++)
        {
            h = i/this._resolution;
            let c = lerpVec(this.position, a, h);
            let d = lerpVec(a, b, h);
            let e = lerpVec(b, this._endPoint, h);
            let f = lerpVec(c, d, h);
            let g = lerpVec(d, e, h);
            let p = lerpVec(f, g, h);
            ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = this._color;
        ctx.stroke();
    }

    update()
    {

    }

    dragZone(position)
    {
        return {type: "none"};
    }

    setPosition(position)
    {
        this.position.x = position.x;
        this.position.y = position.y;
        this._beginHandle.x = Math.max(20, Math.abs(this._endPoint.x-this.position.x)*0.8);
        this._endHandle.x = Math.min(-10, -Math.abs(this._endPoint.x-this.position.x)*0.8);
        this._beginHandle.y = 0;
        this._endHandle.y = 0;
    }

    getEnd()
    {
        return this._endPoint;
    }

    setEnd(position)
    {
        this._endPoint.x = position.x;
        this._endPoint.y = position.y;
        this._beginHandle.x = Math.max(20, Math.abs(this._endPoint.x-this.position.x)*0.8);
        this._endHandle.x = Math.min(-10, -Math.abs(this._endPoint.x-this.position.x)*0.8);
        this._endHandle.y = 0;
        this._endHandle.y = 0;
    }
}

class Wire extends Drawable
{
    constructor(position, end, color='red')
    {
        super(position);
        this._endPoint = {x: end.x, y: end.y};
        this._color = color;
        this._inConnected = false;
        this._outConnected = false;
        this._inPin = null;
        this._outPin = null;
        this._reroutes = [];
        this._selected = false;
        this._bb = getBoundingBox([this.position, this._endPoint]);
    }

    draw()
    {
        if(this._visibility == "hidden")
            return;
        //Set wire thickness
        ctx.save();
        if(this._selected)
        {
            ctx.lineWidth = wiresThickness*2;
            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);
            for(let i in this._reroutes)
            {
                ctx.lineTo(this._reroutes[i].x, this._reroutes[i].y);
            }
            ctx.lineTo(this._endPoint.x, this._endPoint.y);
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = 'rgb(255, 127, 0)';
            ctx.stroke();
        }
        ctx.lineWidth = wiresThickness;
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        for(let i in this._reroutes)
        {
            ctx.lineTo(this._reroutes[i].x, this._reroutes[i].y);
        }
        ctx.lineTo(this._endPoint.x, this._endPoint.y);
        ctx.strokeStyle = this._color;
        ctx.setLineDash([]);
        ctx.stroke();
        ctx.restore();
    }

    update()
    {
        if(this._inConnected)
        {
            this.position.x = this._inPin.position.x;
            this.position.y = this._inPin.position.y;
            this._endPoint.x = this._outPin.position.x; 
            this._endPoint.y = this._outPin.position.y;
            this._reroutes = [];
            if(this._inPin._type=="input" && this._outPin._type=="output")
            {
                if(this._inPin.position.x > this._outPin.position.x)
                {
                    const mid = (this._endPoint.x-this.position.x)/2 + this.position.x;
                    this._reroutes[0] = {x: mid, y: this.position.y};
                    this._reroutes[1] = {x: mid, y: this._endPoint.y};
                }
                else
                {
                    const mid = (this._endPoint.y-this.position.y)/2 + this.position.y;
                    this._reroutes[0] = {x: this.position.x - wiresMargin, y: this.position.y};
                    this._reroutes[1] = {x: this.position.x - wiresMargin, y: mid};
                    this._reroutes[2] = {x: this._endPoint.x + wiresMargin, y: mid};
                    this._reroutes[3] = {x: this._endPoint.x + wiresMargin, y: this._endPoint.y};
                }
            }
            else if(this._inPin._type=="output" && this._outPin._type=="input")
            {
                if(this._inPin.position.x < this._outPin.position.x)
                {
                    const mid = (this._endPoint.x-this.position.x)/2 + this.position.x;
                    this._reroutes[0] = {x: mid, y: this.position.y};
                    this._reroutes[1] = {x: mid, y: this._endPoint.y};
                }
                else
                {
                    const mid = (this._endPoint.y-this.position.y)/2 + this.position.y;
                    this._reroutes[0] = {x: this.position.x + wiresMargin, y: this.position.y};
                    this._reroutes[1] = {x: this.position.x + wiresMargin, y: mid};
                    this._reroutes[2] = {x: this._endPoint.x - wiresMargin, y: mid};
                    this._reroutes[3] = {x: this._endPoint.x - wiresMargin, y: this._endPoint.y};
                }
            }
            else if(this._inPin._type=="input" && this._outPin._type=="input")
            {
                const mid = Math.min(this.position.x, this._endPoint.x) - wiresMargin;
                this._reroutes[0] = {x: mid, y: this.position.y};
                this._reroutes[1] = {x: mid, y: this._endPoint.y};
            }
            else if(this._inPin._type=="output" && this._outPin._type=="output")
            {
                const mid = Math.max(this._endPoint.x, this.position.x) + wiresMargin;
                this._reroutes[0] = {x: mid, y: this.position.y};
                this._reroutes[1] = {x: mid, y: this._endPoint.y};
            }
            else
            {
                console.log("ERROR on pin types : " + this._inPin._type + " | " + this._outPin._type);
            }
        }
        else
        {
            this._reroutes = [];
        }
        if(this._reroutes.length>0)
        {
            this._bb = getBoundingBox(this._reroutes, [this.position, this._endPoint]);
        }
    }

    dragZone(position)
    {
        if(isInDilatedRectangle(position.x, position.y, this._bb.minX, this._bb.minY, this._bb.maxX, this._bb.maxY, wiresThickness))
        {
            if(this._reroutes.length > 1)
            {
                let a = position;
                let b = this._reroutes[0];
                for(let i=0; i<=this._reroutes.length; i++)
                {
                    if(i==0)
                    {
                        a = this.position;
                        b = this._reroutes[i];
                    }
                    else if(i==this._reroutes.length)
                    {
                        a = this._reroutes[i-1];
                        b = this._endPoint;
                    }
                    else
                    {
                        a = this._reroutes[i-1];
                        b = this._reroutes[i];
                    }
                    if(a.x>b.x)
                    {
                        if(isOnHorizontalLine(position.x, position.y, b.x, b.y, a.x, a.y, wiresThickness))
                        {
                            return {type: "wire", wire: this, reroute: i-1};
                        }
                    }
                    else if(a.x<b.x)
                    {
                        if(isOnHorizontalLine(position.x, position.y, a.x, a.y, b.x, b.y, wiresThickness))
                        {
                            return {type: "wire", wire: this, reroute: i-1};
                        }
                    }
                    else if(a.y>b.y)
                    {
                        if(isOnVerticalLine(position.x, position.y, b.x, b.y, a.x, a.y, wiresThickness))
                        {
                            return {type: "wire", wire: this, reroute: i-1};
                        }
                    }
                    else if(a.y<b.y)
                    {
                        if(isOnVerticalLine(position.x, position.y, a.x, a.y, b.x, b.y, wiresThickness))
                        {
                            return {type: "wire", wire: this, reroute: i-1};
                        }
                    }
                }
            }
            else
            {
                if(isOnLine(position.x, position.y, this.position.x, this.position.y, this._endPoint.x, this._endPoint.y))
                {
                    return {type: "wire", wire: this};
                }
            }
        }
        return {type: "none"};
    }

    setPosition(position)
    {
        this.position.x = position.x;
        this.position.y = position.y;
    }

    getEnd()
    {
        return this._endPoint;
    }

    setEnd(position)
    {
        this._endPoint.x = position.x;
        this._endPoint.y = position.y;
    }
}

class Component extends Drawable
{
    constructor(position, color='grey')
    {
        super(position);
        this._color = color;
        this._size = {x: 150, y: 100};
        this._inputPins = [];
        this._outputPins = [];
        this._spacingBetweenPins = 40;
        this._marginPins = 20;

        this._connections = [];

        this._selected = false;

        this._mouseOffset = {x: 0, y: 0};
    }

    update()
    {
        for(let i in this._inputPins)
        {
            this._inputPins[i].update(this._marginPins+this._spacingBetweenPins*i);
        }
        for(let i in this._outputPins)
        {
            this._outputPins[i].update(this._marginPins+this._spacingBetweenPins*i);
        }
    }

    draw()
    {
        for(let i in this._inputPins)
        {
            this._inputPins[i].draw();
        }
        for(let i in this._outputPins)
        {
            this._outputPins[i].draw();
        }

        if(this._selected)
        {
            const margin = 10;

            ctx.strokeStyle = "orange";
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(this.position.x-margin, this.position.y-margin, this._size.x+2*margin, this._size.y+2*margin);
            ctx.setLineDash([]);
        }
    }

    contains(point)
    {
        return point.x>this.position.x && point.x<this.position.x+this._size.x && point.y>this.position.y && point.y<this.position.y+this._size.y;
    }

    dragZone(point)
    {
        for(let i in this._inputPins)
        {
            if(this._inputPins[i].contains(point))
            {
                return {type: 'pin', pin: this._inputPins[i], index: i, side: 'input'};
            }
        }
        for(let i in this._outputPins)
        {
            if(this._outputPins[i].contains(point))
            {
                return {type: 'pin', pin: this._outputPins[i], index: i, side: 'output'};
            }
        }
        let inside = point.x>this.position.x && point.x<this.position.x+this._size.x && point.y>this.position.y && point.y<this.position.y+this._size.y;
        return {type: inside ? 'component' : 'none', pin: null};
    }

    addConnection(side, index, wire)
    {
        this._connections.push({side: side, index: index, wire: wire});
    }

    prepareToRemove()
    {
        var wiresToRemove = [];
        for(let i in this._connections)
        {
            wiresToRemove.push(this._connections[i].wire);
        }
        return wiresToRemove; 
    }
}

class Pin extends Drawable
{
    constructor(component, type)
    {
        super(component.position);
        this._component = component;
        this._color = "black";
        this._type = type;
        this._nature = "coaxial";
        this._radius = 5;
        this._hoverOffset = 10;
    }

    update(offset)
    {
        if(this._type=="input")
        {
            this.position.x = this._component.position.x;
        }
        else if(this._type=="output")
        {
            this.position.x = this._component.position.x + this._component._size.x;
        }
        this.position.y = this._component.position.y + offset;
    }
    
    draw()
    {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this._radius, 0, 2*Math.PI);
        ctx.fillStyle = this._color;
        ctx.fill();
    }

    contains(point)
    {
        return point.x>this.position.x-this._radius-this._hoverOffset && point.x<this.position.x+this._radius+this._hoverOffset && point.y>this.position.y-this._radius-this._hoverOffset && point.y<this.position.y+this._radius+this._hoverOffset;
    }
}

class Dipole extends Component
{
    constructor(position, color='grey')
    {
        super(position, color);
        this._inputPins = [new Pin(this, "input")];
        this._outputPins = [new Pin(this, "output")];
    }

    update()
    {   
        super.update();
        this._marginPins = this._size.y/2;
    }

    draw()
    {
        super.draw();
    }
}

class Quadrupole extends Component
{
    constructor(position, color='grey')
    {
        super(position, color);
        this._inputPins = [new Pin(this, "input"), new Pin(this, "input")];
        this._outputPins = [new Pin(this, "output"), new Pin(this, "output")];
    }

    update()
    {   
        super.update();
        // Evently vertically space the four pins
        this._spacingBetweenPins = this._size.y - 2*this._marginPins;
    }

    draw()
    {
        super.draw();
    }
}

class Circuit
{
    constructor(canvas)
    {
        this._cvs = canvas;
        this._ctx = this._cvs.getContext("2d");
        
        this._cvs.addEventListener("mousedown", this.mouseDown.bind(this));
        document.addEventListener("mouseup", this.mouseUp.bind(this));
        this._cvs.addEventListener("mousemove", this.mouseMove.bind(this));
        document.addEventListener("keydown", this.keyDown.bind(this));
        this._mouseDown = false;

        this._components = [];
        this._wires = [];
        this._draggedComponents = [];
        this._selectedComponents = [];
        this._tempWire = new Wire({x: 0, y: 0}, {x: 0, y: 0}, "red");
        this._tempWireOrigin = null;
        this._tempWireHook = {x: 0, y: 0};
        this._tempWire.hide();
        this._tmpDraggingPinTarget = null;
        this._draggingType = null;
        this._draggingRect = {x: 0, y: 0, w: 0, h: 0};
        this._snappingWidth = 25;
        this._backgroundRedraw = true;
        this._backgroundCanvas = document.createElement("canvas");
        this._backgroundCtx = this._backgroundCanvas.getContext("2d");
        this._backgroundCanvas.width = this._cvs.width;
        this._backgroundCanvas.height = this._cvs.height;
    }

    mouseDown(e)
    {
        this._draggingType = "box_select";
        this._draggingRect = {x: e.clientX, y: e.clientY, w: 0, h: 0};
        let modified = false;
        if(this._draggingType=="added_component")
        {
            this._draggingType = "none";
            return;
        }
        for(let i=this._components.length-1; i>=0; i--)
        {
            let drag = this._components[i].dragZone({x: e.offsetX, y: e.offsetY});
            if(drag.type == 'component')
            {
                modified = true;
                this._draggingType = "component";
                this._draggedComponents.push(this._components[i]);
                this._components[i]._mouseOffset = {x: e.offsetX - this._components[i].position.x, y: e.offsetY - this._components[i].position.y};
            }
            else if(this._selectedComponents.includes(this._components[i]))
            {
                this._draggedComponents.push(this._components[i]);
                this._components[i]._mouseOffset = {x: e.offsetX - this._components[i].position.x, y: e.offsetY - this._components[i].position.y};
            }
            else if(drag.type == 'pin')
            {
                modified = true;
                this._draggingType = drag.side=='input' ? "wire_in" : "wire_out";
                if(drag.side=='input')
                {
                    this._tempWireHook = drag.pin.position;
                }
                this._tempWireOrigin = drag.pin;
                this._tempWire.setPosition(drag.pin.position);
                this._tempWire.setEnd(drag.pin.position);
            }
        }
        this._mouseDown = true;
        if(!modified)
        {
            this._selectedComponents = [];
            this._draggedComponents = [];
            for(let i=0; i<this._wires.length; i++)
            {
                let drag = this._wires[i].dragZone({x: e.offsetX, y: e.offsetY});
                if(drag.type == "wire")
                {
                    drag.wire._selected = !drag.wire._selected;
                }
            }
        }
    }

    mouseUp(e)
    {
        if(this._draggingType=="added_component_pending")
        {
            this._draggingType = "added_component";
            return;
        }
        this._mouseDown = false;
        this._draggedComponents = [];
        this._tempWire.hide();
        if((this._draggingType=="wire_in" || this._draggingType=="wire_out") && (this._tempWire.getEnd().x != this._tempWire.getPosition().x || this._tempWire.getEnd().y != this._tempWire.getPosition().y))
        {
            let wire = new Wire(this._tempWire.getPosition(), this._tempWire.getEnd(), "red");
            wire._inConnected = true;
            wire._inPin = this._tempWireOrigin;
            wire._outConnected = true;
            wire._outPin = this._tmpDraggingPinTarget;
            this._wires.push(wire);
            this._draggingType = "none";
            this._tempWireOrigin._component.addConnection(this._tempWireOrigin._type, this._tempWireOrigin._index, wire);
            this._tmpDraggingPinTarget._component.addConnection(this._tmpDraggingPinTarget._type, this._tmpDraggingPinTarget._index, wire);
        }
        // Check for each component if it's selected or not
        for(let i=0; i<this._components.length; i++)
        {
            if(!this._selectedComponents.includes(this._components[i]))
            {
                this._components[i]._selected = false;
            }
        }
        this._draggingType = null;
    }

    mouseMove(e)
    {
        if(this._mouseDown)
        {
            switch(this._draggingType)
            {
                case "component":
                    for(let i in this._draggedComponents)
                    {
                        // Update the position of the component taking into account the snapping
                        this._draggedComponents[i].position.x = Math.round((e.offsetX - this._draggedComponents[i]._mouseOffset.x)/this._snappingWidth)*this._snappingWidth;
                        this._draggedComponents[i].position.y = Math.round((e.offsetY - this._draggedComponents[i]._mouseOffset.y)/this._snappingWidth)*this._snappingWidth;
                    }
                    break;
                case "added_component":
                    this._draggedComponents[0].position.x = Math.round((e.offsetX - this._draggedComponents[0]._mouseOffset.x)/this._snappingWidth)*this._snappingWidth;
                    this._draggedComponents[0].position.y = Math.round((e.offsetY - this._draggedComponents[0]._mouseOffset.y)/this._snappingWidth)*this._snappingWidth;
                    break;

                case "wire_in":
                    this._tempWire.setPosition({x: e.offsetX, y: e.offsetY}); 
                    this._tempWire.show();
                    // Check if a pin is hovered
                    this._tmpDraggingPinTarget = null;
                    for(let i in this._components)
                    {
                        let pin = this._components[i].dragZone({x: e.offsetX, y: e.offsetY});
                        if(pin.type=='pin')
                        {
                            this._tempWire.setPosition(pin.pin.position);
                            this._tmpDraggingPinTarget = pin.pin;
                            break;
                        }
                    }
                    break;
                case "wire_out":
                    this._tempWire.setEnd({x: e.offsetX, y: e.offsetY});
                    this._tempWire.show();
                    // Check if a pin is hovered
                    this._tmpDraggingPinTarget = null;
                    for(let i in this._components)
                    {
                        let pin = this._components[i].dragZone({x: e.offsetX, y: e.offsetY});
                        if(pin.type=='pin')
                        {
                            this._tempWire.setEnd(pin.pin.position);
                            this._tmpDraggingPinTarget = pin.pin;
                            break;
                        }
                    }
                    break;
                case "box_select":
                    this._draggingRect.w = e.clientX - this._draggingRect.x;
                    this._draggingRect.h = e.clientY - this._draggingRect.y;
                    //Check for each component if it is inside the box
                    let bxa = Math.min(this._draggingRect.x, this._draggingRect.x+this._draggingRect.w);
                    let bxb = Math.max(this._draggingRect.x, this._draggingRect.x+this._draggingRect.w);
                    let bya = Math.min(this._draggingRect.y, this._draggingRect.y+this._draggingRect.h);
                    let byb = Math.max(this._draggingRect.y, this._draggingRect.y+this._draggingRect.h);
                    for(let i in this._components)
                    {
                    if(this._components[i].position.x >= bxa && this._components[i].position.x+this._components[i]._size.x <= bxb && this._components[i].position.y >= bya && this._components[i].position.y+this._components[i]._size.y <= byb)
                    {
                        this._components[i]._selected = true;
                            if(!this._selectedComponents.includes(this._components[i]))
                            {
                                this._selectedComponents.push(this._components[i]);
                            }
                        }
                        else
                        {
                            this._components[i]._selected = false;
                            const index = this._selectedComponents.indexOf(this._components[i]);
                            if (index > -1) {
                                this._selectedComponents.splice(index, 1);
                            }
                        }
                    }
                    break;
            }
        }
        else
        {
            switch (this._draggingType) {
                case "added_component":
                    this._draggedComponents[0].position.x = Math.round((e.offsetX - this._draggedComponents[0]._mouseOffset.x)/this._snappingWidth)*this._snappingWidth;
                    this._draggedComponents[0].position.y = Math.round((e.offsetY - this._draggedComponents[0]._mouseOffset.y)/this._snappingWidth)*this._snappingWidth;
                    break;
            
                default:
                    break;
            }
        }
    }

    addComponent(component)
    {
        this._components.push(component);
    }

    removeComponent(component)
    {
        const index = this._components.indexOf(component);
        if (index > -1) {
            let wires = component.prepareToRemove();
            for(let i in wires)
            {
                this._wires.splice(this._wires.indexOf(wires[i]), 1);
            }
            this._components.splice(index, 1);
        }
    }

    setNewlyAdded(component)
    {
        this._draggingType = "added_component";
        this._draggedComponents = [component];
        component._mouseOffset.x = component._size.x/2;
        component._mouseOffset.y = component._size.y/2;
    }

    update()
    {
        if(this._backgroundCanvas.width != this._cvs.width || this._backgroundCanvas.height != this._cvs.height)
        {
            this._backgroundCanvas.width = this._cvs.width;
            this._backgroundCanvas.height = this._cvs.height;
            this._backgroundRedraw = true;
        }
        for(let i in this._components)
        {
            this._components[i].update();
        }
        for(let i in this._wires)
        {
            this._wires[i].update();
        }
        this._tempWire.update();
    }

    draw()
    {
        this._ctx.clearRect(0, 0, this._cvs.width, this._cvs.height);
        
        //Draw the dotted grid
        if(this._backgroundRedraw)
        {
            this._backgroundRedraw = false;
            this._backgroundCtx.fillStyle = "#282828";
            for(let i=0; i<this._backgroundCanvas.width; i+=this._snappingWidth)
            {
                for(let j=0; j<this._backgroundCanvas.height; j+=this._snappingWidth)
                {
                    this._backgroundCtx.fillRect(i-2, j-2, 4, 4);
                }
            }
        }

        this._ctx.drawImage(this._backgroundCanvas, 0, 0);

        for(let i in this._components)
        {
            this._components[i].draw();
        }
        for(let i in this._wires)
        {
            this._wires[i].draw();
        }
        this._tempWire.draw();

        //Draw box selection rectangle
        if(this._draggingType == "box_select")
        {
            this._ctx.beginPath();
            this._ctx.rect(this._draggingRect.x, this._draggingRect.y, this._draggingRect.w, this._draggingRect.h);
            this._ctx.strokeStyle = "orange";
            this._ctx.stroke();
            this._ctx.fillStyle = 'rgba(255, 127, 0, 0.2)';
            this._ctx.fill();
        }
    }

    keyDown(e)
    {
        if(e.key == "Delete")
        {
            for(let i in this._selectedComponents)
            {
                this.removeComponent(this._selectedComponents[i]);
            }
            this._selectedComponents = [];
        }
    }
}