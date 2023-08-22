const {TokenType, Token, revisar_tipo_de_token} = require('./tokens');

class Lexer{
    constructor(source){
        this.source = source; //Stream
        this.caracter = '';
        this.posicion = 0; //Cursor
        this.posicion_lectura = 0;

        this.leer_caracter();
    }

    siguiente_token(){
        let t;
        this.saltar_vacios();
        if(this.caracter === '='){
            if(this.revisar_caracter() === '='){
                t = this.unir_tokens(TokenType.EQ);
            }
            else{
                t = new Token(TokenType.ASSIGN, this.caracter); 
            }             
        }else if(this.caracter === '+'){
            t = new Token(TokenType.PLUS, this.caracter);
        }else if(this.caracter === '') {
            t = new Token(TokenType.EOF, this.caracter);
        }else if(this.es_numero(this.caracter)){            
            const literal = this.leer_numero();
            if(this.caracter === '.'){                                 
                if(this.es_numero(this.revisar_caracter())){
                    t = this.construir_float(literal);
                }else{                    
                    t = new Token(TokenType.ILLEGAL, `${literal}.`);
                } 
            }else{
                this.posicion --;
                this.posicion_lectura--;            
                t = new Token(TokenType.INTEGER, literal);
            }
        }else if(this.es_letra(this.caracter)){
            const literal = this.leer_identificador();
            const token_type = revisar_tipo_de_token(literal);
            this.posicion --;
            this.posicion_lectura--;
            t = new Token(token_type, literal);            
        }else if(this.caracter === '>'){
            if(this.revisar_caracter() === '='){
                t = this.unir_tokens(TokenType.GTE);
            }else{
                t = new Token(TokenType.GT, this.caracter);
            }
        }else if(this.caracter === '!'){
            if(this.revisar_caracter() === '='){
                t = this.unir_tokens(TokenType.DIF);
            }else{
                t = new Token(TokenType.NEGATION, this.caracter);
            }
        }else if(this.caracter === '<'){
            if(this.revisar_caracter() === '='){
                t =  this.unir_tokens(TokenType.LTE);
            }else{
                t = new Token(TokenType.LT, this.caracter);
            }
        }else if(this.caracter === ','){
            t = new Token(TokenType.COMMA, this.caracter);
        }else if(this.caracter === ';'){
            t = new Token(TokenType.SEMICOLON, this.caracter);
        }else if(this.caracter === '('){
            t = new Token(TokenType.LPAREN, this.caracter);
        }else if(this.caracter === ')'){
            t = new Token(TokenType.RPAREN, this.caracter);
        }else if(this.caracter === '['){
            t = new Token(TokenType.LBRACE, this.caracter);
        }else if(this.caracter === ']'){
            t = new Token(TokenType.RBRACE, this.caracter);
        }else if(this.caracter === '{'){
            t = new Token(TokenType.LKEY, this.caracter);
        }else if(this.caracter === '}'){
            t = new Token(TokenType.RKEY, this.caracter);
        }else if(this.caracter === '-'){
            t = new Token(TokenType.MINUS, this.caracter);
        }else if(this.caracter === '.'){
            t = new Token(TokenType.DOT, this.caracter);
        }else if(this.caracter === '*'){
            t = new Token(TokenType.MULTIPLY, this.caracter);
        }else if(this.caracter === '/'){
            t = new Token(TokenType.DIVISION, this.caracter);        
        }else{            
            t = new Token(TokenType.ILLEGAL, this.caracter);
        }
        this.leer_caracter(); 
        return t;       

    }
    es_letra(caracter){
        return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ_]$/.test(caracter);
    }
    es_numero(caracter){
        return /^\d$/.test(caracter);
    }

    leer_identificador(){
        const posicion_inicial = this.posicion;
        while(this.es_letra(this.caracter)){
            this.leer_caracter();
        }       
        return this.source.substring(posicion_inicial, this.posicion);
        
    }  
    leer_numero(){
        const posicion_inicial = this.posicion;
        while(this.es_numero(this.caracter)){
            this.leer_caracter();
        }
        return this.source.substring(posicion_inicial, this.posicion);
    }  
    
    saltar_vacios(){
        //Se usa esa expresión regular para no solo reconocer un espacio en blanco sino también tabulaciones o saltos de línea.
        while (/^\s$/.test(this.caracter)){  
            this.leer_caracter();
        }
    }
    leer_caracter(){
        if(this.posicion_lectura >= this.source.length){
            this.caracter = ''        
        }
        else{
            this.caracter = this.source[this.posicion_lectura]
        }
        this.posicion = this.posicion_lectura;
        this.posicion_lectura ++;

    }
    revisar_caracter(){
        if(this.posicion_lectura >= this.source.length){
            return ''
        }
        return this.source[this.posicion_lectura]
    }
    unir_tokens(tokenType){
        const prefijo = this.caracter;
        this.leer_caracter();
        const sufijo = this.caracter
        return new Token(tokenType, `${prefijo}${sufijo}`); //Comillas raras para concatenar el prefijo y el sufijo. 
    }
    construir_float(prefijo){
        this.leer_caracter();
        const sufijo = this.leer_numero();
        return new Token(TokenType.FLOAT, `${prefijo}.${sufijo}`);
    }
        
}  
module.exports = Lexer;  