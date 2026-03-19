export interface VocabWord {
  term: string;
  definition: string;
  example?: string;
  lesson: number;
  difficulty?: "easy" | "medium" | "hard";
  synonyms?: string[];
  antonyms?: string[];
}

export interface LiteraryDevice {
  name: string;
  definition: string;
  example: string;
}

export interface ReadingPassage {
  title: string;
  topic: string;
  content: string;
  lesson: number;
}

// Vocabulary from Ann Kenny's lessons (Jan-Mar 2026)
export const vocabularyWords: VocabWord[] = [
  // Lesson 1 - General vocabulary
  { term: "Elaborate", definition: "To develop or present in detail; complex and detailed", example: "The architect created an elaborate design for the new museum.", lesson: 1, difficulty: "medium", synonyms: ["detailed", "intricate", "complex"], antonyms: ["simple", "plain"] },
  { term: "Concurrent", definition: "Existing, happening, or done at the same time", example: "The two concerts were concurrent, so we had to choose one.", lesson: 1, difficulty: "hard", synonyms: ["simultaneous", "parallel"], antonyms: ["sequential", "separate"] },
  { term: "Ambiguous", definition: "Open to more than one interpretation; not clear", example: "The ending of the story was ambiguous—readers couldn't tell if the hero survived.", lesson: 1, difficulty: "medium", synonyms: ["vague", "unclear", "uncertain"], antonyms: ["clear", "definite", "obvious"] },
  { term: "Infer", definition: "To deduce or conclude from evidence and reasoning rather than from explicit statements", example: "From the dark clouds, we can infer that it will rain soon.", lesson: 1, difficulty: "medium", synonyms: ["deduce", "conclude", "gather"], antonyms: ["state", "declare"] },
  { term: "Convey", definition: "To communicate or make known; to transport or carry to a place", example: "The author uses imagery to convey a sense of loneliness.", lesson: 1, difficulty: "easy", synonyms: ["communicate", "express", "transmit"], antonyms: ["conceal", "withhold"] },

  // Lesson 2 - Reading & comprehension vocabulary
  { term: "Narrative", definition: "A spoken or written account of connected events; a story", example: "The documentary followed a compelling narrative about ocean life.", lesson: 2, difficulty: "easy", synonyms: ["story", "account", "tale"], antonyms: [] },
  { term: "Perspective", definition: "A particular attitude or way of regarding something; a point of view", example: "The novel is told from the perspective of a young girl.", lesson: 2, difficulty: "medium", synonyms: ["viewpoint", "standpoint", "outlook"], antonyms: [] },
  { term: "Context", definition: "The circumstances that form the setting for an event, statement, or idea", example: "You need to understand the historical context to appreciate the poem.", lesson: 2, difficulty: "medium", synonyms: ["background", "setting", "circumstances"], antonyms: [] },
  { term: "Summarize", definition: "To give a brief statement of the main points", example: "Can you summarize the article in two sentences?", lesson: 2, difficulty: "easy", synonyms: ["recap", "outline", "condense"], antonyms: ["elaborate", "expand"] },
  { term: "Theme", definition: "The central topic or message of a text", example: "The theme of the story is the importance of perseverance.", lesson: 2, difficulty: "easy", synonyms: ["topic", "subject", "motif"], antonyms: [] },

  // Lesson 3 - Analytical vocabulary
  { term: "Analyze", definition: "To examine in detail the elements or structure of something", example: "We need to analyze the poem's use of figurative language.", lesson: 3, difficulty: "medium", synonyms: ["examine", "study", "investigate"], antonyms: ["ignore", "overlook"] },
  { term: "Evidence", definition: "Facts or information indicating whether a belief or proposition is true or valid", example: "The detective gathered evidence at the scene of the crime.", lesson: 3, difficulty: "easy", synonyms: ["proof", "data", "facts"], antonyms: ["speculation", "opinion"] },
  { term: "Claim", definition: "A statement that something is the case, typically without providing evidence at first", example: "The author's main claim is that technology improves education.", lesson: 3, difficulty: "medium", synonyms: ["assertion", "argument", "statement"], antonyms: ["denial", "retraction"] },
  { term: "Cite", definition: "To quote or reference as evidence for an argument", example: "Always cite your sources when writing a research paper.", lesson: 3, difficulty: "medium", synonyms: ["quote", "reference", "mention"], antonyms: [] },
  { term: "Contrast", definition: "To compare in order to show differences", example: "The essay contrasts life in the city with life in the countryside.", lesson: 3, difficulty: "easy", synonyms: ["compare", "differentiate", "distinguish"], antonyms: ["equate", "liken"] },

  // Lesson 4 - Literary devices vocabulary
  { term: "Metaphor", definition: "A figure of speech that describes something by saying it IS something else", example: "'Time is money' is a metaphor comparing time to a valuable resource.", lesson: 4, difficulty: "medium", synonyms: ["figure of speech", "comparison"], antonyms: ["literal statement"] },
  { term: "Simile", definition: "A figure of speech comparing two things using 'like' or 'as'", example: "'Her smile was like sunshine' is a simile.", lesson: 4, difficulty: "easy", synonyms: ["comparison", "analogy"], antonyms: [] },
  { term: "Cliché", definition: "An overused phrase or opinion that has lost its original impact", example: "'Every cloud has a silver lining' is a cliché.", lesson: 4, difficulty: "medium", synonyms: ["platitude", "truism", "stereotype"], antonyms: ["original", "novel"] },
  { term: "Imagery", definition: "Visually descriptive or figurative language that appeals to the senses", example: "The poet used vivid imagery of crashing waves and salty air.", lesson: 4, difficulty: "medium", synonyms: ["description", "visualization", "depiction"], antonyms: [] },
  { term: "Tone", definition: "The general character or attitude of a piece of writing", example: "The tone of the letter was formal and serious.", lesson: 4, difficulty: "easy", synonyms: ["mood", "attitude", "manner"], antonyms: [] },

  // Lesson 5 - Historical/academic vocabulary
  { term: "Chronological", definition: "Arranged in the order of time; following the order in which events happened", example: "The textbook presents events in chronological order.", lesson: 5, difficulty: "medium", synonyms: ["sequential", "ordered", "temporal"], antonyms: ["random", "unordered"] },
  { term: "Era", definition: "A long and distinct period of history with particular characteristics", example: "The Roman era lasted for centuries.", lesson: 5, difficulty: "easy", synonyms: ["age", "epoch", "period"], antonyms: [] },
  { term: "Decline", definition: "A gradual decrease in strength, numbers, or quality; to diminish", example: "The decline of the Roman Empire took centuries.", lesson: 5, difficulty: "easy", synonyms: ["decrease", "deterioration", "downturn"], antonyms: ["growth", "rise", "increase"] },
  { term: "Conquest", definition: "The act of conquering a place or people by force", example: "The conquest of new territories expanded the empire.", lesson: 5, difficulty: "medium", synonyms: ["victory", "takeover", "subjugation"], antonyms: ["defeat", "surrender"] },
  { term: "Civilization", definition: "An advanced stage of human social development and organization", example: "Ancient Egyptian civilization produced remarkable architecture.", lesson: 5, difficulty: "easy", synonyms: ["society", "culture", "community"], antonyms: ["barbarism"] },

  // Lesson 6 - Music & culture vocabulary
  { term: "Genre", definition: "A category of artistic composition characterized by similarities in form, style, or subject", example: "Blues is a genre of music that originated in the American South.", lesson: 6, difficulty: "medium", synonyms: ["category", "type", "style"], antonyms: [] },
  { term: "Origin", definition: "The point or place where something begins or is created", example: "The origin of jazz can be traced to New Orleans.", lesson: 6, difficulty: "easy", synonyms: ["source", "beginning", "root"], antonyms: ["end", "conclusion"] },
  { term: "Influence", definition: "The capacity to have an effect on someone's character, development, or behavior", example: "African musical traditions had a strong influence on the blues.", lesson: 6, difficulty: "easy", synonyms: ["impact", "effect", "sway"], antonyms: [] },
  { term: "Expression", definition: "The process of making known one's thoughts or feelings", example: "Music is a powerful form of personal expression.", lesson: 6, difficulty: "easy", synonyms: ["communication", "articulation", "statement"], antonyms: ["suppression", "concealment"] },
  { term: "Tradition", definition: "A long-established custom or belief passed from generation to generation", example: "Storytelling is an important tradition in many cultures.", lesson: 6, difficulty: "easy", synonyms: ["custom", "practice", "heritage"], antonyms: ["innovation", "novelty"] },

  // Lesson 7 - Advanced vocabulary
  { term: "Determine", definition: "To discover the facts about something; to establish exactly by research or calculation", example: "Scientists worked to determine the cause of the disease.", lesson: 7, difficulty: "medium", synonyms: ["discover", "ascertain", "establish"], antonyms: [] },
  { term: "Relevant", definition: "Closely connected or appropriate to what is being discussed", example: "Only include information that is relevant to your argument.", lesson: 7, difficulty: "medium", synonyms: ["pertinent", "applicable", "related"], antonyms: ["irrelevant", "unrelated"] },
  { term: "Sufficient", definition: "Enough; adequate for a particular purpose", example: "Is there sufficient evidence to support your claim?", lesson: 7, difficulty: "medium", synonyms: ["enough", "adequate", "ample"], antonyms: ["insufficient", "inadequate", "lacking"] },
  { term: "Distinguish", definition: "To recognize or treat as different; to perceive a difference", example: "It's important to distinguish between facts and opinions.", lesson: 7, difficulty: "medium", synonyms: ["differentiate", "discern", "tell apart"], antonyms: ["confuse", "conflate"] },
  { term: "Integrate", definition: "To combine one thing with another so they become a whole", example: "The essay integrates quotes from the text to support its argument.", lesson: 7, difficulty: "hard", synonyms: ["combine", "merge", "incorporate"], antonyms: ["separate", "divide", "isolate"] },

  // Lesson 8 - Standardized test vocabulary
  { term: "Predominant", definition: "Present as the strongest or main element; having the greatest influence", example: "The predominant theme in the novel is the struggle for identity.", lesson: 8, difficulty: "hard", synonyms: ["dominant", "primary", "chief"], antonyms: ["minor", "secondary", "subordinate"] },
  { term: "Imply", definition: "To suggest something without directly stating it", example: "The author implies that the character is hiding something.", lesson: 8, difficulty: "medium", synonyms: ["suggest", "hint", "indicate"], antonyms: ["state", "declare", "express"] },
  { term: "Assertion", definition: "A confident and forceful statement of fact or belief", example: "The speaker made a bold assertion about climate change.", lesson: 8, difficulty: "hard", synonyms: ["claim", "declaration", "statement"], antonyms: ["denial", "question"] },
  { term: "Substantiate", definition: "To provide evidence to support or prove the truth of something", example: "You must substantiate your claims with textual evidence.", lesson: 8, difficulty: "hard", synonyms: ["verify", "confirm", "prove"], antonyms: ["disprove", "refute"] },
  { term: "Elicit", definition: "To draw out a response or reaction from someone", example: "The teacher's question was designed to elicit critical thinking.", lesson: 8, difficulty: "hard", synonyms: ["evoke", "provoke", "extract"], antonyms: ["suppress", "stifle"] },
];

export const literaryDevices: LiteraryDevice[] = [
  { name: "Metaphor", definition: "A figure of speech that directly compares two unlike things by saying one IS the other (without using 'like' or 'as').", example: "'The world is a stage' — Shakespeare compares the world directly to a stage." },
  { name: "Simile", definition: "A figure of speech that compares two things using 'like' or 'as'.", example: "'Her voice was as smooth as silk' — comparing voice to silk using 'as'." },
  { name: "Cliché", definition: "An overused expression that has lost its original meaning or impact.", example: "'At the end of the day' — used so often it no longer feels fresh or meaningful." },
  { name: "Imagery", definition: "Language that appeals to the five senses (sight, sound, smell, taste, touch) to create vivid mental pictures.", example: "'The golden sun melted into the crimson horizon' — appeals to sight with color descriptions." },
  { name: "Personification", definition: "Giving human qualities or characteristics to non-human things or ideas.", example: "'The wind whispered through the trees' — wind can't actually whisper." },
  { name: "Alliteration", definition: "The repetition of the same initial consonant sound in a series of words.", example: "'Peter Piper picked a peck of pickled peppers' — repetition of the 'p' sound." },
  { name: "Hyperbole", definition: "An extreme exaggeration used for emphasis or effect, not meant literally.", example: "'I've told you a million times' — obvious exaggeration for emphasis." },
  { name: "Onomatopoeia", definition: "A word that imitates the natural sound it represents.", example: "'The bees buzzed around the garden' — 'buzzed' sounds like the noise bees make." },
];

export const readingPassages: ReadingPassage[] = [
  {
    title: "Those Winter Sundays",
    topic: "Poetry Analysis",
    content: `Sundays too my father got up early
and put his clothes on in the blueblack cold,
then with cracked hands that ached
from labor in the weekday weather made
banked fires blaze. No one ever thanked him.

I'd wake and hear the cold splintering, breaking.
When the rooms were warm, he'd call,
and slowly I would rise and dress,
fearing the chronic angers of that house,

Speaking indifferently to him,
who had driven out the cold
and polished my good shoes as well.
What did I know, what did I know
of love's austere and lonely offices?

— Robert Hayden`,
    lesson: 4,
  },
  {
    title: "Mother to Son",
    topic: "Poetry Analysis",
    content: `Well, son, I'll tell you:
Life for me ain't been no crystal stair.
It's had tacks in it,
And splinters,
And boards torn up,
And places with no carpet on the floor—
Bare.
But all the time
I'se been a-climbin' on,
And reachin' landin's,
And turnin' corners,
And sometimes goin' in the dark
Where there ain't been no light.
So boy, don't you turn back.
Don't you set down on the steps
'Cause you finds it's kinder hard.
Don't you fall now—
For I'se still goin', honey,
I'se still climbin',
And life for me ain't been no crystal stair.

— Langston Hughes`,
    lesson: 4,
  },
  {
    title: "The Fall of the Roman Empire",
    topic: "Historical Reading Comprehension",
    content: `The Roman Empire, one of the most powerful civilizations in human history, did not collapse overnight. Its decline was a gradual process that took place over several centuries, driven by a combination of internal weaknesses and external pressures.

At its height in the 2nd century CE, the Roman Empire stretched from Britain in the northwest to Mesopotamia in the east, encompassing the entire Mediterranean world. Its roads, aqueducts, legal systems, and military organization were the most advanced of the ancient world.

However, by the 3rd century CE, cracks began to appear. The empire faced economic troubles as constant wars and overspending had significantly lightened imperial coffers. Heavy taxation and inflation widened the gap between rich and poor. Meanwhile, the empire struggled with political instability—in just 50 years, Rome had over 20 different emperors, most of whom met violent ends.

External threats compounded these internal problems. Germanic tribes and other groups, including the Huns led by Attila, pressed against Rome's borders. The famous sack of Rome in 410 CE by the Visigoths shocked the ancient world. Finally, in 476 CE, the last Roman emperor in the West was deposed, marking the traditional date for the fall of the Western Roman Empire.

The Eastern Roman Empire, known as the Byzantine Empire, would continue for nearly a thousand more years, preserving Roman culture and knowledge through the medieval period.`,
    lesson: 5,
  },
  {
    title: "The Birth of the Blues",
    topic: "Cultural Reading Comprehension",
    content: `The blues is one of the most important and influential genres in American music history. Born in the Deep South of the United States in the late 19th century, the blues grew out of the African American experience—rooted in work songs, spirituals, and field hollers that enslaved people had sung for generations.

The blues is characterized by its distinctive musical structure, typically following a twelve-bar pattern, and its use of "blue notes"—notes sung or played at a slightly lower pitch than standard for expressive purposes. But beyond its technical elements, the blues is fundamentally about emotional expression. Blues songs tell stories of hardship, heartbreak, longing, and resilience.

The Mississippi Delta is often considered the birthplace of the blues, with early artists like Robert Johnson, Muddy Waters, and B.B. King shaping the genre. As African Americans migrated northward during the Great Migration of the early to mid-20th century, they brought the blues with them, and the music evolved. Chicago became a major center for electric blues, with amplified instruments giving the music a harder, more powerful sound.

The influence of the blues extends far beyond its own genre. Rock and roll, jazz, R&B, and hip-hop all trace significant parts of their DNA back to the blues. Artists from Elvis Presley to the Rolling Stones to Beyoncé have drawn on blues traditions in their music. The blues remains a living, evolving art form—a testament to the creative power of turning pain into beauty.`,
    lesson: 6,
  },
];

export const standardizedTestTopics = [
  "Reading Comprehension",
  "Vocabulary in Context",
  "Literary Device Identification",
  "Main Idea & Supporting Details",
  "Author's Purpose & Tone",
  "Making Inferences",
  "Text Structure & Organization",
  "Compare & Contrast",
  "Cause & Effect",
  "Drawing Conclusions",
];
