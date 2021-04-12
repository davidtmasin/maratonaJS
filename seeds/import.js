//1° Ler o arquivo JSON;
//2° Fazer um loop entre cada um dos itens;
//3° Salvar cada um dos itens no banco. 

// Iniciando com a importação da fs (fileSystem) que é nativa do Node.JS
const fs = require('fs');

// Mais outra biblioteca a ser importada (dotenv), que lê arquivos ".env", 
// que contém as informações sensíveis: arquivos de senhas, arquivos de conexão, chaves de API
// E precisa ser instalada via comando: npm install --save dotenv
const dotenv = require('dotenv');

// Mais outra biblioteca, para uso do mongoDB, para facilitar o acesso ao banco (mongoose)
// E precisa ser instalada via comando: $ npm install --save mongoose
const { Schema, model, connect } = require('mongoose');


dotenv.config();

// Exibe aqui os dados lidos no arquivo .env, ou seja, a string de conexão ao BD
// console.log(process.env.DATABASE);

// O Schema é usado para definir a estrutura do seu banco de dados relacional
const GameSchema = new Schema({title: String}, {strict: false});

// Usado para interação com o banco de dados
const Game = model('Game', GameSchema);

const parseJSON = (data) => {
    try{
        return JSON.parse(data);
    }catch(error){
        return null;
    }
}

// Vamos agora criar a função para conectar-se ao BD
const connectToDB = () => {
    // Options => opções padrão do mongoose
    const options = {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
    };

    return connect(process.env.DATABASE, options);
};


// Vamos agora criar a função para ler o arquivo que contém os jogos
const readGamesFromFile = (filename) =>{

    const promiseCallback = (resolve, reject) =>{

        fs.readFile(filename, (err, data) => {
            if(err) return reject(err); 
            
            const json = parseJSON(data)

            if(!json) return reject(`Not able to parse JSON file ${filename }`);
            
            return resolve(json);
        });
    }; 

    return new Promise(promiseCallback);
};

// função para importar para o BANCO DE DADOS
const storeGame = (data) => {
    const game = new Game(data);
    return game.save();
};

// Vamos agora criar uma função para executa tudo, que faz a importação acontecer
const importGames = async () => {
    await connectToDB();
    // readGamesFromFile('games.json').then(console.log).catch(console.error);
    const games = await readGamesFromFile('games.json');

    for(let i = 0; i < games.length; i++){
        const game = games[i];
        // console.log(game.title);
        await storeGame(games[i]);
        console.log(game.title);
    }
    // Para encerrar o node.JS no terminal
    process.exit();
};

importGames();

// RODE ESTE CÓDIGO COM node seeds/import.js