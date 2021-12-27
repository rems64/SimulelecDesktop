function parseNumber(source, startIndex)
{
    var number = '';
    let offset = 0;
    let char;
    for(let i=startIndex; i<source.length; i++)
    {
        char = source[i];
        if(isNaN(char) && char!='.')
        {
            break;
        }
        number+=char;
        offset++;
    }
    return {offset: offset, number: number}
}

function parseText(source, startIndex)
{
    let decodedText = '';
    let offset = 0;
    let char;
    let op = false;
    let func = false;
    let text = !!source[startIndex].match('[a-zA-Z]');
    for(let i=startIndex; i<source.length; i++)
    {
        char = source[i];
        if(char==' ')
        {
            continue;
        }
        if((!char.match('[a-zA-Z]') && text) || (!isNaN(char) || isOperator(decodedText)))
        {
            break;
        }
        decodedText+=char;
        offset++;
    }
    if(isOperator(decodedText)) {op = true;}
    else if(commonFunctions[decodedText]!=undefined) {func = true;};
    return {offset: offset, text: decodedText, operator: op, func: func}
}

function isOperator(elem)
{
    const operators = ["+", "-", "*", "/", "^"];
    return operators.includes(elem, 0);
}

/*
Types:
0: number
1: operator
2: left parenthesis
3: right parenthesis
4: function
5: variable
*/

function tokenify(source)
{
    var tokens = [];
    var variables = []; 
    let char;
    let finished = false;
    let i = 0;
    while(!finished)
    {
        if(i>=source.length)
        {
            finished = true;
            break;
        }
        char = source[i];
        if(char==' ')
        {
            i++;
            continue;
        } 
        else if(!isNaN(char))
        {
            let result = parseNumber(source, i);
            i+=result.offset;
            tokens.push({type: 0, value: result.number})
        }
        else if(char!='(' && char!=')')
        {
            let result = parseText(source, i);
            if(result.operator)
            {
                tokens.push({type: 1, value: result.text});
                i+=result.offset;
            }
            else if(result.func)
            {
                tokens.push({type: 4, value: result.text})
                i+=result.offset;
            }
            else
            {
                tokens.push({type: 5, value: result.text});
                if(!variables.includes(char))
                {
                    variables.push(result.text);
                }
                i+=result.offset;
            }
        }
        else if(char=='(')
        {
            tokens.push({type: 2, value: char});
            i++;
        }
        else if(char==')')
        {
            tokens.push({type: 3, value: char});
            i++;
        }
        else
        {
            i++;
        }
    }
    return {tokens: tokens, variables: variables};
}

function operatorStrength(operator)
{
    switch (operator) {
        case '^':
            return 4;
        case '*':
            return 3;
        case '/':
            return 3;
        case '+':
            return 2;
        case '-':
            return 2;
        default:
            return 1;
    }
}

function operatorAssociativity(operator)
{
    switch (operator) {
        case '^':
            return 1; // Right associative
        case '*':
            return 0; // Left associative
        case '/':
            return 0; // Left associative
        case '+':
            return 0; // Left associative
        case '-':
            return 0; // Left associative
        default:
            return 0; // Left associative
    }
}

var commonFunctions = 
{
    'sin': (x) => {return Math.sin(x)},
    'cos': (x) => {return Math.cos(x)},
    'tan': (x) => {return Math.tan(x)},
    'exp': (x) => {return Math.exp(x)}
}

function stackify(tokens)
{
    let token;
    let outputQueue = [];
    let operatorsStack = [];
    for(let i in tokens)
    {
        token = tokens[i];
        if(token.type==0 || token.type==5) // Number or variable
        {
            outputQueue.push(token);
        }
        else if(token.type==4) // Function
        {
            operatorsStack.push(token);
        }
        else if(token.type==1) // Operator
        {
            while(operatorsStack.length>0)
            {
                if(operatorsStack.at(-1).value=='(' || operatorStrength(operatorsStack.at(-1).value)<operatorStrength(token.value) || ((operatorStrength(operatorsStack.at(-1).value)==operatorStrength(token.value)) && operatorAssociativity(token.value)!=0))
                {
                    break;
                }
                outputQueue.push(operatorsStack.at(-1));
                operatorsStack.pop();
            }
            operatorsStack.push(token);
        }
        else if(token.type==2) // Left parenthesis (
        {
            operatorsStack.push(token)
        }
        else if(token.type==3) // Right parenthesis )
        {
            while(operatorsStack.at(-1).type!=2)
            {
                if(operatorsStack.length<=0)
                {
                    console.log("Error, mismatching parenthesis!");
                    return null;
                }
                outputQueue.push(operatorsStack.at(-1));
                operatorsStack.pop();
            }
            operatorsStack.pop();
            if(operatorsStack.at(-1).type==4)
            {
                outputQueue.push(operatorsStack.at(-1));
                operatorsStack.pop();
            }
        }
    }
    var tmp = [...operatorsStack]
    while(operatorsStack.length>0)
    {
        outputQueue.push(operatorsStack.pop());
    }
    return outputQueue;
}

function evaluateStackified(stackified, variables=[])
{
    temp = [...stackified];
    var stack = [];
    let elem;
    while(temp.length>0)
    {
        elem = temp[0];
        if(elem.type==0)
        {
            stack.push(elem.value);
        }
        else if(elem.type==5)
        {
            stack.push(variables[elem.value]);
        }
        else if(elem.type==1)
        {
            if(stack.length<2) {
                console.log("ERROR PLEASE INVESTIGATE"); return;
            };
            let a = parseFloat(stack.at(-2));
            let b = parseFloat(stack.at(-1));
            let c;
            switch (elem.value) {
                case '+':
                    c = a+b;
                    break;
                case '-':
                    c = a-b;
                    break;
                case '*':
                    c = a*b;
                    break;
                case '/':
                    c = a/b;
                    break;
                case '^':
                    c = Math.pow(a, b);
                    break;
                default:
                    console.log("Unknown operator " + elem.value);
                    break;
            }
            stack.pop();
            stack.pop();
            stack.push(c);
        }
        else if(elem.type==4) // Function
        {
            let func = commonFunctions[elem.value];
            if(!func)
            {
                console.log("Unknown function " + elem.value);
                return null;
            }
            let a = func(stack.at(-1));
            stack.pop();
            stack.push(a);
        }
        temp.shift()
    }
    return stack[0];
}