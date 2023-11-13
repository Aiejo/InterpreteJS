import Parser from "./lpp/parser";
import { createGlobalEnv } from "./runtime/enviroment";
import { evaluate } from "./runtime/interpreter";
const fs = require("fs").promises;

// run("./Test.txt");

// async function run(filename: string) {
//   const parser = new Parser();
//   const env = createGlobalEnv();

//   const input = await fs.readFile(filename, "utf-8");
//   const program = parser.produceAST(input);

//   const result = evaluate(program, env);
//   // console.log(result);
// }

repl();

async function repl() {
  console.log("\nRepl v0.1");
  const linea = require("readline");
  const rl = linea.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const parser = new Parser();
  const env = createGlobalEnv();
  // Constantes predeterminadas

  // Ejecutar hasta que se salga
  rl.setPrompt(">>");
  rl.on("line", (source: string) => {
    if (source !== "exit") {
      const program = parser.produceAST(source);
      console.log("Programa\n:", program);
      const result = evaluate(program, env);
      console.log("Resultado:\n", result);
    } else {
      process.exit(1);
    }

    rl.prompt();
  });

  rl.prompt();
}
