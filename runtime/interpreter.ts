import { NumberVal, RuntimeVal } from "./values";
import {
  AssignmentExpr,
  BinaryExpr,
  Identifier,
  NumericLiteral,
  ObjectLiteral,
  Program,
  Stmt,
  VarDeclaration,
} from "../lpp/ast";
import Environment from "./enviroment";
import {
  eval_identifier,
  eval_binary_expr,
  eval_assignment,
  eval_object_expr,
} from "./eval/expressions";
import { eval_program, eval_var_declaration } from "./eval/statements";

export function evaluate(astNode: Stmt, env: Environment): RuntimeVal {
  switch (astNode.kind) {
    case "NumericLiteral":
      return {
        value: (astNode as NumericLiteral).value, // Lo casteamos para poder pasar
        type: "number",
      } as NumberVal;
    case "Identifier":
      return eval_identifier(astNode as Identifier, env);
    case "ObjectLiteral":
      return eval_object_expr(astNode as ObjectLiteral, env);
    case "AssignmentExpr":
      return eval_assignment(astNode as AssignmentExpr, env);
    case "BinaryExpr":
      return eval_binary_expr(astNode as BinaryExpr, env);
    case "Program":
      return eval_program(astNode as Program, env);
    case "VarDeclaration":
      return eval_var_declaration(astNode as VarDeclaration, env);
    // Handle unimplimented ast types as error.
    default:
      console.error(
        "This AST Node has not yet been setup for interpretation.",
        astNode
      );
      process.exit(0);
  }
}
