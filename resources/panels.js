class Panel
{
    constructor(position, size, options={title: "Title", docked: false, parent: document.getElementsByTagName("body")[0], roundness: 10, maximized: false}, content=null, continuousUpdate=true)
    {
        this.position = {x: position.x, y: position.y};
        this.size = {width: size.width, height: size.height};
        this.docked = options.docked;

        this._speed = 0.4;
        this._normalSpeed = 0.4;

        this.parent = options.parent;
        this.content = content;
        this.title = options.title;
        this._continuousUpdate = continuousUpdate;

        this._targetPosition = {x: position.x, y: position.y};
        this._targetSize = {width: size.width, height: size.height};
        this._roundess = 0;
        this._targetRoundness = options.roundness;
        this._maximized = options.maximized;
        this._needPanelUpdate = true;
        this._needContentUpdate = true;

        this._root = document.createElement("div");
        this._root.classList += "_panelRoot";
        this._root.style.position = 'absolute';

        this._titleBar = document.createElement("div");
        this._root.appendChild(this._titleBar);
        this._titleBar.classList += "_panelTitleBar";
        this._titleBar.style.display = 'flex';
        this._titleBar.width = '100%';
        this._titleBarHeight = 20;

        this._close = document.createElement("div");
        this._close.classList += '_panelTitleBarClose';
        this._close.innerHTML = 'x';
        
        this._title = document.createElement("div");
        this._title.innerHTML = this.title;
        this._title.classList += "_panelTitleBarTitle"

        this._titleBar.appendChild(this._title);
        this._titleBar.appendChild(this._close);


        this._resizeLeft = document.createElement("div");
        this._resizeLeft.style.position = 'absolute';
        this._resizeLeft.style.left = '-3px';
        this._resizeLeft.style.width = '6px';
        this._resizeLeft.style.top = '0px'
        this._resizeLeft.style.height = '100%';
        this._resizeLeft.style.cursor = 'e-resize';

        this._resizeRight = document.createElement("div");
        this._resizeRight.style.position = 'absolute';
        this._resizeRight.style.right = '-3px';
        this._resizeRight.style.width = '6px';
        this._resizeRight.style.top = '0px'
        this._resizeRight.style.height = '100%';
        this._resizeRight.style.cursor = 'e-resize';

        this._resizeBottom = document.createElement("div");
        this._resizeBottom.style.position = 'absolute';
        this._resizeBottom.style.bottom = '-3px';
        this._resizeBottom.style.width = '100%';
        this._resizeBottom.style.left = '0px'
        this._resizeBottom.style.height = '6px';
        this._resizeBottom.style.cursor = 's-resize';

        this._root.appendChild(this._resizeLeft);
        this._root.appendChild(this._resizeRight);
        this._root.appendChild(this._resizeBottom);

        this._mouseDownDelta = {x: 0, y: 0};
        this._dragging = false;

        this._resizingInfos = {resizing: false, type: 'left', x: 0, y: 0, width: 0, height: 0}

        this._titleBar.addEventListener("mousedown", (evt) => {
            this._speed = 1;
            this._mouseDownDelta = {x: evt.clientX - this.position.x, y: evt.clientY - this.position.y};
            this._dragging = true;
        })

        this._titleBar.addEventListener("dblclick", (evt) => {
            this.maximize(!this._maximized);
        });

        document.addEventListener("mousemove", (evt) => {
            if(this._dragging && !this._maximized)
            {
                this._targetPosition.x = evt.clientX - this._mouseDownDelta.x;
                this._targetPosition.y = evt.clientY - this._mouseDownDelta.y;
                this._needPanelUpdate = true;
            }
            if(this._resizingInfos.resizing)
            {
                switch (this._resizingInfos.type) {
                    case 'left':
                        this._targetSize.width = Math.max(this._resizingInfos.width - (evt.clientX - this._resizingInfos.x), 200);
                        this._targetPosition.x = Math.min(evt.clientX, this._resizingInfos.x + (this._resizingInfos.width-200));
                        this._needPanelUpdate = true;
                        this._needContentUpdate = true;
                        break;
                    case 'right':
                        this._targetSize.width = Math.max(evt.clientX - this.position.x, 200);
                        this._needPanelUpdate = true;
                        this._needContentUpdate = true;
                        break;
                    case 'bottom':
                        this._targetSize.height = Math.max(evt.clientY - this.position.y, 200);
                        this._needPanelUpdate = true;
                        this._needContentUpdate = true;
                        break;
                
                    default:
                        break;
                }
            }
        })

        document.addEventListener("mouseup", (evt) => {
            this._speed = this._normalSpeed;
            if(this._dragging)
            {
                this._dragging = false;
            }
            if(this._resizingInfos.resizing)
            {
                this._resizingInfos.resizing = false;
            }
        })

        this._resizeRight.addEventListener("mousedown", (evt) => {
            this._speed = 1;
            this._resizingInfos.resizing = true;
            this._resizingInfos.type = 'right';
        })
        
        this._resizeLeft.addEventListener("mousedown", (evt) => {
            this._speed = 1;
            this._resizingInfos.resizing = true;
            this._resizingInfos.type = 'left';
            this._resizingInfos.x = this.position.x;
            this._resizingInfos.y = this.position.y;
            this._resizingInfos.width = this.size.width;
        })
        
        this._resizeBottom.addEventListener("mousedown", (evt) => {
            this._speed = 1;
            this._resizingInfos.resizing = true;
            this._resizingInfos.type = 'bottom';
        })
        
        this._content = document.createElement("div");
        this._root.appendChild(this._content);
        this._content.classList += "_panelContent";
        this._content.width = '100%';

        if(!!this.content)
        {
            this._content.appendChild(this.content.getDOM());
            this.content.setParent(this._root);
        }

        this.parent.appendChild(this._root);

        this.update();
    }

    translate(location)
    {
        this._targetPositon = location;
        this._needPanelUpdate;
    }

    resize(size)
    {
        this._targetSize = size;
        this._needPanelUpdate = true;
        this._needContentUpdate = true;
    }

    setRoundness(roundess)
    {
        this._targetRoundness = roundess;
        this._needPanelUpdate = true;
    }

    maximize(maximize)
    {
        if(maximize)
        {
            this._maximized = true;
            this._needPanelUpdate = true;
            this._needContentUpdate = true;
        }
        else
        {
            this._maximized = false;
            this._needPanelUpdate = true;
            this._needContentUpdate = true;
        }
    }

    update(deltaSeconds)
    {
        if(this._needPanelUpdate)
        {
            if(this._maximized)
            {
                let width = parseFloat(getComputedStyle(this.parent, null).width.replace("px", ""));
                let height = parseFloat(getComputedStyle(this.parent, null).height.replace("px", ""));
                let rootWidth = parseFloat(getComputedStyle(this._root, null).width.replace("px", ""));
                let rootHeight = parseFloat(getComputedStyle(this._root, null).height.replace("px", ""));
                let rootTop = parseFloat(getComputedStyle(this._root, null).top.replace("px", ""));
                let rootLeft = parseFloat(getComputedStyle(this._root, null).left.replace("px", ""));
                this._root.style.width = lerp(rootWidth, width-2, this._speed)+'px';
                this._root.style.height = lerp(rootHeight, height-2.5, this._speed)+'px';
                this._root.style.top = lerp(rootTop, 0.0, this._speed)+'px';
                this._root.style.left = lerp(rootLeft, 0.0, this._speed)+'px';
                this.position.x = 0;
                this.position.y = 0;
                this.size.width = lerp(this.size.width, width, this._speed);
                this.size.height = lerp(this.size.height, height, this._speed);
                this._roundess = 0;
                this._titleBar.style.height = lerp(parseFloat(this._titleBar.style.width.replace("px", "")), this._titleBarHeight, this._speed) + 'px';
                this._content.style.height = lerp(parseFloat(this._content.style.height.replace("px", "")), (height - this._titleBarHeight - 2*2), this._speed) + 'px';
                
                this._content.style.borderRadius = '0 0 0 0';
                this._titleBar.style.borderRadius = '0 0 0 0';
                this._root.style.borderRadius = '0 0 0 0';
                this._close.style.borderRadius = '0 0 0 0'
                this._needContentUpdate = true;
                if((Math.abs(rootWidth-width+2)<=0.5) && (Math.abs(rootHeight-height+2.5)<=0.5) && (Math.abs(this.position.x)<=0.5)  && (Math.abs(this.position.y)<=0.5))
                {
                    this._needPanelUpdate = false;
                }
            }
            else
            {
                let deltaPosition = {x: this._targetPosition.x - this.position.x, y: this._targetPosition.y - this.position.y};
                let deltaSize = {width: this._targetSize.width-this.size.width, height: this._targetSize.height - this.size.height};
                let deltaRoundness = this._roundess - this._targetRoundness;
                if((Math.abs(deltaPosition.x+deltaPosition.y)<=0.1) && (Math.abs(deltaSize.width+deltaSize.height)<=0.1) && (Math.abs(deltaRoundness)<=0.02))
                {
                    this._needPanelUpdate = false;
                }
                else
                {
                    this.position.x = lerp(this.position.x, this._targetPosition.x, this._speed);
                    this.position.y = lerp(this.position.y, this._targetPosition.y, this._speed);
                    this.size.width = lerp(this.size.width, this._targetSize.width, this._speed);
                    this.size.height = lerp(this.size.height, this._targetSize.height, this._speed);
                    this._roundess = lerp(this._roundess, this._targetRoundness, this._speed);

                    this._root.style.left = this.position.x + 'px';
                    this._root.style.top = this.position.y + 'px';
                    this._root.style.width = this.size.width + 'px';
                    this._root.style.height = this.size.height + 'px';
                    this._titleBar.style.height = this._titleBarHeight + 'px';
                    this._content.style.height = (this.size.height - this._titleBarHeight) + 'px';

                    this._content.style.borderRadius = '0 0 ' + this._roundess + 'px ' + this._roundess + 'px';
                    this._titleBar.style.borderRadius = this._roundess + 'px ' + this._roundess + 'px' + ' 0 0';
                    this._root.style.borderRadius = this._roundess + 'px ' + this._roundess + 'px ' + this._roundess + 'px ' + this._roundess + 'px ';
                    this._close.style.borderRadius = '0 ' + this._roundess + 'px 0 0';
                }
            }
        }

        if(this._needContentUpdate)
        {
            if(!!this.content)
            {
                if(!this._maximized)
                {
                    let deltaSize = {width: this._targetSize.width-this.size.width, height: this._targetSize.height - this.size.height};
                    if(Math.abs(deltaSize.width)<=0.1 && Math.abs(deltaSize.height)<=0.1)
                    {
                        this._needContentUpdate = false;
                    }
                    this.content.update();
                }
                else
                {
                    this.content.update();
                    this._needContentUpdate = false;
                }
            }
            else
            {
                this._needContentUpdate = false;
            }
        }
        if(!this.continuousUpdate && this._continuousUpdate)
        {
            if(!!this.content)
            {
                this.content.update();
            }
        }
    }
}

function lerp(a, b, h)
{
    return h*(b-a)+a;
}

function getWidth(elem)
{
    return parseFloat(getComputedStyle(elem, null).width.replace("px", ""))
}

function getHeight(elem)
{
    return parseFloat(getComputedStyle(elem, null).height.replace("px", ""))
}