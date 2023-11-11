import Parser from "./lpp/parser";
import { evaluate } from "./runtime/interpreter";
repl();

async function repl() {
  console.log("\nRepl v0.1");
  const linea = require("readline");
  const rl = linea.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  // Ejecutar hasta que se salga
  rl.setPrompt(">>");
  rl.on("line", (source: string) => {
    if (source !== "exit") {
      const parser = new Parser();
      const program = parser.produceAST(source);
      const result = evaluate(program);
      console.log(result);
    } else {
      process.exit(1);
    }

    rl.prompt();
  });

  rl.prompt();
}
