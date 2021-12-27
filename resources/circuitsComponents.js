class Lamp extends Dipole
{
    constructor(pos)
    {
        super(pos);
        this.color = [1, 1, 0];
        this.intensity = 3;
        // Reduce the size to match the lamp
        this._size.x = this._size.y = 100;
        this._supWiresLen = 20;
    }
    draw()
    {
        super.draw();
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y+this._size.y/2);
        ctx.lineTo(this.position.x + this._supWiresLen, this.position.y+this._size.y/2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.position.x + this._size.x-this._supWiresLen, this.position.y+this._size.y/2);
        ctx.lineTo(this.position.x + this._size.x, this.position.y+this._size.y/2);
        ctx.stroke();

        let x = this.position.x + this._size.x/2;
        let y = this.position.y + this._size.y/2;
        ctx.beginPath();
        var rad = (this._size.x - 2*this._supWiresLen)/2;
        ctx.arc(x, y, rad, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(' + this.color[0]*255*this.intensity + ',' + this.color[1]*255*this.intensity + ',' + this.color[2]*255*this.intensity + ',' + this.intensity+ ')';
        ctx.shadowColor = 'yellow';
        ctx.shadowBlur = 40*Math.min(Math.max(0, (this.intensity-1)/5), 1);
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.stroke();
        rad /= 1.41421356237;
        // Draw a cross sideway across the circle
        ctx.beginPath();
        ctx.moveTo(x-rad, y-rad);
        ctx.lineTo(x+rad, y+rad);
        ctx.moveTo(x-rad, y+rad);
        ctx.lineTo(x+rad, y-rad);
        ctx.stroke();
    }
}

class Capacitor extends Dipole
{
    constructor(pos)
    {
        super(pos);
        this.color = 'blue';
        this.charge = 0;
        this.chargeRate = 0;
        this.chargeCapacity = 1;
        this.chargeCapacityRate = 0;
        // Reduce the size to match the capacitor
        this._size.x = 100;
        this._size.y = 100;
        this._lineThickness = 2;
        this._capacitorSpace = 20;
    }
    draw()
    {
        super.draw();
        //Draw the capacitor
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y+this._size.y/2);
        ctx.lineTo(this.position.x + (this._size.x-this._capacitorSpace)/2, this.position.y+this._size.y/2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.position.x + this._size.x/2+this._capacitorSpace/2, this.position.y+this._size.y/2);
        ctx.lineTo(this.position.x + this._size.x, this.position.y+this._size.y/2);
        ctx.stroke();
        ctx.fillRect(this.position.x + (this._size.x-this._capacitorSpace)/2, this.position.y, this._lineThickness, this._size.y);
        ctx.fillRect(this.position.x + this._size.x/2+this._capacitorSpace/2-this._lineThickness, this.position.y, this._lineThickness, this._size.y);
    }
}

class Coil extends Dipole
{
    constructor(pos)
    {
        super(pos);
        this.color = 'green';
        // Reduce the size to match the capacitor
        this._size.x = 200;
        this._size.y = 100;
        this._nbrSpires = 5;
        this._coilWidth = this._size.x-40;
        this._spiresRadius = this._size.y*0.3;
    }
    draw()
    {
        super.draw();
        //Draw the bobine
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y+this._size.y/2);
        ctx.lineTo(this.position.x + (this._size.x-this._coilWidth)/2, this.position.y+this._size.y/2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.position.x + this._size.x/2+this._coilWidth/2, this.position.y+this._size.y/2);
        ctx.lineTo(this.position.x + this._size.x, this.position.y+this._size.y/2);
        ctx.stroke();
        ctx.beginPath();
        //Draw a spiral
        let angle = 0;
        let minX = this.position.x + (this._size.x-this._coilWidth)/2 + this._spiresRadius/(this._nbrSpires*0.8);
        let maxX = this.position.x + (this._size.x+this._coilWidth)/2 - this._spiresRadius/(this._nbrSpires*0.8);
        let x = minX;
        ctx.moveTo(minX - this._spiresRadius/(this._nbrSpires*0.8), this.position.y+this._size.y/2);
        for(let i = 0; i <= 1.0; i+=0.001)
        {
            angle = i * (2 * Math.PI * this._nbrSpires) + i*(Math.PI) +Math.PI;
            //Lerp between minX and maxX
            x = minX + i*(maxX-minX);
            ctx.lineTo(x + this._spiresRadius/(this._nbrSpires*0.8)*Math.cos(angle), this.position.y+this._size.y/2+this._spiresRadius*Math.sin(angle));
        }
        ctx.stroke();
    }
}

class Resistor extends Dipole
{
    constructor(pos)
    {
        super(pos);
        this.color = 'red';
        // Reduce the size to match the capacitor
        this._size.x = 100;
        this._size.y = 100;
        this._thickness = 20;
        this._lineThickness = 2;
        this._supWiresLen = 20;
        this._resistance = 0.00003456;
    }

    getResistance()
    {
        if(this._resistance>=1000000)
        {
            return (this._resistance/1000000).toFixed(1) + "MΩ";
        }
        else if(this._resistance>=1000)
        {
            return (this._resistance/1000).toFixed(1) + "KΩ";
        }
        else if(this._resistance>=1)
        {
            return this._resistance.toFixed(1) + "Ω";
        }
        else if(this._resistance>=0.001)
        {
            return (this._resistance*1000).toFixed(1) + "mΩ";
        }
        else if(this._resistance>=0.000001)
        {
            return (this._resistance*1000000).toFixed(1) + "μΩ";
        }
    }

    draw()
    {
        super.draw();
        //Draw the resistor
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y+this._size.y/2);
        ctx.lineTo(this.position.x + this._supWiresLen, this.position.y+this._size.y/2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.position.x + this._size.x-this._supWiresLen, this.position.y+this._size.y/2);
        ctx.lineTo(this.position.x + this._size.x, this.position.y+this._size.y/2);
        ctx.stroke();
        ctx.rect(this.position.x + this._supWiresLen, this.position.y+this._size.y/2-this._thickness/2, this._size.x - 2 * this._supWiresLen, this._thickness);
        ctx.stroke();
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.getResistance(), this.position.x+this._size.x/2, this.position.y+this._size.y/2);
    }
}

class Generator extends Dipole
{
    constructor(pos)
    {
        super(pos);
        this.color = 'blue';
        this._supWiresLen = 20;
        this._size.x = this._size.y = 100;
    }
    
    draw()
    {
        super.draw();
        //Draw the generator
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y+this._size.y/2);
        ctx.lineTo(this.position.x + this._supWiresLen, this.position.y+this._size.y/2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.position.x + this._size.x-this._supWiresLen, this.position.y+this._size.y/2);
        ctx.lineTo(this.position.x + this._size.x, this.position.y+this._size.y/2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.position.x + this._size.x/2, this.position.y+this._size.y/2, this._size.x/2-this._supWiresLen, 0, 2*Math.PI);
        ctx.stroke();
        ctx.fill();
    }
}

class GBF extends Generator
{
    constructor(pos)
    {
        super(pos)
    }

    draw()
    {
        super.draw();
        //Draw the sinewave
        ctx.strokeStyle = 'black';
        const width = this._size.x - 2 * this._supWiresLen;
        const fac = 0.15;
        ctx.beginPath();
        ctx.moveTo(this.position.x + this._supWiresLen + width*fac, this.position.y+this._size.y/2);
        ctx.bezierCurveTo(this.position.x + this._supWiresLen + width*0.5, this.position.y+this._size.y/2 + width*0.5, this.position.x + this._supWiresLen + width*0.5, this.position.y+this._size.y/2 - width*0.5, this.position.x + this._supWiresLen + width*(1-fac), this.position.y+this._size.y/2);
        ctx.stroke();
    }
}

class IdealVoltageSupply extends Generator
{
    constructor(pos)
    {
        super(pos);
    }

    draw()
    {
        super.draw();
        ctx.beginPath();
        ctx.moveTo(this.position.x + this._supWiresLen, this.position.y+this._size.y/2);
        ctx.lineTo(this.position.x + this._size.x-this._supWiresLen, this.position.y+this._size.y/2);
        ctx.stroke();
    }
}

class IdealCurrentSupply extends Generator
{
    constructor(pos)
    {
        super(pos);
    }

    draw()
    {
        super.draw();
        ctx.beginPath();
        ctx.moveTo(this.position.x + this._size.x/2, this.position.y+this._supWiresLen);
        ctx.lineTo(this.position.x + this._size.x/2, this.position.y+this._size.y-this._supWiresLen);
        ctx.stroke();
    }
}