//Falta revisar la parte de las importaciones
const { ABC, abstractmethod } = require("abc");
const { auto, Enum } = require("enum");
const { Dict, List, Optional } = require("typing");
const { Block, Identifier } = require("lpp/ast");

const ObjectType = {
    BOOLEAN: "BOOLEAN",
    ERROR: "ERROR",
    INTEGER: "INTEGER",
    NULL: "NULL",
    FLOAT: "FLOAT",
    RETURN: "RETURN",
    FUNCTION: "FUNCTION",
    STRING: "STRING",
};

class Object{
    type(){
        throw new Error("Subclasses must implement the 'type' method.");
    }
    inspect() {
        throw new Error("Subclasses must implement the 'inspect' method.");

    }
}

class Integer extends Object{
    constructor(value) {
        super();
        this.value = value;
    }

    type() {
        return ObjectType.INTEGER;
    }
    inspect() {
        return String(this.value);
    }
}

class Boolean extends Object{
    constructor(value) {
        super();
        this.value = value;
    }

    type() {
        return ObjectType.BOOLEAN;
    }
    inspect() {
        this.value ? "verdadero": "falso";
    }        
}

class Null extends Object{
    
    type() {
        return ObjectType.NULL;
    }
    inspect() {
        return "nulo";
    }
}

class Return extends Object{
    constructor(value) {
        super();
        this.value = value;
    }

    type() {
        return ObjectType.RETURN;
    }
    inspect() {
        return this.value.inspect();
    }
}

class Error extends Object{
    constructor(message) {
        super();
        this.message = message;
    }

    type() {
        return ObjectType.ERROR;
    }
    inspect() {
        return "Error: " + this.message;
    }
}

class Environment extends Dict{
    constructor(outer= null) {
        super();
        this.outer = outer;
        this.store = {};
    }

    getitem(key) {
        try{
            return this.store[key];
        }catch(e){
            if (this.outer != null){
                return this.outer[key];
            }
        throw e;
        }
    }

    setitem(key, value) {
        this.store[key] = value;
    }

    delitem(key) {
        delete this.store[key];
    }
}

class Function extends Object{
    constructor(parameters, body, env){
        super();
        this.parameters = parameters;
        this.body = body;
        this.env = env;
    }
    type(){
        return ObjectType.FUNCTION;
    }
    inspect(){
        const params = this.parameters.map((param) => param.toString()).join(", ");
        return "procedimiento(" + params + ") {\n" + this.body + "\n}";
    }
}

class String extends Object{
    constructor(value){
        super();
        this.value = value;
    }

    type(){
        return ObjectType.STRING;
    }

    inspect(){
        return this.value;
    }
}