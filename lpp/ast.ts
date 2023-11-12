export type NodeType =
  // STATEMENTS
  | "Program"
  | "VarDeclaration"
  // EXPRESSIONS
  | "AssignmentExpr"
  // Literals
  | "Property"
  | "ObjectLiteral"
  | "NumericLiteral"
  | "Identifier"
  | "BinaryExpr";

// Un statement está compuesto por expresiones
export interface Stmt {
  kind: NodeType;
}

// Statements
// El programa está compuesto por statements, un programa es un archivo
export interface Program extends Stmt {
  kind: "Program";
  body: Stmt[];
}

// Let x; // x is undefined
export interface VarDeclaration extends Stmt {
  kind: "VarDeclaration";
  constant: boolean;
  identifier: string;
  value?: Expr;
}

// Las expresiones si retornan valores
export interface Expr extends Stmt {}

export interface AssignmentExpr extends Expr {
  kind: "AssignmentExpr";
  assigne: Expr;
  value: Expr;
}

// Expresiones
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

export interface Property extends Expr {
  kind: "Property";
  key: string;
  value?: Expr;
}

export interface ObjectLiteral extends Expr {
  kind: "ObjectLiteral";
  properties: Property[];
}
