export interface Celebrity {
    id: number;
    name: string;
}

export interface Category {
    id: string;
    title: string;
    icon: string;
    items: Celebrity[];
}

let nextId = 1;
const c = (name: string): Celebrity => ({ id: nextId++, name });

export const CATEGORIES: Category[] = [
    {
        id: 'atores-br',
        title: 'Atores e Atrizes (Brasil)',
        icon: '🎬',
        items: [
            'Wagner Moura', 'Fernanda Montenegro', 'Fernanda Torres', 'Selton Mello', 'Lázaro Ramos',
            'Taís Araújo', 'Bruna Marquezine', 'Grazi Massafera', 'Cauã Reymond', 'Rodrigo Santoro',
            'Alice Braga', 'Camila Pitanga', 'Marcos Palmeira', 'Regina Casé', 'Antônio Fagundes',
            'José de Abreu', 'Malu Mader', 'Débora Falabella', 'Paolla Oliveira', 'Juliana Paes',
            'Marjorie Estiano', 'Sophie Charlotte', 'Bruno Gagliasso', 'Thiago Lacerda', 'Reynaldo Gianecchini',
            'Vera Fischer', 'Tony Ramos', 'Glória Pires', 'Fábio Assunção', 'Larissa Manoela',
            'Maisa Silva', 'Klara Castanho', 'Cauê Campos', 'Isis Valverde', 'Marina Ruy Barbosa'
        ].map(c)
    },
    {
        id: 'atores-intl',
        title: 'Atores e Atrizes (Internacional)',
        icon: '🎥',
        items: [
            'Leonardo DiCaprio', 'Brad Pitt', 'Tom Cruise', 'Tom Hanks', 'Robert Downey Jr.',
            'Chris Evans', 'Scarlett Johansson', 'Margot Robbie', 'Zendaya', 'Tom Holland',
            'Meryl Streep', 'Morgan Freeman', 'Denzel Washington', 'Will Smith', 'Keanu Reeves',
            'Johnny Depp', 'Angelina Jolie', 'Jennifer Aniston', 'Natalie Portman', 'Emma Watson',
            'Emma Stone', 'Ryan Gosling', 'Ryan Reynolds', 'Hugh Jackman', 'Dwayne Johnson',
            'Jason Momoa', 'Timothée Chalamet', 'Florence Pugh', 'Anya Taylor-Joy', 'Cate Blanchett'
        ].map(c)
    },
    {
        id: 'cantores-br',
        title: 'Cantores e Cantoras (Brasil)',
        icon: '🎤',
        items: [
            'Ivete Sangalo', 'Anitta', 'Luan Santana', 'Gusttavo Lima', 'Marília Mendonça',
            'Ludmilla', 'Pabllo Vittar', 'Luísa Sonza', 'Wesley Safadão', 'Zeca Pagodinho',
            'Jorge Ben Jor', 'Caetano Veloso', 'Gilberto Gil', 'Djavan', 'Roberto Carlos',
            'Elis Regina', 'Gal Costa', 'Maria Bethânia', 'Chico Buarque', 'Rita Lee',
            'Tim Maia', 'Cazuza', 'Renato Russo', 'Alcione', 'Beth Carvalho',
            'Zezé Di Camargo', 'Sandy', 'Junior Lima', 'Claudia Leitte', 'Daniela Mercury',
            'Preta Gil', 'Iza', 'Emicida', 'Racionais MCs', 'Joelma'
        ].map(c)
    },
    {
        id: 'cantores-intl',
        title: 'Cantores e Cantoras (Internacional)',
        icon: '🎵',
        items: [
            'Beyoncé', 'Taylor Swift', 'Rihanna', 'Lady Gaga', 'Madonna',
            'Michael Jackson', 'Whitney Houston', 'Elvis Presley', 'Freddie Mercury', 'Justin Bieber',
            'Ariana Grande', 'Katy Perry', 'Ed Sheeran', 'Bruno Mars', 'Adele',
            'Selena Gomez', 'Billie Eilish', 'Dua Lipa', 'Shakira', 'Bad Bunny',
            'Drake', 'Eminem', 'Jay-Z', 'Kanye West', 'The Weeknd',
            'Harry Styles', 'Miley Cyrus', 'Britney Spears', 'Celine Dion', 'Elton John',
            'John Lennon', 'Paul McCartney', 'Mick Jagger', 'Bob Marley', 'Amy Winehouse'
        ].map(c)
    },
    {
        id: 'atletas-br',
        title: 'Atletas (Brasil)',
        icon: '⚽',
        items: [
            'Pelé', 'Neymar Jr.', 'Ronaldinho Gaúcho', 'Ronaldo Fenômeno', 'Romário',
            'Zico', 'Rivaldo', 'Kaká', 'Cafu', 'Roberto Carlos (jogador)',
            'Marta', 'Formiga', 'Rebeca Andrade', 'Daiane dos Santos', 'Gabriel Medina',
            'Ayrton Senna', 'Rubens Barrichello', 'Felipe Massa', 'Guga Kuerten', 'Oscar Schmidt',
            'Hortência', 'Cesar Cielo', 'Thiago Braz', 'Isaquias Queiroz', 'Vanderlei Cordeiro de Lima',
            'Vampeta', 'Casagrande', 'Sócrates', 'Bebeto'
        ].map(c)
    },
    {
        id: 'atletas-intl',
        title: 'Atletas (Internacional)',
        icon: '🏆',
        items: [
            'Lionel Messi', 'Cristiano Ronaldo', 'Michael Jordan', 'LeBron James', 'Kobe Bryant',
            'Usain Bolt', 'Michael Phelps', 'Serena Williams', 'Rafael Nadal', 'Roger Federer',
            'Novak Djokovic', 'Mike Tyson', 'Muhammad Ali', 'Floyd Mayweather', 'Lewis Hamilton',
            'Michael Schumacher', 'Diego Maradona', 'David Beckham', 'Zinedine Zidane', 'Kylian Mbappé',
            'Erling Haaland', 'Simone Biles', 'Tom Brady', "Shaquille O'Neal", 'Wayne Gretzky',
            'Tiger Woods', 'Conor McGregor'
        ].map(c)
    },
    {
        id: 'apresentadores-br',
        title: 'Apresentadores e Humoristas (Brasil)',
        icon: '📺',
        items: [
            'Silvio Santos', 'Faustão', 'Xuxa', 'Ana Maria Braga', 'Luciano Huck',
            'Angélica', 'Marcos Mion', 'Rodrigo Faro', 'Gugu Liberato', 'Hebe Camargo',
            'Chacrinha', 'Ratinho', 'Datena', 'Sônia Abrão', 'Pedro Bial',
            'Fátima Bernardes', 'William Bonner', 'Tiago Leifert', 'Otaviano Costa', 'Whindersson Nunes',
            'Casimiro (Cazé)', 'Felipe Neto', 'Gkay', 'Tirullipa', 'Fábio Porchat',
            'Paulo Gustavo', 'Renato Aragão (Didi)', 'Chico Anysio'
        ].map(c)
    },
    {
        id: 'influencers',
        title: 'Influenciadores e Criadores de Conteúdo',
        icon: '📱',
        items: [
            'Virginia Fonseca', 'Carlinhos Maia', 'Luva de Pedreiro', 'Inês Brasil', 'Bella Poarch',
            'Kim Kardashian', 'Kylie Jenner', 'MrBeast', 'PewDiePie', 'Zé Felipe',
            'Gabriela Pugliesi', 'Nobru', 'Cerol', 'Bruno Big', 'Camila Loures',
            'Lucas Rangel', 'Boca Rosa (Bianca Andrade)', 'Jojo Todynho', 'Karol Eller', 'Rico Melquíades'
        ].map(c)
    },
    {
        id: 'artistas-escritores',
        title: 'Artistas, Pintores e Escritores',
        icon: '🎨',
        items: [
            'Pablo Picasso', 'Leonardo da Vinci', 'Vincent van Gogh', 'Salvador Dalí', 'Frida Kahlo',
            'Tarsila do Amaral', 'Cândido Portinari', 'Michelangelo', 'Claude Monet', 'Andy Warhol',
            'Machado de Assis', 'Clarice Lispector', 'Jorge Amado', 'Paulo Coelho', 'Cecília Meireles',
            'Carlos Drummond de Andrade', 'Monteiro Lobato', 'William Shakespeare', 'Ernest Hemingway', 'J.K. Rowling',
            'Ziraldo', 'Mauricio de Sousa', 'Di Cavalcanti'
        ].map(c)
    },
    {
        id: 'ciencia-historia',
        title: 'Cientistas, Pensadores e Líderes Históricos',
        icon: '🧠',
        items: [
            'Albert Einstein', 'Isaac Newton', 'Charles Darwin', 'Stephen Hawking', 'Marie Curie',
            'Nikola Tesla', 'Thomas Edison', 'Galileu Galilei', 'Santos Dumont', 'Oswaldo Cruz',
            'Bill Gates', 'Steve Jobs', 'Elon Musk', 'Mark Zuckerberg', 'Barack Obama',
            'Nelson Mandela', 'Martin Luther King', 'Mahatma Gandhi', 'Napoleão Bonaparte', 'Júlio César',
            'Cleópatra', 'Dom Pedro II', 'Tiradentes', 'Zumbi dos Palmares', 'Getúlio Vargas'
        ].map(c)
    },
    {
        id: 'desenhos-infantis',
        title: 'Desenhos e Personagens Infantis',
        icon: '🧸',
        items: [
            'Mickey Mouse', 'Pato Donald', 'Pateta', 'Pernalonga', 'Patolino',
            'Tom & Jerry', 'Scooby-Doo', 'Pica-Pau', 'Popeye', 'Bob Esponja',
            'Patrick Estrela', 'Peppa Pig', 'Ursinho Pooh', 'Elsa', 'Anna (Frozen)',
            'Simba', 'Woody', 'Buzz Lightyear', 'Shrek', 'Burro (Shrek)',
            'Gru', 'Minions', 'Hello Kitty', 'Garfield', 'Snoopy',
            'Dora Aventureira', 'Peter Pan', 'Pinóquio', 'Cinderela', 'Branca de Neve'
        ].map(c)
    },
    {
        id: 'herois-viloes',
        title: 'Super-Heróis e Vilões',
        icon: '🦸',
        items: [
            'Batman', 'Superman', 'Homem-Aranha', 'Homem de Ferro', 'Capitão América',
            'Thor', 'Hulk', 'Mulher Maravilha', 'Flash', 'Coringa',
            'Darth Vader', 'Wolverine', 'Deadpool', 'Viúva Negra', 'Doutor Estranho',
            'Pantera Negra', 'Aquaman', 'Lex Luthor', 'Thanos', 'Magneto',
            'Duende Verde', 'Venom', 'Loki'
        ].map(c)
    },
    {
        id: 'games',
        title: 'Personagens de Games',
        icon: '🎮',
        items: [
            'Mario', 'Luigi', 'Sonic', 'Pikachu', 'Link (Zelda)',
            'Kratos', 'Master Chief', 'Lara Croft', 'Geralt de Rivia', 'Cloud Strife',
            'Solid Snake', 'Pac-Man', 'Sub-Zero', 'Scorpion', 'Crash Bandicoot',
            'Donkey Kong', 'Yoshi', 'Princesa Peach', 'Chun-Li', 'Ryu',
            'Steve (Minecraft)', 'Freddy Fazbear'
        ].map(c)
    },
    {
        id: 'anime',
        title: 'Anime e Mangá',
        icon: '🐲',
        items: [
            'Goku', 'Naruto', 'Luffy', 'Sasuke', 'Ichigo',
            'Light Yagami', 'L (Death Note)', 'Saitama', 'All Might', 'Deku',
            'Sailor Moon', 'Totoro', 'Vegeta', 'Gohan', 'Edward Elric',
            'Levi Ackerman', 'Eren Yeager', 'Tanjiro', 'Nezuko', 'Doraemon',
            'Conan Edogawa'
        ].map(c)
    },
    {
        id: 'folclore-br',
        title: 'Folclore e Clássicos Brasileiros',
        icon: '🇧🇷',
        items: [
            'Saci Pererê', 'Curupira', 'Iara', 'Boto Cor-de-Rosa', 'Boitatá',
            'Cuca', 'Mula Sem Cabeça', 'Chico Bento', 'Mônica', 'Cebolinha',
            'Cascão', 'Magali', 'Sítio do Picapau Amarelo', 'Emília', 'Visconde de Sabugosa',
            'Louro José', 'Bozo', 'Fofão', 'Vovó Mafalda', 'Galo Cego',
            'Chaves', 'Quico', 'Seu Madruga', 'Chapolin Colorado', 'Nazaré Tedesco',
            'Carminha', 'Capitão Nascimento'
        ].map(c)
    },
    {
        id: 'terror',
        title: 'Personagens de Terror',
        icon: '🎃',
        items: [
            'Chucky', 'Pennywise', 'Freddy Krueger', 'Jason Voorhees', 'Michael Myers',
            'Ghostface', 'Anabelle', 'A Freira', 'Sadako (O Chamado)', 'Leatherface',
            'Jack Skellington', 'Wandinha (Wednesday)', 'Frankenstein', 'Drácula', 'A Múmia'
        ].map(c)
    }
];

export const ALL_CELEBS = CATEGORIES.flatMap(cat => cat.items);
