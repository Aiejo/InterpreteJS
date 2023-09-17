const TokenType = {
  ASSIGN: "ASSIGN",
  COMMA: "COMMA",
  DIF: "DIF",
  DIVISION: "DIVISION",
  DOT: "DOT",
  ELSE: "ELSE",
  ELSEIF: "ELSEIF",
  EQ: "EQ",
  EOF: "EOF",
  FALSE: "FALSE",
  FLOAT: "FLOAT",
  FOR: "FOR",
  FUNCTION: "FUNCTION",
  GT: "GT",
  GTE: "GTE",
  IDENTIFIER: "IDENTIFIER",
  IF: "IF",
  ILLEGAL: "ILLEGAL",
  INTEGER: "INTEGER",
  LBRACE: "LBRACE",
  LET: "LET",
  LKEY: "LKEY",
  LPAREN: "LPAREN",
  LT: "LT",
  LTE: "LTE",
  MINUS: "MINUS",
  MULTIPLICATION: "MULTIPLICATION",
  NEGATION: "NEGATION",
  PLUS: "PLUS",
  RBRACE: "RBRACE",
  RKEY: "RKEY",
  RPAREN: "RPAREN",
  RETURN: "RETURN",
  SEMICOLON: "SEMICOLON",
  VAR: "VAR",
  TRUE: "TRUE",
};

class Token {
  constructor(token_type, literal) {
    this.token_type = token_type;
    this.literal = literal;
  }

  toString() {
    return `Type: ${this.token_type}, literal: ${this.literal}`;
  }

  get_literal() {
    return this.literal;
  }
}

function revisar_tipo_de_token(literal) {
  const keywords = {
    func: TokenType.FUNCTION,
    var: TokenType.VAR,
    si: TokenType.IF,
    sino: TokenType.ELSE,
    sinosi: TokenType.ELSEIF,
    verdadero: TokenType.TRUE,
    falso: TokenType.FALSE,
    var: TokenType.VAR,
    para: TokenType.FOR,
    regresa: TokenType.RETURN,
  };
  return keywords[literal] || TokenType.IDENTIFIER;
}

module.exports = {
  TokenType,
  Token,
  revisar_tipo_de_token,
};
