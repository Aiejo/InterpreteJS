export type ValueType = "null" | "number";

export interface RuntimeVal {
  type: ValueType;
}

// Define valor nulo
export interface NullVal extends RuntimeVal {
  type: "null";
  value: "null";
}

// Valor que tiene acceso a number de js
export interface NumberVal extends RuntimeVal {
  type: "number";
  value: number;
}
