import {
  BinaryExpr,
  Expr,
  Identifier,
  VarDeclaration,
  NumericLiteral,
  AssignmentExpr,
  Program,
  Property,
  Stmt,
} from "./ast";

import { Token, tokenize, TokenType } from "./lexer";

// Su objetivo es tomar los tokens del tokenizer
export default class Parser {
  private tokens: Token[] = [];

  private not_eof(): boolean {
    return this.tokens[0].type != TokenType.EOF;
  }

  private at() {
    return this.tokens[0] as Token;
  }

  // Obtener el primer token
  private eat() {
    const prev = this.tokens.shift() as Token;
    return prev;
  }

  private expect(type: TokenType, err: any) {
    const prev = this.tokens.shift() as Token;
    if (!prev || prev.type != type) {
      console.error("Parser Error:\n", err, prev, " - Expecting: ", type);
      process.exit(1);
    }

    return prev;
  }

  // Vamos a crear el ast
  public produceAST(sourceCode: string): Program {
    // Tokenizamos
    this.tokens = tokenize(sourceCode);
    const program: Program = {
      kind: "Program",
      body: [],
    };

    // Hasta que no estemos al final del archivo
    while (this.not_eof()) {
      program.body.push(this.parse_stmt());
    }

    return program;
  }

  // Esto luego manejará statement más complejos
  private parse_stmt(): Stmt {
    switch (this.at().type) {
      case TokenType.Let:
      case TokenType.Const:
        return this.parse_var_declaration();
      default:
        return this.parse_expr();
    }
  }

  // let ident
  // (let | const) ident = expr;
  private parse_var_declaration(): Stmt {
    const isConstant = this.eat().type == TokenType.Const;
    const identifier = this.expect(
      TokenType.Identifier,
      "Expected identifier name following let | const keywords."
    ).value;

    if (this.at().type == TokenType.Semicolon) {
      this.eat(); // expect semicolon
      if (isConstant) {
        throw "Must assigne value to constant expression. No value provided.";
      }

      return {
        kind: "VarDeclaration",
        identifier,
        constant: false,
      } as VarDeclaration;
    }

    this.expect(
      TokenType.Equals,
      "Expected equals token following identifier in var declaration."
    );

    const declaration = {
      kind: "VarDeclaration",
      value: this.parse_expr(),
      identifier,
      constant: isConstant,
    } as VarDeclaration;

    this.expect(
      TokenType.Semicolon,
      "Variable declaration statment must end with semicolon."
    );

    return declaration;
  }
  // Manejo de expresiones
  // Lo más prioritario lo queremos parsear de último
  // Ordenes
  // PrimaryExpr
  // UnaryExpr
  // MultiplicitaveExpr
  // AdditiveExpr
  private parse_expr(): Expr {
    return this.parse_assignment_expr();
  }

  private parse_assignment_expr(): Expr {
    const left = this.parse_object_expr();

    if (this.at().type == TokenType.Equals) {
      this.eat(); // avanzar el igual
      const value = this.parse_assignment_expr();
      return { value, assigne: left, kind: "AssignmentExpr" } as AssignmentExpr;
    }

    return left;
  }

  private parse_object_expr(): Expr {
    // { Prop[] }
    if (this.at().type !== TokenType.OpenBrace) {
      return this.parse_additive_expr();
    }

    this.eat(); // avanzamos de donde se abre
    const properties = new Array<Property>();

    while (this.not_eof() && this.at().type != TokenType.CloseBrace) {
      const key = this.expect(
        TokenType.Identifier,
        "Object literal key exprected"
      ).value;

      // Permite declaración de parámetro por variable
      if (this.at().type == TokenType.Comma) {
        this.eat(); // advance past comma
        properties.push({ key, kind: "Property" } as Property);
        continue;
      } // Allows shorthand key: pair -> { key }
      else if (this.at().type == TokenType.CloseBrace) {
        properties.push({ key, kind: "Property" });
        continue;
      }

      // { key: val }
      this.expect(
        TokenType.Colon,
        "Missing colon following identifier in ObjectExpr"
      );
      const value = this.parse_expr();

      properties.push({ kind: "Property", value, key });
      if (this.at().type != TokenType.CloseBrace) {
        this.expect(
          TokenType.Comma,
          "Expected comma or closing bracket following property"
        );
      }
    }

    this.expect(TokenType.CloseBrace, "Object literal missing closing brace.");
    return { kind: "ObjectLiteral", properties } as ObjectLiteral;
  }

  // 45 * 9 + 3
  // Manejo de operaciones de suma y resta
  private parse_additive_expr(): Expr {
    // Debemos parsear de último la multiplicación
    let left = this.parse_multiplicitave_expr();

    while (this.at().value == "+" || this.at().value == "-") {
      const operator = this.eat().value;
      const right = this.parse_multiplicitave_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  // Manejo de multiplicación
  private parse_multiplicitave_expr(): Expr {
    let left = this.parse_primary_expr();

    while (
      this.at().value == "/" ||
      this.at().value == "*" ||
      this.at().value == "%"
    ) {
      const operator = this.eat().value;
      const right = this.parse_primary_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  // Parsear valores literales y grupos
  private parse_primary_expr(): Expr {
    const tk = this.at().type;

    // Determine which token we are currently at and return literal value
    switch (tk) {
      // Valores definidos por usuario
      case TokenType.Identifier:
        return { kind: "Identifier", symbol: this.eat().value } as Identifier;
      // constantes y constantes numericas
      case TokenType.Number:
        return {
          kind: "NumericLiteral",
          value: parseFloat(this.eat().value),
        } as NumericLiteral;

      // Grouping Expressions
      case TokenType.OpenParen: {
        this.eat(); // eat the opening paren
        const value = this.parse_expr();
        this.expect(
          TokenType.CloseParen,
          "Unexpected token found inside parenthesised expression. Expected closing parenthesis."
        ); // closing paren
        return value;
      }

      // Cuando no se identifica el token se lanza error
      default:
        console.error("Unexpected token found during parsing!", this.at());
        process.exit(1);
    }
  }
}
