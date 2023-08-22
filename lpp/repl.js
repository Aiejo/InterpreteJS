const Lexer = require("./lexer");

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

      let token = lexer.siguiente_token();

      while (token.get_literal() != "") {
        console.log(token.toString());
        token = lexer.siguiente_token();
      }
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
