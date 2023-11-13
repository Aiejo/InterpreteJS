import {
  MK_BOOLEAN,
  MK_NATIVE_FN,
  MK_NUMBER,
  MK_NULL,
  RuntimeVal,
} from "./values";

export function createGlobalEnv() {
  const env = new Environment();
  // Crear el scope global
  env.declareVar("verdadero", MK_BOOLEAN(true), true);
  env.declareVar("falso", MK_BOOLEAN(false), true);
  env.declareVar("nulo", MK_NULL(), true);

  // Definir funciones nativas
  env.declareVar(
    "imprimir",
    MK_NATIVE_FN((args, scope) => {
      console.log(...args);
      return MK_NULL();
    }),
    true
  );

  function timeFunction(_args: RuntimeVal[], _env: Environment) {
    return MK_NUMBER(Date.now());
  }
  env.declareVar("tiempo", MK_NATIVE_FN(timeFunction), true);
  return env;
}

export default class Environment {
  private parent?: Environment;
  private variables: Map<string, RuntimeVal>;
  private constants: Set<string>;

  constructor(parentENV?: Environment) {
    const global = parentENV ? true : false;
    this.parent = parentENV;
    this.variables = new Map();
    this.constants = new Set();
  }

  public declareVar(
    varname: string,
    value: RuntimeVal,
    constant: boolean
  ): RuntimeVal {
    if (this.variables.has(varname)) {
      throw `Cannot declare variable ${varname}. As it already is defined.`;
    }

    this.variables.set(varname, value);

    if (constant) {
      this.constants.add(varname);
    }
    return value;
  }

  public assignVar(varname: string, value: RuntimeVal): RuntimeVal {
    const env = this.resolve(varname);
    // No podemos asignar valor a una constante
    if (env.constants.has(varname)) {
      throw `Cannot reassign to variable ${varname} as it was declared constant`;
    }

    env.variables.set(varname, value);
    return value;
  }

  public lookupVar(varname: string): RuntimeVal {
    const env = this.resolve(varname);
    return env.variables.get(varname) as RuntimeVal;
  }

  public resolve(varname: string): Environment {
    if (this.variables.has(varname)) {
      return this;
    }

    if (this.parent == undefined) {
      throw `Cannot resolve '${varname}' as it does not exist.`;
    }

    return this.parent.resolve(varname);
  }
}