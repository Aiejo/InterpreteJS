const TokenType = {
    ASSIGN: 'ASSIGN',
    COMMA: 'COMMA',
    DIF: 'DIF',
    EOF: 'EOF',
    EQ: 'EQ',
    FUNCTION: 'FUNCTION',
    IDENTIFIER: 'IDENTIFIER',
    IF: 'IF',
    ELSE:'ELSE',
    GT: 'GT',
    GTE: 'GTE',
    LT: 'LT',
    LTE: 'LTE',
    ILLEGAL: 'ILLEGAL',
    INTEGER: 'INTEGER',
    LBRACE: 'LBRACE',
    RBRACE: 'RBRACE',
    LPAREN: 'LPAREN', 
    RPAREN: 'RPAREN',
    LKEY: 'LKEY',
    RKEY: 'RKEY',
    VAR: 'VAR',
    MINUS: 'MINUS',
    PLUS: 'PLUS',
    NEGATION: 'NEGATION',
    SEMICOLON: 'SEMICOLON',
    DOT: 'DOT',
    MULTIPLY: 'MULTIPLY',
    DIVISION: 'DIVISION',
    TRUE: 'TRUE',
    FALSE: 'FALSE',
    FLOAT: 'FLOAT'
};

class Token{
    constructor(token_type, literal){
        this.token_type = token_type;
        this.literal = literal;
    }

    toString(){
        return `Type: ${this.token_type}, literal: ${this.literal}`;
    }

    get_literal(){
        return this.literal;
    }
}

function revisar_tipo_de_token(literal){
    const keywords = {
        'func': TokenType.FUNCTION,
        'var':TokenType.VAR,
        'si': TokenType.IF,
        'sino': TokenType.ELSE,
        'verdadero': TokenType.TRUE,
        'falso': TokenType.FALSE,
        'var': TokenType.VAR        
    };
    return keywords[literal] || TokenType.IDENTIFIER;
}

module.exports = {
    TokenType,
    Token,
    revisar_tipo_de_token    
}
