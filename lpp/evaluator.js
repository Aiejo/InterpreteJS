//Faltan las impoertaciones 
const ast = require('./ast');
const {Boolean, Environment, Error, Integer, Null, OBject,OBjectType, Return, Function, String} = require('./objects');

const TRUE = Boolean(true);
const FALSE = Boolean(false);
const NULL = Null();

//De esto no estoy seguro
const NOT_A_FUNCTION = 'No es una función: {}';
const TYPE_MISMATCH = 'Discrepancia de tipos: {} {} {}';
const UNKNOWN_PREFIX_OPERATOR = 'Operador desconocido: {}{}';
const UNKNOWN_INFIX_OPERATOR = 'Operador desconocido: {} {} {}';
const UNKNOWN_IDENTIFIER = 'Identificador no encontrado: {}';

function evaluate(node, env){
    const node_type = type(node);

    if (node_type == ast.Program) {
        node = 

    }
}