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
const { log } = require("console");

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
    
    if(this._currentToken != null) {
      
      
      while (this._currentToken.tokenType !== TokenType.EOF) {
        console.log(this._currentToken);
        const statement = this._parseStatement();
        if (statement !== null) {
          program.statements.push(statement);
        }

        this._advanceTokens();
      }
    }else{
      throw new Error("El token es nulo");
    }  
    
    return program;
  }

  _advanceTokens() {
    this._currentToken = this._peekToken;
    this._peekToken = this._lexer.siguiente_token();
  }

  _currentPrecedence() {
    if(this._currentToken !== null) {
      try {
        return PRECEDENCES[this._currentToken.tokenType];
      } catch (error) {
        return Precedence.LOWEST;
      }
    }else{
      throw new Error("El token es nulo");
    }
  }

  _expectedToken(tokenType) {
    if(this._peekToken !== null) {
      if (this._peekToken.tokenType === tokenType) {
        this._advanceTokens();
        return true;
      }
      this._expectedTokenError(tokenType);
      return false;

    }else{
      throw new Error("El token es nulo");
    }    
  }

  _expectedTokenError(tokenType) {
    if(this._peekToken !== null) {
      const error = `Se esperaba que el siguiente token fuera ${tokenType} pero se obtuvo ${this._peekToken.tokenType}`;
      this._errors.push(error);
    }else{
      throw new Error("El token es nulo");
    }
  }

  _parseBlock() {
    if(this._currentToken != null){
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
    }else{
      throw new Error("El token es nulo"); 
    }
  }

  _parseBoolean() {
    if(this._currentToken != null){
      return new Boolean(
        this._currentToken,
        this._currentToken.tokenType === TokenType.TRUE
      );
    }else{
      throw new Error("El token es nulo"); 
    }
  }

  _parseCall(expression) {
    if(this._currentToken != null){
      const call = new Call(this._currentToken, expression);
      call.set_arguments(this._parseCallArguments());
      return call;
    }else{
      throw new Error("El token es nulo");
    }
  }

  _parseCallArguments() {
    const args = [];

    if(this._peekToken != null){
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
    }else{
      throw new Error("El token es nulo");
    } 
  }

  _parseExpression(precedence) {
    if (this._currentToken != null) {
      const prefixParseFn = this._prefixParseFns[this._currentToken.tokenType];

      if (prefixParseFn === undefined) {
        const message = `No se encontró ninguna función para analizar ${this._currentToken.literal}`;
        this._errors.push(message);
        return null;
      }

      let leftExpression = prefixParseFn();

      if(this._peekToken != null) {
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
      }else{
        throw new Error("El token es nulo");
      }
    }else{
      throw new Error("El token es nulo");
    }
  }

  _parseExpressionStatement() {
    if(this._currentToken != null) {
      const expressionStatement = new ExpressionStatement(this._currentToken);
      expressionStatement.set_expression(this._parseExpression(Precedence.LOWEST));

      if(this._peekToken =! null){
        if (this._peekToken.tokenType === TokenType.SEMICOLON) {
          this._advanceTokens();
        }
        return expressionStatement;
      }else{
        throw new Error("El token es nulo");
      }    
    }else{
      throw new Error("El token es nulo");
    }    
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
    if(this._currentToken != null) {
      const functionLiteral = new Function(this._currentToken);

      if (!this._expectedToken(TokenType.LPAREN)) {
        return null;
      }

      functionLiteral.parameters = this._parseFunctionParameters();

      if (!this._expectedToken(TokenType.LBRACE)) {
        return null;
      }

      functionLiteral.set_body(this._parseBlock());

      return functionLiteral;
    }else {
      throw new Error("El token es nulo");
    }
  }

  _parseFunctionParameters() {
    const parameters = [];

    if(this._peekToken != null) {
      if (this._peekToken.tokenType === TokenType.RPAREN) {
        this._advanceTokens();
        return parameters;
      }

      this._advanceTokens();
      
      if(this._currentToken != null) {
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
      }else{
        throw new Error("El token es nulo");
      }    
    }else{
      throw new Error("El token es nulo");
    }    
  }

  _parseIdentifier() {
    if (this._currentToken != null) {
      return new Identifier(this._currentToken, this._currentToken.literal);
    }else {
      throw new Error("El token no esxiste"); 
    }
  }
  _parseIf() {

    if(this._currentToken != null){
      const ifExpression = new If(this._currentToken);

      if (!this._expectedToken(TokenType.LPAREN)) {
        return null;
      }

      this._advanceTokens();

      ifExpression.set_condition(this._parseExpression(Precedence.LOWEST));

      if (!this._expectedToken(TokenType.RPAREN)) {
        return null;
      }

      if (!this._expectedToken(TokenType.LBRACE)) {
        return null;
      }

      ifExpression.set_consequence(this._parseBlock());

      if(this._peekToken() != null) {
        if (this._peekToken.tokenType === TokenType.ELSE) {
          this._advanceTokens();

          if (!this._expectedToken(TokenType.LBRACE)) {
            return null;
          }

          ifExpression.set_alternative(this._parseBlock());
        }

        return ifExpression;
      }else{
        throw new Error("El token no existe");
      }
    }else{
      throw new Error("El token no existe");
    }
  }

  _parseInfixExpression(left) {
    if(this._currentToken != null){
      const operator = this._currentToken.literal;
      const precedence = this._currentPrecedence();
      const actual = this._currentToken; 

      this._advanceTokens();

      const right = this._parseExpression(precedence);

      return new Infix(actual, left, operator, right);
    }else{
      throw new Error("El token es nulo");
    }
  }

  _parseInteger() {
    if(this._currentToken != null){
      const integerLiteral = new Integer(this._currentToken);

      try {
        integerLiteral.set_value(parseInt(this._currentToken.literal));
      } catch (error) {
        const message = `No se pudo analizar ${this._currentToken.literal} como entero.`;
        this._errors.push(message);
        return null;
      }

      return integerLiteral;
    }else{
      throw new Error("El toke es nulo");
    }
  }

  _parseLetStatement() {
    if(this._currentToken != null){
      const letStatement = new LetStatement(this._currentToken);

      if (!this._expectedToken(TokenType.IDENT)) {
        return null;
      }

      letStatement.set_name(this._parseIdentifier());

      if (!this._expectedToken(TokenType.ASSIGN)) {
        return null;
      }

      this._advanceTokens();

      letStatement.set_value(this._parseExpression(Precedence.LOWEST));

      if(this._peekToken != null) {
        if (this._peekToken.tokenType === TokenType.SEMICOLON) {
          this._advanceTokens();
        }

        return letStatement;
      }else{
        throw new Error("El token es nulo");
      }
    }else{
      throw new Error("El token es nulo");
    }
  }

  _parsePrefixExpression() {
    if(this._currentToken != null){
      const prefixExpression = new Prefix(
        this._currentToken,
        this._currentToken.literal
      );

      this._advanceTokens();

      prefixExpression.set_right(this._parseExpression(Precedence.PREFIX));

      return prefixExpression;
    }else{
      throw new Error("El token es nulo");
    }
  }

  _parseReturnStatement() {
    if(this._currentToken != null){
      const returnStatement = new ReturnStatements(this._currentToken);

      this._advanceTokens();

      returnStatement.set_returnValue(this._parseExpression(Precedence.LOWEST));

      if(this._peekToken != null) {
        if (this._peekToken.tokenType === TokenType.SEMICOLON) {
          this._advanceTokens();
        }

        return returnStatement;
      }else{
        throw new Error("El token es nulo");
      }
    }else{
      throw new Error("El token es nulo");
    }
  }

  _parseStatement() {
    
    if(this._currentToken != null){
      switch (this._currentToken.tokenType) {
        case TokenType.LET:
          console.log('parseProgram statement let statement');
          return this._parseLetStatement();
        case TokenType.RETURN:
          console.log('parseProgram statement return statement');
          return this._parseReturnStatement();
        default:
          return this._parseExpressionStatement();
      }
    }else{
      throw new Error("El token es nulo");
    }
  }

  _peekPrecedence() {
    if(this._peekToken != null){
      try {
        return PRECEDENCES[this._peekToken.tokenType];
      } catch (error) {
        return Precedence.LOWEST;
      }
    }else{
      throw new Error("El token es nulo");
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
