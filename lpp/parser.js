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
const { log, Console } = require("console");

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
  [TokenType.GTE]: Precedence.LESSGREATER,
  [TokenType.LTE]: Precedence.LESSGREATER,
  [TokenType.PLUS]: Precedence.SUM,
  [TokenType.MINUS]: Precedence.SUM,
  [TokenType.DIVISION]: Precedence.PRODUCT,
  [TokenType.MULTIPLICATION]: Precedence.PRODUCT,
  [TokenType.LPAREN]: Precedence.CALL,
};

class Parser {
  constructor(lexer) {
    
    this._lexer = lexer;
    this._currentToken = new Token(null,null);    
    this._peekToken = new Token(null,null);
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
    
    if(this._currentToken !== null) {
      console.log("ParseProgram");      
      
      while (this._currentToken.token_type !== TokenType.EOF) {
        //console.log("miau",this._currentToken);
        //console.log("miau",this._peekToken);
        const statement = this._parseStatement();
        
        //console.log(statement);
        //prompt("nao manito")
        if (statement !== null) {
          program.statements.push(statement);
        }
        
        //console.log(this._peekToken); 
        //console.log("miau",this._currentToken);
        //console.log("miau",this._peekToken);               
        this._advanceTokens();
        console.log(this._currentToken)        
      }
    }else{
      throw new Error("El token es nulo");
    }  
    console.log("Se acabó");
    return program;
  }

  _advanceTokens() {
    console.log("Avanza");
    //console.log(this._peekToken);
    //console.log(this._currentToken);
    this._currentToken = this._peekToken;
    this._peekToken = this._lexer.siguiente_token();
  }

  _currentPrecedence() {
    if(this._currentToken !== null) {
      try {
        return PRECEDENCES[this._currentToken.token_type];
      } catch (error) {
        return Precedence.LOWEST;
      }
    }else{
      throw new Error("El token es nulo");
    }
  }

  _expectedToken(tokenType) {
    if(this._peekToken !== null) {
      if (this._peekToken.token_type === tokenType) {
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
      const error = `Se esperaba que el siguiente token fuera ${tokenType} pero se obtuvo ${this._peekToken.token_type}`;
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
        this._currentToken.token_type !== TokenType.RBRACE &&
        this._currentToken.token_type !== TokenType.EOF
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
    if(this._currentToken !== null){
      return new Boolean(
        this._currentToken,
        this._currentToken.token_type === TokenType.TRUE
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

    if(this._peekToken !== null){
      if (this._peekToken.token_type === TokenType.RPAREN) {
        this._advanceTokens();
        return args;
      }

      this._advanceTokens();

      const expression = this._parseExpression(Precedence.LOWEST);
      if (expression !== null) {
        args.push(expression);
      }

      while (this._peekToken.token_type === TokenType.COMMA) {
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
    console.log("parseExpression");
       
    if (this._currentToken !== null) {  
      console.log(this._currentToken)
      console.log(this._currentToken.token_type);
      const prefixParseFn = this._prefixParseFns[this._currentToken.token_type];
      console.log("pupupu",prefixParseFn);
      //prompt("prefixParseFn");
      if (prefixParseFn === undefined) {
        const message = `No se encontró ninguna función para analizar ${this._currentToken.literal}`;
        this._errors.push(message);
        return null;
      }

      let leftExpression = prefixParseFn();
      //console.log(leftExpression)  
      console.log(precedence) 
      console.log(this._peekPrecedence())        
      //prompt("nao manito")
      if(this._peekToken !== null) {        
        while (this._peekToken.token_type !== TokenType.SEMICOLON && precedence < this._peekPrecedence()) {
          try {
            let infixParseFn = this._infixParseFns[this._peekToken.token_Type];
            this._advanceTokens();
            
            if(leftExpression !== null){
              leftExpression = infixParseFn(leftExpression);
            }
          }catch(error){
            console.log("Revisar acá que no sé que pasa")
          }
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
    //console.log(this._currentToken)
    if(this._currentToken !== null) {      
      const expressionStatement = new ExpressionStatement(this._currentToken);
      expressionStatement.set_expression(this._parseExpression(Precedence.LOWEST));
      
      console.log("pasó =)")
      //console.log(this._peekToken.token_type)      

      if(this._peekToken !== null){
        
        if (this._peekToken.token_type === TokenType.SEMICOLON) {
          this._advanceTokens();
        }
        //console.log(expressionStatement);
        //prompt("nao manito")
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
    if(this._currentToken !== null) {
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

    if(this._peekToken !== null) {
      if (this._peekToken.token_type === TokenType.RPAREN) {
        this._advanceTokens();
        return parameters;
      }

      this._advanceTokens();
      
      if(this._currentToken !== null) {
        const identifier = new Identifier(
          this._currentToken,
          this._currentToken.literal
        );
    
        parameters.push(identifier);
    
        while (this._peekToken.token_type === TokenType.COMMA) {
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
    if (this._currentToken !== null) {
      return new Identifier(this._currentToken, this._currentToken.literal);
    }else {
      throw new Error("El token no esxiste"); 
    }
  }
  _parseIf() {

    if(this._currentToken !== null){
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

      if(this._peekToken() !== null) {
        if (this._peekToken.token_type === TokenType.ELSE) {
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
    if(this._currentToken !== null){
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
    console.log("_parseInteger");    
    if(this._currentToken !== null){
      const integerLiteral = new Integer(this._currentToken);
      //console.log(integerLiteral);
      try {
        //console.log(this._currentToken.literal);
        integerLiteral.set_value(parseInt(this._currentToken.literal));
        //console.log(integerLiteral.value)
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
    if(this._currentToken !== null){
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

      if(this._peekToken !== null) {
        if (this._peekToken.token_type === TokenType.SEMICOLON) {
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
    if(this._currentToken !== null){
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
    if(this._currentToken !== null){
      const returnStatement = new ReturnStatements(this._currentToken);

      this._advanceTokens();

      returnStatement.set_returnValue(this._parseExpression(Precedence.LOWEST));

      if(this._peekToken !== null) {
        if (this._peekToken.token_type === TokenType.SEMICOLON) {
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
    
    if(this._currentToken !== null){
      switch (this._currentToken.token_type) {
        case TokenType.LET:
          console.log('parseProgram statement let statement');
          return this._parseLetStatement();
        case TokenType.RETURN:
          console.log('parseProgram statement return statement');
          return this._parseReturnStatement();
        default:
          console.log("Default token")
          return this._parseExpressionStatement();
      }
    }else{
      throw new Error("El token es nulo");
    }
  }

  _peekPrecedence() {
    console.log("_peekPrecedence");
    if(this._peekToken !== null){
      if(PRECEDENCES.hasOwnProperty(this._peekToken.token_type)){
        return PRECEDENCES[this._peekToken.token_type];
      }else{        
        return Precedence.LOWEST;
      }      
    }else{
      throw new Error("El token es nulo");
    }
  }

  _registerInfixFns() {
    console.log("registerInfix");
    return {
      [TokenType.PLUS]: () => this._parseInfixExpression(),
      [TokenType.MINUS]: () => this._parseInfixExpression(),
      [TokenType.DIVISION]: () => this._parseInfixExpression(),
      [TokenType.MULTIPLICATION]: () => this._parseInfixExpression(),
      [TokenType.EQ]: () => this._parseInfixExpression(),
      [TokenType.DIF]: () => this._parseInfixExpression(),
      [TokenType.LT]: () => this._parseInfixExpression(),
      [TokenType.GT]: () => this._parseInfixExpression(),
      [TokenType.LPAREN]: () => this._parseCall(),
    };
  }
  _registerPrefixFns() {
    console.log("registerPrefix");
    return {
      
      [TokenType.FALSE]: () => this._parseBoolean(),
      [TokenType.FUNCTION]: () => this._parseFunction(),
      [TokenType.IDENTIFIER]: () => this._parseIdentifier(),
      [TokenType.IF]: () => this._parseIf(),
      [TokenType.INTEGER]: () => this._parseInteger(),
      [TokenType.LPAREN]: () => this._parseGroupedExpression(),
      [TokenType.MINUS]: () => this._parsePrefixExpression(),
      [TokenType.NEGATION]: () => this._parsePrefixExpression(),
      [TokenType.TRUE]: () => this._parseBoolean(),
    };
  }
}

module.exports = Parser;
