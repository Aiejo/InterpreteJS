import {
  BinaryExpr,
  Expr,
  Identifier,
  NullLiteral,
  NumericLiteral,
  Program,
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
    return this.parse_expr();
  }

  // Manejo de expresiones
  // Lo más prioritario lo queremos parsear de último
  // Ordenes
  // PrimaryExpr
  // UnaryExpr
  // MultiplicitaveExpr
  // AdditiveExpr
  private parse_expr(): Expr {
    return this.parse_additive_expr();
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

      case TokenType.Null:
        this.eat(); // Avanzar a después del null
        return { kind: "NullLiteral", value: "null" } as NullLiteral;
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
