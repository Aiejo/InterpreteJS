export type ValueType = "null" | "number" | "boolean" | "object";

export interface RuntimeVal {
  type: ValueType;
}

// Define valor nulo
export interface NullVal extends RuntimeVal {
  type: "null";
  value: null;
}

export function MK_NULL() {
  return { type: "null", value: null } as NullVal;
}

// Define booleanos
export interface BooleanVal extends RuntimeVal {
  type: "boolean";
  value: boolean;
}

export function MK_BOOLEAN(b = true) {
  return { type: "boolean", value: b } as BooleanVal;
}

// Valor que tiene acceso a number de js
export interface NumberVal extends RuntimeVal {
  type: "number";
  value: number;
}

export function MK_NUMBER(n = 0) {
  return { type: "number", value: n } as NumberVal;
}

// Soporte para objetos
export interface ObjectVal extends RuntimeVal {
  type: "object";
  properties: Map<string, RuntimeVal>;
}
