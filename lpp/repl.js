const { Console } = require("console");
const Lexer = require("./lexer");
const Parser = require("./parser");

function startRepl() {
  const linea = require("readline");
  const rl = linea.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.setPrompt(">>");
  rl.on("line", (source) => {
    if (source !== "salir") {
      const lexer = new Lexer(source);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();
      Console.log(program);
    } else {
      rl.close();
    }

    rl.prompt();
  });

  rl.prompt();
}
module.exports = {
  startRepl,
};
