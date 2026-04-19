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

export const CATEGORIES: Category[] = [
    {
        id: 'nacionais',
        title: 'Nacionais & Personagens BR',
        icon: '🇧🇷',
        items: [
            // Reais - Celebridades e Atletas
            { id: 1, name: 'Ivete Sangalo' }, { id: 2, name: 'Silvio Santos' },
            { id: 3, name: 'Neymar Jr.' }, { id: 4, name: 'Anitta' },
            { id: 5, name: 'Rodrigo Faro' }, { id: 6, name: 'Xuxa' },
            { id: 7, name: 'Faustão' }, { id: 8, name: 'Luan Santana' },
            { id: 9, name: 'Pelé' }, { id: 10, name: 'Ayrton Senna' },
            { id: 11, name: 'Gisele Bündchen' }, { id: 12, name: 'Paulo Gustavo' },
            { id: 13, name: 'Maisa Silva' }, { id: 14, name: 'Larissa Manoela' },
            { id: 15, name: 'Whindersson Nunes' }, { id: 16, name: 'Casimiro (Cazé)' },
            { id: 17, name: 'Ana Maria Braga' }, { id: 18, name: 'Luciano Huck' },
            { id: 19, name: 'Angélica' }, { id: 20, name: 'Marcos Mion' },
            { id: 21, name: 'Marta (Futebol)' }, { id: 22, name: 'Gabriel Medina' },
            { id: 23, name: 'Rebeca Andrade' }, { id: 24, name: 'Ronaldinho Gaúcho' },
            { id: 25, name: 'Roberto Carlos (Rei)' }, { id: 26, name: 'Pabllo Vittar' },
            { id: 27, name: 'Luísa Sonza' }, { id: 28, name: 'Ludmilla' },
            { id: 29, name: 'Gil do Vigor' }, { id: 30, name: 'Juliette' },
            { id: 31, name: 'Selton Mello' }, { id: 32, name: 'Wagner Moura' },
            { id: 33, name: 'Fernanda Montenegro' }, { id: 34, name: 'Lázaro Ramos' },
            { id: 35, name: 'Taís Araújo' }, { id: 36, name: 'Cauã Reymond' },
            { id: 37, name: 'Grazi Massafera' }, { id: 38, name: 'Bruna Marquezine' },
            { id: 39, name: 'Sabrina Sato' }, { id: 40, name: 'Tirullipa' },
            { id: 41, name: 'Gretchen' }, { id: 42, name: 'Joelma' },
            { id: 43, name: 'Zeca Pagodinho' }, { id: 44, name: 'Leonardo (Cantor)' },
            { id: 45, name: 'Gusttavo Lima' }, { id: 46, name: 'Marília Mendonça' },
            { id: 47, name: 'Jorge Ben Jor' }, { id: 48, name: 'Caetano Veloso' },
            { id: 49, name: 'Gilberto Gil' }, { id: 50, name: 'Djavan' },
            // Fictícios / Desenhos / Clássicos BR
            { id: 51, name: 'Mônica' }, { id: 52, name: 'Cebolinha' },
            { id: 53, name: 'Cascão' }, { id: 54, name: 'Magali' },
            { id: 55, name: 'Chico Bento' }, { id: 56, name: 'Sítio do Picapau Amarelo' },
            { id: 57, name: 'Emília (Boneca)' }, { id: 58, name: 'Visconde de Sabugosa' },
            { id: 59, name: 'Cuca' }, { id: 60, name: 'Saci Pererê' },
            { id: 61, name: 'Curupira' }, { id: 62, name: 'Louro José' },
            { id: 63, name: 'Didi Mocó' }, { id: 64, name: 'Vovó Mafalda' },
            { id: 65, name: 'Bozo' }, { id: 66, name: 'Galo Cego' },
            { id: 67, name: 'Caneta Azul (Manoel Gomes)' }, { id: 68, name: 'Bambam' },
            { id: 69, name: 'Nazaré Tedesco' }, { id: 70, name: 'Carminha' },
            { id: 71, name: 'Fofão' }, { id: 72, name: 'Dollynho' },
            { id: 73, name: 'Agostinho Carrara' }, { id: 74, name: 'Bebel (A Favorita)' },
            { id: 75, name: 'Seu Boneco' }, { id: 76, name: 'Rolando Lero' },
            { id: 77, name: 'Ciro Bottini' }, { id: 78, name: 'Gugu Liberato' },
            { id: 79, name: 'Hebe Camargo' }, { id: 80, name: 'Chacrinha' },
            { id: 81, name: 'Dercy Gonçalves' }, { id: 82, name: 'Ziraldo' },
            { id: 83, name: 'Menino Maluquinho' }, { id: 84, name: 'Capitão Nascimento' },
            { id: 85, name: 'Dadá Maravilha' }, { id: 86, name: 'Vampeta' },
            { id: 87, name: 'Galvão Bueno' }, { id: 88, name: 'Craque Neto' },
            { id: 89, name: 'Inês Brasil' }, { id: 90, name: 'Luva de Pedreiro' },
            { id: 91, name: 'Narcisa Tamborindeguy' }, { id: 92, name: 'Pedro Bial' },
            { id: 93, name: 'Ratinho' }, { id: 94, name: 'Datena' },
            { id: 95, name: 'Sônia Abrão' }, { id: 96, name: 'Cristiano Araújo' },
            { id: 97, name: 'Felipe Neto' }, { id: 98, name: 'Gkay' },
            { id: 99, name: 'Virginia Fonseca' }, { id: 100, name: 'Carlinhos Maia' }
        ]
    },
    {
        id: 'internacionais',
        title: 'Internacionais & Fictícios',
        icon: '🌎',
        items: [
            // Astros de Hollywood e Música
            { id: 101, name: 'Leonardo DiCaprio' }, { id: 102, name: 'Beyoncé' },
            { id: 103, name: 'Tom Cruise' }, { id: 104, name: 'Taylor Swift' },
            { id: 105, name: 'Brad Pitt' }, { id: 106, name: 'Rihanna' },
            { id: 107, name: 'Will Smith' }, { id: 108, name: 'Lady Gaga' },
            { id: 109, name: 'Elon Musk' }, { id: 110, name: 'Bill Gates' },
            { id: 111, name: 'Lionel Messi' }, { id: 112, name: 'Cristiano Ronaldo' },
            { id: 113, name: 'Michael Jordan' }, { id: 114, name: 'LeBron James' },
            { id: 115, name: 'Madonna' }, { id: 116, name: 'Michael Jackson' },
            { id: 117, name: 'Elvis Presley' }, { id: 118, name: 'Freddie Mercury' },
            { id: 119, name: 'Justin Bieber' }, { id: 120, name: 'Ariana Grande' },
            { id: 121, name: 'Barack Obama' }, { id: 122, name: 'Donald Trump' },
            { id: 123, name: 'Angelina Jolie' }, { id: 124, name: 'Jennifer Aniston' },
            { id: 125, name: 'The Rock' }, { id: 126, name: 'Jackie Chan' },
            { id: 127, name: 'Arnold Schwarzenegger' }, { id: 128, name: 'Sylvester Stallone' },
            { id: 129, name: 'Meryl Streep' }, { id: 130, name: 'Morgan Freeman' },
            { id: 131, name: 'Robert Downey Jr.' }, { id: 132, name: 'Chris Evans' },
            { id: 133, name: 'Scarlett Johansson' }, { id: 134, name: 'Margot Robbie' },
            { id: 135, name: 'Zendaya' }, { id: 136, name: 'Tom Holland' },
            { id: 137, name: 'Keanu Reeves' }, { id: 138, name: 'Johnny Depp' },
            { id: 139, name: 'Katy Perry' }, { id: 140, name: 'Ed Sheeran' },
            { id: 141, name: 'Bruno Mars' }, { id: 142, name: 'Adele' },
            { id: 143, name: 'Selena Gomez' }, { id: 144, name: 'Kim Kardashian' },
            { id: 145, name: 'Kylie Jenner' }, { id: 146, name: 'Lewis Hamilton' },
            { id: 147, name: 'Usain Bolt' }, { id: 148, name: 'Mike Tyson' },
            { id: 149, name: 'Stephen Hawking' }, { id: 150, name: 'Albert Einstein' },
            // Fictícios / Desenhos Populares
            { id: 151, name: 'Mickey Mouse' }, { id: 152, name: 'Pernalonga' },
            { id: 153, name: 'Pateta' }, { id: 154, name: 'Pato Donald' },
            { id: 155, name: 'Popeye' }, { id: 156, name: 'Olívia Palito' },
            { id: 157, name: 'Scooby-Doo' }, { id: 158, name: 'Salsicha' },
            { id: 159, name: 'Tom & Jerry' }, { id: 160, name: 'Pica-Pau' },
            { id: 161, name: 'Homer Simpson' }, { id: 162, name: 'Bart Simpson' },
            { id: 163, name: 'Bob Esponja' }, { id: 164, name: 'Patrick Estrela' },
            { id: 165, name: 'Shrek' }, { id: 166, name: 'Burro' },
            { id: 167, name: 'Batman' }, { id: 168, name: 'Superman' },
            { id: 169, name: 'Homem-Aranha' }, { id: 170, name: 'Coringa' },
            { id: 171, name: 'Darth Vader' }, { id: 172, name: 'Yoda' },
            { id: 173, name: 'Harry Potter' }, { id: 174, name: 'Hermione Granger' },
            { id: 175, name: 'Voldemort' }, { id: 176, name: 'Sherlock Holmes' },
            { id: 177, name: 'Jack Sparrow' }, { id: 178, name: 'Indiana Jones' },
            { id: 179, name: 'James Bond' }, { id: 180, name: 'Lara Croft' },
            { id: 181, name: 'Pikachu' }, { id: 182, name: 'Goku' },
            { id: 183, name: 'Naruto' }, { id: 184, name: 'Sailor Moon' },
            { id: 185, name: 'Mário' }, { id: 186, name: 'Sonic' },
            { id: 187, name: 'Wolverine' }, { id: 188, name: 'Mulher Maravilha' },
            { id: 189, name: 'Elsa' }, { id: 190, name: 'Buzz Lightyear' },
            { id: 191, name: 'Woody' }, { id: 192, name: 'Simba' },
            { id: 193, name: 'Ursinho Pooh' }, { id: 194, name: 'Garfield' },
            { id: 195, name: 'Snoopy' }, { id: 196, name: 'Hello Kitty' },
            { id: 197, name: 'Chaves' }, { id: 198, name: 'Quico' },
            { id: 199, name: 'Seu Madruga' }, { id: 200, name: 'Chapolin Colorado' },
            { id: 201, name: 'Chucky' }, { id: 202, name: 'Pennywise' },
            { id: 203, name: 'Wednesday (Wandinha)' }, { id: 204, name: 'Barbie' },
            { id: 205, name: 'Jack Skellington' }, { id: 206, name: 'Lilo & Stitch' },
            { id: 207, name: 'Gru (Minions)' }, { id: 208, name: 'Master Chief' },
            { id: 209, name: 'Kratos' }, { id: 210, name: 'Geralt de Rivia' }
        ]
    }
];

export const ALL_CELEBS = CATEGORIES.flatMap(cat => cat.items);