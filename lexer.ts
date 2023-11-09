const fs = require("fs");
// Represents tokens that our language understands in parsing.
export enum TokenType {
  // Literal Types
  Number,
  Identifier,

  // Keywords
  Let,

  // Grouping * Operators
  BinaryOperator,
  Equals,
  OpenParen,
  CloseParen,
}

// Estructura de datos que relaciona un string con un tipo de dato
const KEYWORDS: Record<string, TokenType> = {
  let: TokenType.Let,
};

// Reoresents a single token from the source-code.
export interface Token {
  value: string; // contains the raw value as seen inside the source code.
  type: TokenType; // tagged structure.
}

// Crear un token dado su valor y tipo
function token(value = "", type: TokenType): Token {
  return { value, type };
}

// Determina si es una letra de A a Z
function isalpha(src: string) {
  return src.toUpperCase() != src.toLowerCase();
}

// Determina si el carácter se lo puede saltar
function isskippable(str: string) {
  return str == " " || str == "\n" || str == "\t";
}

// Determina si es un número, mediante estar en el intervalo de 0 a 9
function isint(str: string) {
  const c = str.charCodeAt(0);
  const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];
  return c >= bounds[0] && c <= bounds[1];
}

// Se le pasa un string y devuelve el arreglo de Tokens
export function tokenize(sourceCode: string): Token[] {
  const tokens = new Array<Token>();
  // Separamos caracter por caracter
  const src = sourceCode.split("");
  // Construimos cada token
  while (src.length > 0) {
    if (src[0] == "(") {
      tokens.push(token(src.shift(), TokenType.OpenParen));
    } else if (src[0] == ")") {
      tokens.push(token(src.shift(), TokenType.CloseParen));
    }
    // Manejo de operaciones
    else if (src[0] == "+" || src[0] == "-" || src[0] == "*" || src[0] == "/") {
      tokens.push(token(src.shift(), TokenType.BinaryOperator));
    } // Handle Conditional & Assignment Tokens
    else if (src[0] == "=") {
      tokens.push(token(src.shift(), TokenType.Equals));
    }
    // Manejo de tokens multicaracter
    else {
      // Manejo de números
      if (isint(src[0])) {
        // Creamos el número y vamos agregando los dígitos
        let num = "";
        while (src.length > 0 && isint(src[0])) {
          num += src.shift();
        }
        // append new numeric token.
        tokens.push(token(num, TokenType.Number));
      }
      // Manejo de keywords e identificadores
      else if (isalpha(src[0])) {
        let ident = ""; // let nombre;
        while (src.length > 0 && isalpha(src[0])) {
          ident += src.shift();
        }

        // Revisar si es palabra reservada
        const reserved = KEYWORDS[ident];
        if (reserved) {
          tokens.push(token(ident, reserved));
        } else {
          // Si entra aquí es porque el usuario definió un identificador
          tokens.push(token(ident, TokenType.Identifier));
        }
      } else if (isskippable(src[0])) {
        // Saltar caracteres innecesarios
        src.shift();
      } // Manejo de tokens no reconocidos
      else {
        console.error(
          "Unreconized character found in source: ",
          src[0].charCodeAt(0),
          src[0]
        );
        process.exit(1);
      }
    }
  }

  return tokens;
}

const source = fs.readFileSync("./Text.txt", "utf8");

for (const token of tokenize(source)) {
  console.log(token);
}
