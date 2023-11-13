import Environment from "./enviroment";
import { Stmt } from "../lpp/ast";

export type ValueType =
  | "null"
  | "number"
  | "string"
  | "boolean"
  | "object"
  | "native-fn"
  | "function";
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

// Definir strings

export interface StringVal extends RuntimeVal {
  type: "string";
  value: string;
}

export function MK_STR(n = "") {
  return { type: "string", value: "" } as StringVal;
}
// Soporte para objetos
export interface ObjectVal extends RuntimeVal {
  type: "object";
  properties: Map<string, RuntimeVal>;
}

export type FunctionCall = (args: RuntimeVal[], env: Environment) => RuntimeVal;

export interface NativeFnValue extends RuntimeVal {
  type: "native-fn";
  call: FunctionCall;
}
export function MK_NATIVE_FN(call: FunctionCall) {
  return { type: "native-fn", call } as NativeFnValue;
}

export interface FunctionValue extends RuntimeVal {
  type: "function";
  name: string;
  parameters: string[];
  declarationEnv: Environment;
  body: Stmt[];
}
