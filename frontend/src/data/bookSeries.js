// frontend/src/data/bookSeries.js


const hardyBoysSeries = {
  name: "The Hardy Boys Series",
  description: "Follow teenage brothers Frank and Joe Hardy as they solve complex mysteries in their hometown of Bayport and beyond. Using their detective skills and wit, they uncover clues, chase down suspects, and help their detective father solve challenging cases.",
  author: "Franklin W. Dixon",
  genres: ["Mystery", "Adventure", "Fiction"],
  books: [
    // Due to large number of books, showing a few examples
    {
      id: "tower_treasure",
      title: "The Tower Treasure",
      description: "The Hardy Boys' first case involves the theft of a valuable collection from a mansion's tower, setting them on the path to becoming skilled detectives.",
      minAge: 8,
      maxAge: 15,
      tags: ["first case", "theft", "mansion mystery"]
    }
  ]
};

const narniaChronicles = {
  name: "The Chronicles of Narnia",
  description: "A classic fantasy series that transports readers to the magical world of Narnia, where talking animals, mythical creatures, and epic adventures await. The series weaves themes of courage, faith, and morality through enchanting tales.",
  author: "C.S. Lewis",
  genres: ["Fantasy", "Adventure", "Fiction"],
  books: [
    {
      id: "magicians_nephew",
      title: "The Magician's Nephew",
      description: "The origin story of Narnia, following Digory and Polly as they witness the creation of the magical world and inadvertently bring evil into the newly-born land.",
      minAge: 8,
      maxAge: 15,
      tags: ["origin story", "world creation", "magical rings", "Aslan"]
    }
  ]
};

const darthBaneSeries = {
  name: "Star Wars: Darth Bane Trilogy",
  description: "Set in the Star Wars universe, this dark trilogy follows the rise of Darth Bane, who establishes the Rule of Two that shapes Sith philosophy for generations to come.",
  author: "Drew Karpyshyn",
  genres: ["Science Fiction", "Fantasy", "Fiction"],
  books: [
    {
      id: "path_destruction",
      title: "Darth Bane: Path of Destruction",
      description: "Chronicles the transformation of a young miner into the legendary Sith Lord Darth Bane, reshaping the future of the dark side of the Force.",
      minAge: 8,
      maxAge: 15,
      tags: ["Star Wars", "Sith", "dark side", "origin story"]
    },
    {
      id: "rule_two",
      title: "Darth Bane: Rule of Two",
      description: "Follows Darth Bane and his apprentice as they work to implement the new Sith philosophy while evading the Jedi.",
      minAge: 8,
      maxAge: 15,
      tags: ["Star Wars", "Sith", "master and apprentice", "Rule of Two"]
    }
  ]
};

const inheritanceCycle = {
  name: "The Inheritance Cycle",
  description: "An epic fantasy series following the journey of Eragon, a young farm boy who becomes the first Dragon Rider in a generation, and his dragon Saphira as they fight against the evil Empire.",
  author: "Christopher Paolini",
  genres: ["Fantasy", "Adventure", "Fiction"],
  books: [
    {
      id: "eragon",
      title: "Eragon",
      description: "A young farm boy finds a mysterious stone that hatches into a dragon, leading him on an epic journey to become a legendary Dragon Rider.",
      minAge: 12,
      maxAge: 28,
      tags: ["dragons", "magic", "coming of age", "Dragon Riders"]
    },
    {
      id: "eldest",
      title: "Eldest",
      description: "Eragon continues his training as a Dragon Rider with the elves while his cousin Roran defends their home village.",
      minAge: 8,
      maxAge: 15,
      tags: ["dragons", "elves", "training", "parallel storylines"]
    },
    {
      id: "brisingr",
      title: "Brisingr",
      description: "Eragon and Saphira face increasingly dangerous challenges as they continue their fight against the Empire.",
      minAge: 8,
      maxAge: 15,
      tags: ["dragons", "war", "magic", "resistance"]
    }
  ]
};

// Example of creating the Redwall series
const redwallSeries = {
  name: "Redwall Series",
  description: "Set in the medieval fantasy world of Mossflower, the Redwall series chronicles the adventures of heroic woodland creatures who defend their peaceful abbey home against villainous vermin. Each book weaves tales of courage, friendship, and good triumphing over evil through epic quests and battles.",
  author: "Brian Jacques",
  genres: ["Fantasy", "Adventure", "Fiction"],
  books: [
    {
      id: "rogue_crew",
      title: "The Rogue Crew",
      description: "The final Redwall novel, featuring the brave hares of the Long Patrol joining forces with a crew of sea otters to battle pirate foxes along the River Moss.",
      minAge: 8,
      maxAge: 15,
      tags: ["sea adventures", "pirates", "Long Patrol", "otters", "final book"]
    },
    {
      id: "sable_quean",
      title: "The Sable Quean",
      description: "When young woodland creatures are kidnapped from Redwall Abbey, Buckler Kordyne and the Long Patrol must track down the evil Vilaya the Sable Quean.",
      minAge: 8,
      maxAge: 15,
      tags: ["kidnapping plot", "Long Patrol", "rescue mission"]
    }
    // We can continue with more books...
  ]
};



export const bookSeries = {
  redwallSeries,
  hardyBoysSeries,
  narniaChronicles,
  darthBaneSeries,
  inheritanceCycle
  // ...all the series definitions we created
};