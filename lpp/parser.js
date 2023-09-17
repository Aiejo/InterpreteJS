const { Token, TokenType } = require("./tokens");
const {
  Identifier,
  LetStatement,
  Statement,
  Expression,
  Program,
  ReturnStatements,
  Call,
  ExpressionStatement,
  Function,
  If,
  Infix,
  Integer,
  Prefix,
  Block,
  Boolean,
} = require("./ast");
const Lexer = require("./lexer");

const Precedence = {
  LOWEST: 1,
  EQUALS: 2,
  LESSGREATER: 3,
  SUM: 4,
  PRODUCT: 5,
  PREFIX: 6,
  CALL: 7,
};

const PRECEDENCES = {
  [TokenType.EQ]: Precedence.EQUALS,
  [TokenType.DIF]: Precedence.EQUALS,
  [TokenType.LT]: Precedence.LESSGREATER,
  [TokenType.GT]: Precedence.LESSGREATER,
  [TokenType.PLUS]: Precedence.SUM,
  [TokenType.MINUS]: Precedence.SUM,
  [TokenType.DIVISION]: Precedence.PRODUCT,
  [TokenType.MULTIPLICATION]: Precedence.PRODUCT,
  [TokenType.LPAREN]: Precedence.CALL,
};

class Parser {
  constructor(lexer) {
    this._lexer = lexer;
    this._currentToken = null;
    this._peekToken = null;
    this._errors = [];

    this._prefixParseFns = this._registerPrefixFns();
    this._infixParseFns = this._registerInfixFns();

    this._advanceTokens();
    this._advanceTokens();
  }

  get errors() {
    return this._errors;
  }

  parseProgram() {
    const program = new Program([]);

    while (this._currentToken.tokenType !== TokenType.EOF) {
      const statement = this._parseStatement();
      if (statement !== null) {
        program.statements.push(statement);
      }

      this._advanceTokens();
    }

    return program;
  }

  _advanceTokens() {
    this._currentToken = this._peekToken;
    this._peekToken = this._lexer.siguiente_token();
  }

  _currentPrecedence() {
    try {
      return PRECEDENCES[this._currentToken.tokenType];
    } catch (error) {
      return Precedence.LOWEST;
    }
  }

  _expectedToken(tokenType) {
    if (this._peekToken.tokenType === tokenType) {
      this._advanceTokens();
      return true;
    }

    this._expectedTokenError(tokenType);
    return false;
  }

  _expectedTokenError(tokenType) {
    const error = `Se esperaba que el siguiente token fuera ${tokenType} pero se obtuvo ${this._peekToken.tokenType}`;
    this._errors.push(error);
  }

  _parseBlock() {
    const blockStatement = new Block(this._currentToken, []);

    this._advanceTokens();

    while (
      this._currentToken.tokenType !== TokenType.RBRACE &&
      this._currentToken.tokenType !== TokenType.EOF
    ) {
      const statement = this._parseStatement();

      if (statement !== null) {
        blockStatement.statements.push(statement);
      }

      this._advanceTokens();
    }

    return blockStatement;
  }

  _parseBoolean() {
    return new Boolean(
      this._currentToken,
      this._currentToken.tokenType === TokenType.TRUE
    );
  }

  _parseCall(expression) {
    const call = new Call(this._currentToken, expression);
    call.arguments = this._parseCallArguments();
    return call;
  }

  _parseCallArguments() {
    const args = [];

    if (this._peekToken.tokenType === TokenType.RPAREN) {
      this._advanceTokens();
      return args;
    }

    this._advanceTokens();

    const expression = this._parseExpression(Precedence.LOWEST);
    if (expression !== null) {
      args.push(expression);
    }

    while (this._peekToken.tokenType === TokenType.COMMA) {
      this._advanceTokens();
      this._advanceTokens();

      const expression = this._parseExpression(Precedence.LOWEST);
      if (expression !== null) {
        args.push(expression);
      }
    }

    if (!this._expectedToken(TokenType.RPAREN)) {
      return null;
    }

    return args;
  }

  _parseExpression(precedence) {
    const prefixParseFn = this._prefixParseFns[this._currentToken.tokenType];

    if (prefixParseFn === undefined) {
      const message = `No se encontró ninguna función para analizar ${this._currentToken.literal}`;
      this._errors.push(message);
      return null;
    }

    let leftExpression = prefixParseFn();

    while (
      this._peekToken.tokenType !== TokenType.SEMICOLON &&
      precedence < this._peekPrecedence()
    ) {
      const infixParseFn = this._infixParseFns[this._peekToken.tokenType];

      if (infixParseFn === undefined) {
        return leftExpression;
      }

      this._advanceTokens();
      leftExpression = infixParseFn(leftExpression);
    }

    return leftExpression;
  }

  _parseExpressionStatement() {
    const expressionStatement = new ExpressionStatement(this._currentToken);
    expressionStatement.expression = this._parseExpression(Precedence.LOWEST);

    if (this._peekToken.tokenType === TokenType.SEMICOLON) {
      this._advanceTokens();
    }

    return expressionStatement;
  }

  _parseGroupedExpression() {
    this._advanceTokens();
    const expression = this._parseExpression(Precedence.LOWEST);

    if (!this._expectedToken(TokenType.RPAREN)) {
      return null;
    }

    return expression;
  }

  _parseFunction() {
    const functionLiteral = new Function(this._currentToken);

    if (!this._expectedToken(TokenType.LPAREN)) {
      return null;
    }

    functionLiteral.parameters = this._parseFunctionParameters();

    if (!this._expectedToken(TokenType.LBRACE)) {
      return null;
    }

    functionLiteral.body = this._parseBlock();

    return functionLiteral;
  }

  _parseFunctionParameters() {
    const parameters = [];

    if (this._peekToken.tokenType === TokenType.RPAREN) {
      this._advanceTokens();
      return parameters;
    }

    this._advanceTokens();

    const identifier = new Identifier(
      this._currentToken,
      this._currentToken.literal
    );

    parameters.push(identifier);

    while (this._peekToken.tokenType === TokenType.COMMA) {
      this._advanceTokens();
      this._advanceTokens();

      const identifier = new Identifier(
        this._currentToken,
        this._currentToken.literal
      );

      parameters.push(identifier);
    }

    if (!this._expectedToken(TokenType.RPAREN)) {
      return [];
    }

    return parameters;
  }

  _parseIdentifier() {
    return new Identifier(this._currentToken, this._currentToken.literal);
  }

  _parseIf() {
    const ifExpression = new If(this._currentToken);

    if (!this._expectedToken(TokenType.LPAREN)) {
      return null;
    }

    this._advanceTokens();

    ifExpression.condition = this._parseExpression(Precedence.LOWEST);

    if (!this._expectedToken(TokenType.RPAREN)) {
      return null;
    }

    if (!this._expectedToken(TokenType.LBRACE)) {
      return null;
    }

    ifExpression.consequence = this._parseBlock();

    if (this._peekToken.tokenType === TokenType.ELSE) {
      this._advanceTokens();

      if (!this._expectedToken(TokenType.LBRACE)) {
        return null;
      }

      ifExpression.alternative = this._parseBlock();
    }

    return ifExpression;
  }

  _parseInfixExpression(left) {
    const operator = this._currentToken.literal;
    const precedence = this._currentPrecedence();

    this._advanceTokens();

    const right = this._parseExpression(precedence);

    return new Infix(this._currentToken, left, operator, right);
  }

  _parseInteger() {
    const integerLiteral = new Integer(this._currentToken);

    try {
      integerLiteral.value = parseInt(this._currentToken.literal);
    } catch (error) {
      const message = `No se pudo analizar ${this._currentToken.literal} como entero.`;
      this._errors.push(message);
      return null;
    }

    return integerLiteral;
  }

  _parseLetStatement() {
    const letStatement = new LetStatement(this._currentToken);

    if (!this._expectedToken(TokenType.IDENT)) {
      return null;
    }

    letStatement.name = this._parseIdentifier();

    if (!this._expectedToken(TokenType.ASSIGN)) {
      return null;
    }

    this._advanceTokens();

    letStatement.value = this._parseExpression(Precedence.LOWEST);

    if (this._peekToken.tokenType === TokenType.SEMICOLON) {
      this._advanceTokens();
    }

    return letStatement;
  }

  _parsePrefixExpression() {
    const prefixExpression = new Prefix(
      this._currentToken,
      this._currentToken.literal
    );

    this._advanceTokens();

    prefixExpression.right = this._parseExpression(Precedence.PREFIX);

    return prefixExpression;
  }

  _parseReturnStatement() {
    const returnStatement = new ReturnStatement(this._currentToken);

    this._advanceTokens();

    returnStatement.returnValue = this._parseExpression(Precedence.LOWEST);

    if (this._peekToken.tokenType === TokenType.SEMICOLON) {
      this._advanceTokens();
    }

    return returnStatement;
  }

  _parseStatement() {
    switch (this._currentToken.tokenType) {
      case TokenType.LET:
        return this._parseLetStatement();
      case TokenType.RETURN:
        return this._parseReturnStatement();
      default:
        return this._parseExpressionStatement();
    }
  }

  _peekPrecedence() {
    try {
      return PRECEDENCES[this._peekToken.tokenType];
    } catch (error) {
      return Precedence.LOWEST;
    }
  }

  _registerInfixFns() {
    return {
      [TokenType.PLUS]: (left) => this._parseInfixExpression(left),
      [TokenType.MINUS]: (left) => this._parseInfixExpression(left),
      [TokenType.DIVISION]: (left) => this._parseInfixExpression(left),
      [TokenType.MULTIPLICATION]: (left) => this._parseInfixExpression(left),
      [TokenType.EQ]: (left) => this._parseInfixExpression(left),
      [TokenType.NOT_EQ]: (left) => this._parseInfixExpression(left),
      [TokenType.LT]: (left) => this._parseInfixExpression(left),
      [TokenType.GT]: (left) => this._parseInfixExpression(left),
      [TokenType.LPAREN]: (left) => this._parseCall(left),
    };
  }
  _registerPrefixFns() {
    return {
      [TokenType.FALSE]: () => this._parseBoolean(),
      [TokenType.FUNCTION]: () => this._parseFunction(),
      [TokenType.IDENT]: () => this._parseIdentifier(),
      [TokenType.IF]: () => this._parseIf(),
      [TokenType.INT]: () => this._parseInteger(),
      [TokenType.LPAREN]: () => this._parseGroupedExpression(),
      [TokenType.MINUS]: () => this._parsePrefixExpression(),
      [TokenType.NOT]: () => this._parsePrefixExpression(),
      [TokenType.TRUE]: () => this._parseBoolean(),
    };
  }
}

module.exports = Parser;
