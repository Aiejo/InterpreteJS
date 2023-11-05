const { Token } = require("./tokens");

class ASTNode {
  token_literal() {}

  toString() {}
}

class Statement extends ASTNode {
  constructor(token) {   
    super();
    this.token = token;
  }

  token_literal() {
    return this.token.literal;
  }
}

class Expression extends ASTNode {
  constructor(token) {
    super();
    this.token = token;
  }

  token_literal() {
    return this.token.literal;
  }
}

class Program extends ASTNode {
  constructor(statements) {
    super();
    this.statements = statements;
  }

  token_literal() {
    if (this.statements.length > 0) {
      return this.statements[0].token_literal();
    }
    return "";
  }

  toString() {
    let out = [];
    for (let statement of this.statements) {
      out.push(statement.toString());
    }
    return out.join("");
  }
}

class Identifier extends Expression {
  constructor(token, value) {
    super(token);
    this.value = value;
  }

  toString() {
    return this.value;
  }
}

class LetStatement extends Statement {
  constructor(token, name = null, value = null) {
    super(token);
    this.name = name;
    this.value = value;
  }

  toString() {
    return `${this.token_literal()} ${this.name} = ${this.value};`;
  }
  set_name(name) {
    this.name = name;
  }
  set_value(value) {
    this.value = value;
  }
}

class ReturnStatements extends Statement {
  constructor(token, return_value = null) {
    super(token);
    this.return_value = return_value;
  }

  toString() {
    return `${this.token_literal()} ${this.return_value};`;
  }
  set_return_value(return_value){
    this.return_value = return_value;
  }
}

class ExpressionStatement extends Statement {  
  constructor(token, expression = null) {
    super(token);    
    this.expression = expression;
  }

  toString() {
    return this.expression.toString();
  }
  set_expression(expression) {
    this.expression = expression;
  } 
}

class Integer extends Expression {
  constructor(token, value = null) {
    super(token);
    this.value = value;
  }

  toString() {
    return this.value.toString();
  }
  set_value(value) {
    this.value = value;
  }
}

class Prefix extends Expression {
  constructor(token, operator, right = null) {
   
    super(token);
    this.operator = operator;
    this.right = right;
  }

  toString() {
    return `(${this.operator}${this.right})`;
  }
  set_right(right) {
    this.right = right;
  }
  set_operator(operator) {
    this.operator = operator;
  }
}

class Infix extends Expression {
  constructor(token, left, operator, right = null) {
    super(token);
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  toString() {
    return `(${this.left} ${this.operator} ${this.right})`;
  }
}

class Boolean extends Expression {
  constructor(token, value = null) {
    super(token);
    this.value = value;
  }

  toString() {
    return this.token_literal();
  }
}

class Block extends Statement {
  constructor(token, statements = []) {
    super(token);
    this.statements = statements;
  }

  toString() {
    let out = this.statements.map((statement) => statement.toString());
    return out.join("");
  }
}

class If extends Expression {
  constructor(token, condition = null, consequence = null, alternative = null) {
    super(token);
    this.condition = condition;
    this.consequence = consequence;
    this.alternative = alternative;
  }

  toString() {
    let out = `si ${this.condition} ${this.consequence}`;
    if (this.alternative) {
      out += `si_no ${this.alternative}`;
    }
    return out;
  }
  set_condition(condition){
    this.condition = condition;
  }
  set_consequence(consequence){
    this.consequence = consequence;
  }
  set_consequence(alternative){
    this.alternative = alternative;
  }
  
}

class Function extends Expression {
  constructor(token, parameters = [], body = null) {
    super(token);
    this.parameters = parameters;
    this.body = body;
  }

  toString() {
    let param_list = this.parameters.map((parameter) => parameter.toString());
    let params = param_list.join(", ");
    return `${this.token_literal()}(${params}) ${this.body}`;
  }
  set_body(body) {
    this.body = body;
  }
}

class Call extends Expression {
  constructor(token, func, args = []) {
    super(token);
    this.function = func;
    this.arguments = args;
  }
  set_arguments(args) {
    this.arguments = args;
  }

  toString() {
    let arg_list = this.arguments.map((argument) => argument.toString());
    let args = arg_list.join(", ");
    return `${this.function}(${args})`;
  }
}

module.exports = {
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
};
