const { startRepl } = require("./lpp/repl");

function saludo() {
  console.log(
    "\n Bienvenido al intérprete (basado en JS) Racoon \uD83D\uDE00 \n"
  );
}

function main() {
  saludo();
  startRepl();
}

if (require.main === module) {
  main();
}
