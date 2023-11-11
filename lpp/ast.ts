export type NodeType =
  | "Program"
  | "NumericLiteral"
  | "NullLiteral"
  | "Identifier"
  | "BinaryExpr";

// Un statement está compuesto por expresiones
export interface Stmt {
  kind: NodeType;
}

// El programa está compuesto por statements, un programa es un archivo
export interface Program extends Stmt {
  kind: "Program";
  body: Stmt[];
}

// Las expresiones si retornan valores
export interface Expr extends Stmt {}

// Por ejempplo 10 - 5
export interface BinaryExpr extends Expr {
  kind: "BinaryExpr";
  left: Expr;
  right: Expr;
  operator: string; // needs to be of type BinaryOperator
}

// por Ejemplo x, Foo, nombre
export interface Identifier extends Expr {
  kind: "Identifier";
  symbol: string;
}

// Representa los números en el código
export interface NumericLiteral extends Expr {
  kind: "NumericLiteral";
  value: number;
}

export interface NullLiteral extends Expr {
  kind: "NullLiteral";
  value: "null";
}
