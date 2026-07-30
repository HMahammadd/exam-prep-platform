import type { SatChoiceLabel, SatChartId, SatQuestion } from "@/types/sat-exam";

const SECTION = "Section 1: Reading and Writing";
const LABELS: SatChoiceLabel[] = ["A", "B", "C", "D"];

type ExamDraft = {
  module: 1 | 2;
  passage: string;
  passageImageUrl?: string;
  chartId?: SatChartId;
  questionText: string;
  choices: [string, string, string, string];
  correctAnswer: SatChoiceLabel;
  explanation: string;
};

const EXAM_2_DRAFTS: ExamDraft[] = [
  {
    module: 1,
    passage: `The intergenerational Bulgarian female choir group Bistritsa Babi has been working to preserve customary songs and dances from the Shopluk region of the country since 1939. Through these _____ performances, members of Bistritsa Babi hope to keep this centuries-old ritual of expression alive. In 2005, the group was added to the UNESCO List of Intangible Cultural Heritage for Eastern Europe.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `traditional`,
      `obscure`,
      `discreet`,
      `eccentric`,
    ],
    correctAnswer: "A",
    explanation: `The performances preserve customary songs and dances that have been practiced for generations, so 'traditional' is the most logical and precise description.`,
  },
  {
    module: 1,
    passage: `Located in the old city of Marrakesh, Jemaa el-Faa, the main square, is a marketplace and vibrant hub for residents and visitors alike. During the day, snake charmers and stalls selling beverages fill the square, while at night the _____ center is filled with throngs of people coming to hear storytellers tell traditional fables, watch the performances of magicians, and browse multiple booths offering herbal medicines. As the night goes on, dozens of food vendors set up their stalls to feed the crowds.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `formal`,
      `bustling`,
      `unpredictable`,
      `deserted`,
    ],
    correctAnswer: "B",
    explanation: `The square is crowded with storytellers, performers, shoppers, and food vendors. 'Bustling' means full of energetic activity and therefore fits the context.`,
  },
  {
    module: 1,
    passage: `When developing the procedure for LASIK eye surgery, inventor Gholam A. Peyman faced many obstacles in trying to create a way to use lasers on the delicate tissues within the eye without causing pain or scarring. Through many experiments, he was able to gather that using a flap of tissue instead of performing surgery on the surface of the cornea could greatly reduce the incidence of _____ of the procedure. Peyman was able to secure patents in the US for his ideas and furthered his research to help the field of ophthalmology.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `characteristics`,
      `prospects`,
      `efficacy`,
      `repercussions`,
    ],
    correctAnswer: "D",
    explanation: `The surrounding sentence refers to harmful effects such as pain and scarring. 'Repercussions' means consequences, especially negative ones, so it best completes the text.`,
  },
  {
    module: 1,
    passage: `The process of rainwater harvesting includes gathering and reserving rainwater instead of allowing it to trickle away. When it rains, water is collected from an awning or roof and _____ in a large vessel like a well or reservoir where it can drain back to the ground water source for things like domestic and livestock use.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `aggregated`,
      `dissipated`,
      `percolated`,
      `collaborated`,
    ],
    correctAnswer: "A",
    explanation: `'Aggregated' means gathered or collected into a whole. Rainwater is collected and stored together in a vessel, whereas 'dissipated' means dispersed and 'percolated' means filtered gradually through a material.`,
  },
  {
    module: 1,
    passage: `In 2012, thousands of scientists working at the Large Hadron Collider in Switzerland were finally able to _____ the existence of the long-predicted Higgs boson particle, first theorized as necessary in order to explain the mass of a fundamental particle by Peter Higgs and Francois Englert in 1964. These scientists confirmed a pattern of decay products that could be explained only by the Higgs boson particle.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `corroborate`,
      `exonerate`,
      `contextualize`,
      `postulate`,
    ],
    correctAnswer: "A",
    explanation: `To 'corroborate' is to confirm or support with evidence. The observed decay pattern provided evidence confirming the particle's existence.`,
  },
  {
    module: 1,
    passage: `A highly influential leader of the US civil rights movement, Martin Luther King Jr. _____ his commitment to nonviolent resistance by organizing and directing numerous peaceful protests and sit-ins across the United States in the 1960s: his actions revealed his unwavering dedication to advancing the cause of civil rights without resorting to violence.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `characterized`,
      `evinced`,
      `elided`,
      `gauged`,
    ],
    correctAnswer: "B",
    explanation: `'Evinced' means clearly demonstrated or revealed. King's peaceful protests demonstrated his commitment to nonviolent resistance.`,
  },
  {
    module: 1,
    passage: `An experiment headed by University of Wisconsin psychologist Sohad Murrar provides compelling evidence that individuals feel more inclusive toward other groups when they are informed that pro-diversity attitudes and behaviors are extremely popular among their peers. Students were presented with either a neutrally messaged poster or a poster that displayed fellow students of diverse ethnic backgrounds, a statement about valuing diversity, and statistics indicating their fellow students' strong support for the statement. The study found that students were more likely to embrace inclusive statements and reject racist statements even weeks after they were exposed to the pro-diversity poster.`,
    questionText: `Which choice best describes the function of the underlined sentence in the text as a whole?`,
    choices: [
      `To analyze the implications of the results of the experiment`,
      `To demonstrate the difficulty of assessing individuals' views on inclusivity and racism`,
      `To highlight a specific instance in which the findings of the experiment were confirmed`,
      `To describe certain aspects of the design and methodology of the experiment`,
    ],
    correctAnswer: "D",
    explanation: `The underlined sentence explains what the participants were shown and how the treatment group differed from the control group. It therefore describes the experiment's design and methodology.`,
  },
  {
    module: 1,
    passage: `The following text is adapted from Alphonse Daudet's short story 'The Siege of Berlin.' The narrator is a doctor, coming to the aid of a grandfather who has fallen unconscious. He had a fine face, magnificent teeth, a thick head of curly white hair, and though eighty years old did not look more than sixty. Near him his granddaughter knelt weeping. There was a strong family resemblance between them. Seeing them side by side, you thought of two beautiful Greek medals struck from the same matrix, but one old and worn and the other bright and clear-cut with all the brilliancy and smoothness of a first impression. I found the child's grief very touching.`,
    questionText: `According to the text, what is true about the granddaughter and grandfather?`,
    choices: [
      `They look alike.`,
      `They are of Greek heritage.`,
      `They look younger than their ages.`,
      `They are lying side-by-side.`,
    ],
    correctAnswer: "A",
    explanation: `The passage directly states that there was a 'strong family resemblance' between them and compares them to two medals made from the same mold.`,
  },
  {
    module: 1,
    passage: `Urbanization invariably results in a decrease in overall species diversity and abundance, though certain species seem to preternaturally thrive in city environments. Columba livia, the rock pigeon, is thought to be well-suited to survival in urbanized environments because of the anthropogenic food sources supplied in the form of refuse from restaurants. Thus, researchers Jeffrey A. Brown, Susannah B. Lehman, and colleagues hypothesized that the number of nearby restaurants might be a predictor of the abundance of rock pigeons in the area. They visited 57 sites during spring and winter for three years and logged the number of restaurants and the number of rock pigeons in the vicinity. Looking at the lines of best fit for the scatterplot of the compiled data, the researchers concluded that there is indeed a relationship between proximity to restaurants and abundance of rock pigeons and that this relationship was especially strong in the spring, noting that _____.`,
    chartId: "exam2-pigeons" as SatChartId,
    questionText: `Which choice most effectively uses data from the graph to complete the statement?`,
    choices: [
      `around ten rock pigeons were observed at a site with three restaurants within one kilometer, while around thirty rock pigeons were observed at a site with six restaurants within one kilometer.`,
      `around three rock pigeons were observed at a site with ten restaurants within one kilometer, while around six rock pigeons were observed at a site with thirty restaurants within one kilometer.`,
      `fewer than five rock pigeons were observed at a site with ten restaurants within one kilometer, while more than ten rock pigeons were observed at a site with thirty restaurants within one kilometer.`,
      `fewer than ten rock pigeons were observed at a site with five restaurants within one kilometer, while more than thirty rock pigeons were observed at a site with ten restaurants within one kilometer.`,
    ],
    correctAnswer: "C",
    explanation: `The spring line shows about 4 pigeons when there are 10 nearby restaurants and about 11 pigeons when there are 30. Those values demonstrate the strong positive relationship described in the passage.`,
  },
  {
    module: 1,
    passage: `Chandra Wickramasinghe, director of the University of Buckingham's Centre for Astrobiology, is an influential proponent of the controversial theory of panspermia, which suggests that life on Earth originated from microorganisms that were carried to our planet by comets or other celestial bodies. Wickramasinghe has argued for panspermia using several sources of scientific data including the detection of living microorganisms at extremely high altitudes in Earth's atmosphere and the confirmation of complex organic molecules in interstellar dust and comets.`,
    questionText: `Which choice best describes the main idea of the text?`,
    choices: [
      `Wickramasinghe's theory of panspermia is far too controversial to be accepted by other astrobiologists.`,
      `Wickramasinghe has presented evidence that life on Earth may in fact come from somewhere beyond Earth.`,
      `The preponderance of available scientific data strongly supports Wickramasinghe's theory of panspermia.`,
      `If microorganisms can survive at extremely high altitudes in Earth's atmosphere, then they can also survive space travel.`,
    ],
    correctAnswer: "B",
    explanation: `The text introduces Wickramasinghe's panspermia theory and summarizes the evidence he cites for an extraterrestrial origin of life. It does not claim that the theory is conclusively established.`,
  },
  {
    module: 1,
    passage: `C. difficile is a bacterium that causes an inflammation of the colon that can be life-threatening. The metabolic processes by which C. difficile takes advantage of a host's inflammatory process to increase toxin production are not well understood. Previously, higher levels of sorbitol (a sugar alcohol) were found to be released by the immune system during inflammation from toxin production. Thus, a team of researchers decided to investigate sorbitol metabolism in C. difficile and its effect on toxin production in mice. In the study, mice with C. difficile that ingested sorbitol were found to have lower levels of toxin production than mice that did not ingest sorbitol. One possible explanation is that metabolizing sorbitol prevents C. difficile from producing toxins.`,
    questionText: `Which finding, if true, would most directly strengthen the potential explanation?`,
    choices: [
      `C. difficile lacks the enzyme that metabolizes sorbitol and thus reduces its production of toxins when sorbitol is ingested.`,
      `C. difficile metabolizes sorbitol at a faster rate than it does other naturally occurring sugar alcohols.`,
      `Low levels of sorbitol reduce inflammation in mice and prevent toxin production.`,
      `Mice naturally produce sorbitol in their intestines and do not contract C. difficile.`,
    ],
    correctAnswer: "B",
    explanation: `The proposed explanation depends on C. difficile actually metabolizing sorbitol. Choice B is the only option that directly supports that metabolic link. Choice A contradicts the explanation by saying the bacterium lacks the necessary enzyme, while choices C and D offer unrelated or alternative explanations.`,
  },
  {
    module: 1,
    passage: `Scholars generally agree that amputations were dangerous and deadly prior to 10,000 years ago due to a lack of proper surgical tools and techniques. The earliest evidence of a successful limb-removal surgery was a 7,000-year-old skeleton found in France that had an amputation above the elbow. Recently, archeologists uncovered a 31,000-year-old skeleton with an amputated leg in Indonesia. Analysis of the early stone age skeleton shows that the amputation occurred when the man was just a child and lacked any evidence of infection. Thus, _____`,
    questionText: `Which choice most logically completes the text?`,
    choices: [
      `early stone age people must have had doctors who performed these successful amputations.`,
      `life as an amputee must have been difficult for early stone age people without access to postoperational care.`,
      `there is insufficient evidence to support that most amputations performed prior to 10,000 years ago were deadly.`,
      `early stone age people prior to 10,000 years ago may have been more advanced than was previously acknowledged.`,
    ],
    correctAnswer: "D",
    explanation: `A successful amputation 31,000 years ago, with no evidence of infection, suggests unexpectedly advanced surgical knowledge and care. The evidence does not justify the absolute claim in choice A.`,
  },
  {
    module: 1,
    passage: `In game theory, the prisoner's dilemma is a thought experiment in which two people who are isolated from each other each have the choice to betray the other. An individual who betrays the other person will experience a personal benefit; however, if both players choose to betray each other then they will both experience a worse punishment than if neither betrays the other. Game theorists generally agree that the choice to cooperate (that is, refusing to betray the other person) is irrational, as it defies one's self-interest; therefore, these game theorists suggest that _____`,
    questionText: `Which choice most logically completes the text?`,
    choices: [
      `it is more rational for one to betray the other participant.`,
      `both individuals should cooperate, as their punishment will be reduced.`,
      `people always act in their own self-interest, as it is the rational choice.`,
      `the thought experiment likely has limited relevance in everyday life.`,
    ],
    correctAnswer: "A",
    explanation: `The passage states that cooperation is considered irrational because it conflicts with individual self-interest. The corresponding rational choice, under that view, is to betray the other participant.`,
  },
  {
    module: 1,
    passage: `Karni Mata Temple is a Hindu temple located in the town of Deshnoke in India. The temple is dedicated to Karni Mata and is an important pilgrimage site. Numerous rats, known as kaba and considered holy, live in Karni Mata Temple, earning the temple _____ nickname, 'Temple of Rats.'`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `it's`,
      `its`,
      `their`,
      `they're`,
    ],
    correctAnswer: "B",
    explanation: `The blank requires the singular possessive pronoun referring to 'the temple.' 'Its' is possessive, whereas 'it's' means 'it is.'`,
  },
  {
    module: 1,
    passage: `In addition to her research into the effects of hormones, ultraviolet light, and chemotherapy agents on cell _____ Jewel Plummer Cobb served as dean at Connecticut College and Rutgers University and as president of California State University, Fullerton, where she led many projects expanding the school's facilities.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `division: biologist`,
      `division. Biologist`,
      `division biologist`,
      `division, biologist`,
    ],
    correctAnswer: "D",
    explanation: `The introductory phrase ending with 'cell division' must be followed by a comma. 'Biologist Jewel Plummer Cobb' then serves as the subject of the main clause.`,
  },
  {
    module: 1,
    passage: `Poetra Asantewa is a performer from Ghana who combines three elements to create her _____ lyrics incorporating social issues, vocalization evoking different emotions, and rhythms using soulful elements.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `pieces`,
      `pieces,`,
      `pieces:`,
      `pieces;`,
    ],
    correctAnswer: "C",
    explanation: `The words before the blank form a complete clause, and the material after the blank lists the three elements. A colon correctly introduces that list.`,
  },
  {
    module: 1,
    passage: `Compared to other Ukrainian scientists and mathematicians, _____ she has worked with differential equations, partial differential equations, and integrable systems in Dnipro, Cyprus, and Kyiv.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `there is a wide range of fields and Ukrainian cities that Olena Vaneeva has worked in:`,
      `many Ukrainian cities and fields have been home to Olena Vaneeva:`,
      `the range of fields and Ukrainian cities that Olena Vaneeva has worked in is very wide:`,
      `Olena Vaneeva has worked in a wide range of fields and Ukrainian cities:`,
    ],
    correctAnswer: "D",
    explanation: `The introductory phrase 'Compared to other Ukrainian scientists and mathematicians' must logically modify Olena Vaneeva, so her name must immediately follow it. The colon then correctly introduces examples of her fields and locations.`,
  },
  {
    module: 1,
    passage: `Astronaut William Anders was a member of the Apollo 8 mission, the first human spaceflight to reach the Moon and orbit it. During the mission, Anders took a photo of Earth rising above the lunar surface, an _____ was later named Earthrise.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `image, that`,
      `image,`,
      `image that`,
      `image`,
    ],
    correctAnswer: "C",
    explanation: `The noun phrase 'an image that was later named Earthrise' requires the relative pronoun 'that' with no comma because the clause identifies which image is being discussed.`,
  },
  {
    module: 1,
    passage: `French philosopher Denis Diderot was the chief editor of the Encyclopedie, which was completed by 1772. Motivated by the principles of the Enlightenment, the writers of the Encyclopedie _____ to compile all of the world's knowledge in a single resource available to the ordinary person.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `attempted`,
      `are attempting`,
      `will attempt`,
      `attempt`,
    ],
    correctAnswer: "A",
    explanation: `The passage discusses completed events in the past, so the simple past verb 'attempted' is consistent with the time frame.`,
  },
  {
    module: 1,
    passage: `As one of the most prominent French astrophysicists, Francoise Combes has contributed to research about how galaxies form and _____ she has studied the composition of galaxies and how they interact with each other.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `evolve; additionally,`,
      `evolve additionally`,
      `evolve, additionally,`,
      `evolve, additionally;`,
    ],
    correctAnswer: "A",
    explanation: `The sentence contains two independent clauses. A semicolon correctly separates them, and the conjunctive adverb 'additionally' is followed by a comma.`,
  },
  {
    module: 1,
    passage: `American avant-garde jazz composer and guitarist Mary Halvorson's musical discography includes Dragon's Head, an album created with bassist John Hebert and drummer Ches _____ a solo album; and Away with You, which featured pedal steel player Susan Alcorn, cellist Tomeka Reid, and saxophonist Ingrid Laubrock.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `Smith; Meltframe,`,
      `Smith; Meltframe`,
      `Smith, Meltframe,`,
      `Smith, Meltframe:`,
    ],
    correctAnswer: "A",
    explanation: `The sentence presents a complex series whose items contain internal commas. The semicolon separates Dragon's Head from Meltframe, while the comma after 'Meltframe' introduces the supplemental description 'a solo album.' Transition`,
  },
  {
    module: 1,
    passage: `Mice were studied in an experiment focused on the relationship between room temperature and cancer growth. Cooler room temperatures were found to stimulate fat cells that eradicate the sugar molecules that sustain cancer cells. _____ the cancer cells started to die off in the mice exposed to cooler room temperatures.`,
    questionText: `Which choice completes the text with the most logical transition?`,
    choices: [
      `Consequently,`,
      `For example,`,
      `However,`,
      `In comparison,`,
    ],
    correctAnswer: "A",
    explanation: `The death of the cancer cells is presented as a result of the cooler temperatures stimulating fat cells that remove the cancer cells' sugar supply. 'Consequently' signals that cause-and-effect relationship. Expression of Ideas`,
  },
  {
    module: 1,
    passage: `While researching a topic, a student has taken the following notes:
• Satyajit Ray was an Indian filmmaker.
• He is well-known for The Apu Trilogy.
• The first film in the trilogy, Pather Panchali, is about the childhood of a small Bengali boy named Apu.
• The second film, Aparajito, depicts Apu in his adolescence and his relationship to both his mother and their home.
• In Apur Sansar, the third film, adult Apu marries Aparna and has a son, Kajal.`,
    questionText: `The student wants to emphasize how Apu changed throughout the trilogy. Which choice most effectively uses relevant information from the notes to accomplish this goal?`,
    choices: [
      `Apu went from being a child in Pather Panchali to an adult with his own family in Apur Sansar.`,
      `Satyajit Ray, an Indian filmmaker, made The Apu Trilogy about a boy named Apu.`,
      `The three films of The Apu Trilogy are Pather Panchali, Aparajito, and Apur Sansar.`,
      `The character Apu grew up in Bengal and eventually marries and has a son.`,
    ],
    correctAnswer: "A",
    explanation: `Choice A directly contrasts Apu's childhood in the first film with his adulthood and family life in the third, clearly emphasizing his development across the trilogy.`,
  },
  {
    module: 1,
    passage: `While researching a topic, a student has taken the following notes:
• Haenyeo are female divers on Jeju Island, a Korean province.
• Haenyeo earn money by harvesting mollusks and shellfish, such as abalone, sea urchins, and oysters.
• They dive without the use of oxygen masks and tanks.
• They can hold their breath for over three minutes.
• They can dive up to 30 meters below the surface of the water.
• Jellyfish, sharks, and poor weather are different dangers they face while diving.`,
    questionText: `The student wants to emphasize the abilities of haenyeo. Which choice most effectively uses relevant information from the notes to accomplish this goal?`,
    choices: [
      `Haenyeo are female divers on Jeju Island who harvest shellfish.`,
      `While diving, haenyeo contend with jellyfish, sharks, and poor weather.`,
      `Haenyeo earn money by selling abalone, sea urchins, and oysters, which they harvest by diving without oxygen masks and tanks.`,
      `Haenyeo can dive 30 meters below the surface and hold their breath for over three minutes.`,
    ],
    correctAnswer: "D",
    explanation: `Choice D focuses exclusively on two impressive physical abilities, exactly matching the student's goal.`,
  },
  {
    module: 1,
    passage: `While researching a topic, a student has taken the following notes:
• Heliconian Hall was built in 1876 as the Olivet Congregational Church.
• Heliconian Hall is in the Yorkville neighborhood of Toronto.
• The Heliconian Club purchased and renamed Heliconian Hall in 1923.
• The Heliconian Club's membership includes women professional artists.
• Heliconian Hall hosts music, art, dance, drama, and literature events.`,
    questionText: `The student wants to describe the history of Heliconian Hall to an audience familiar with the Heliconian Club. Which choice most effectively uses relevant information from the notes to accomplish this goal?`,
    choices: [
      `Heliconian Hall was purchased in 1923 by the Heliconian Club, an organization which includes women professional artists.`,
      `Heliconian Hall, located in the Yorkville neighborhood of Toronto, hosts music, art, dance, drama, and literature events.`,
      `Heliconian Hall, formerly known as the Olivet Congregational Church, is in the Yorkville neighborhood of Toronto.`,
      `Heliconian Hall, built as the Olivet Congregational Church in 1876, was purchased and renamed by the Heliconian Club in 1923.`,
    ],
    correctAnswer: "D",
    explanation: `Choice D supplies the key chronological facts about the building's origin and later acquisition and renaming. Because the audience already knows the club, background about its membership is unnecessary.`,
  },
  {
    module: 1,
    passage: `While researching a topic, a student has taken the following notes:
• Evan Adams is an Indigenous Canadian actor.
• He is well-known for his role as Thomas in the film Smoke Signals.
• The film was released in 1998.
• It is about two friends, Thomas and Victor, and their complicated relationships with Victor's father, Arnold.
• Adams is also known for his role as Seymour in The Business of Fancydancing (2002).`,
    questionText: `The student wants to introduce Evan Adams and his role in Smoke Signals to a new audience. Which choice most effectively uses relevant information from the notes to accomplish this goal?`,
    choices: [
      `Evan Adams, an Indigenous Canadian actor, has starred as Thomas in Smoke Signals and Seymour in The Business of Fancydancing.`,
      `Smoke Signals, released in 1998, explores the complicated relationships of friends Thomas and Victor.`,
      `Evan Adams starred in the film Smoke Signals before he starred in The Business of Fancydancing.`,
      `Indigenous Canadian actor Evan Adams starred as Thomas in the 1998 film Smoke Signals, which depicts two friends, Thomas and Victor, and their complicated relationship with Victor's father, Arnold.`,
    ],
    correctAnswer: "D",
    explanation: `Choice D introduces Adams, identifies his role and the film's year, and gives relevant context about the film. It fully addresses both parts of the student's goal.`,
  },
  {
    module: 1,
    passage: `While researching a topic, a student has taken the following notes:
• Marie Byrd Land is an unclaimed region of Antarctica.
• Construction of Byrd Station in Marie Byrd Land was begun in 1956 by the US.
• Byrd Station was abandoned in 1972.
• John Carpenter used Byrd Station as a model for an Antarctic station in crisis for his movie The Thing.
• James Rollins used Byrd Station as a model for an Antarctic station in crisis for his novel The 6th Extinction.`,
    questionText: `The student wants to highlight a similarity between fictional depictions of a real-world location. Which choice most effectively uses relevant information from the notes to accomplish this goal?`,
    choices: [
      `Both John Carpenter's movie The Thing and James Rollins's novel The 6th Extinction used Byrd Station as a model for an Antarctic station in crisis.`,
      `In 1956, the US began construction of Byrd Station in Marie Byrd Land, an unclaimed region of Antarctica.`,
      `Abandoned in 1972, Byrd Station was the model for an Antarctic station in crisis in John Carpenter's The Thing.`,
      `John Carpenter used Byrd Station as a model for an Antarctic station in crisis for his movie The Thing; however, James Rollins used Byrd Station as a model for an Antarctic station in crisis for his novel The 6th Extinction.`,
    ],
    correctAnswer: "A",
    explanation: `Choice A explicitly emphasizes the shared feature of the two fictional works. Choice D presents the same similarity with the contrasting transition 'however,' which is illogical.`,
  },
  {
    module: 2,
    passage: `During World War II, hundreds of scientists, including many prominent physicists such as Robert Oppenheimer, _____ the Manhattan Project, pooling their efforts and expertise in order to develop the first bombs that successfully exploited the tremendous power of nuclear energy.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `collaborated on`,
      `invested with`,
      `plotted against`,
      `learned from`,
    ],
    correctAnswer: "A",
    explanation: `"Collaborated on" means worked together on a shared project. The sentence states that the scientists pooled their efforts and expertise, so this phrase is the precise fit. _________________________________________________________________________________________________________`,
  },
  {
    module: 2,
    passage: `Advising farmers on how to prevent the disruption of soil due to plowing, experts in agriculture have recommended the method of no-till farming. This _____ allows for soil to remain settled while seeds are planted, unlike traditional practices in which the soil is disturbed in order for new crops to be grown, thus making sowing easier to manage. Through no-till farming, agriculturalists are able to grow new batches with very little labor or equipment required.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `intention`,
      `agenda`,
      `distraction`,
      `technique`,
    ],
    correctAnswer: "D",
    explanation: `The passage describes no-till farming as a method or procedure. "Technique" is the only choice that accurately refers to a practical farming method. _________________________________________________________________________________________________________`,
  },
  {
    module: 2,
    passage: `Ethologists and beekeepers use the phrase "waggle dance" to describe the movement a bee makes in order to communicate with other bees in the colony about the location of resources. This silent _____ of information among the bees allows them to pass on knowledge of how close or far away a source is and what direction it is in. The source being broadcasted can be a site for possible nesting or an opportunity for sustenance.

Exam 10 M2`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `transmission`,
      `confidence`,
      `prolongation`,
      `devastation`,
    ],
    correctAnswer: "A",
    explanation: `A "transmission" is the act of sending or communicating information. The waggle dance silently conveys information among bees, so "transmission" is precise. _________________________________________________________________________________________________________`,
  },
  {
    module: 2,
    passage: `Chronic hepatitis B (CHB) can _____ affect Asians Americans and Pacific Islanders (AAPIs), who are not affected by most other major hepatitis strains. While everyone should be screened for hepatitis viruses, AAPIs are strongly encouraged to get tested and treated for chronic hepatitis B.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `disproportionately`,
      `exclusively`,
      `essentially`,
      `initially`,
    ],
    correctAnswer: "A",
    explanation: `"Disproportionately" means to a greater degree relative to other groups. The recommendation that AAPIs receive particular attention indicates that CHB affects them at an unusually high rate, not exclusively. _________________________________________________________________________________________________________`,
  },
  {
    module: 2,
    passage: `There are countless stories of people whose hair turns white overnight from fright in a condition called canities subita, also known as Marie Antoinette syndrome. Scientists _____ this as historical fiction and explain that visible hair is dead material that can be changed by undergoing a chemical dying process, but not by experiencing a great shock.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `trivialize`,
      `illustrate`,
      `dismiss`,
      `promote`,
    ],
    correctAnswer: "C",
    explanation: `To "dismiss" a claim is to reject it as untrue or unworthy of acceptance. The scientists reject the stories and explain why the alleged phenomenon cannot occur as described. _________________________________________________________________________________________________________`,
  },
  {
    module: 2,
    passage: `The following text is adapted from Honore de Balzac's 1829 novel The Chouans. Marie, an aristocrat, is tidying a room and speaking to Francine, her maid.

Exam 10 M2 She began to arrange the silk and muslin curtains which draped the window, making them intercept the light and produce in the room a voluptuous chiaroscuro. "Francine," she said, "take away those knick-knacks on the mantelpiece; leave only the clock and the two Dresden vases. I'll fill those vases myself with the flowers Corentin brought me. Take out the chairs, I want only this sofa and a fauteuil. Then sweep the carpet, so as to bring out the colors, and put wax candles in the sconces and on the mantel."`,
    questionText: `As used in the text, what does the phrase "bring out" most nearly mean?`,
    choices: [
      `Distribute`,
      `Transport`,
      `Introduce`,
      `Emphasize`,
    ],
    correctAnswer: "D",
    explanation: `Sweeping the carpet would make its colors more noticeable or vivid. In this context, "bring out" means emphasize. _________________________________________________________________________________________________________`,
  },
  {
    module: 2,
    passage: `The following text is adapted from Jane Austen's 1811 novel Sense and Sensibility. Elinor Dashwood is in her cottage speaking with her Uncle Edward and her younger sister Marianne. "I have frequently detected myself in such kind of mistakes," said Elinor, "in a total misapprehension of character in some point or other; fancying people so much more gay or grave, or ingenious or stupid than they really are, and I can hardly tell why or in what the deception originated. Sometimes one is guided by what they say of themselves, and very frequently by what other people say of them, without giving oneself time to deliberate and judge."`,
    questionText: `Which choice best describes the overall structure of the text?`,
    choices: [
      `The speaker describes how someone can be deceived by the impressions of others and then promises to be more careful in the future.`,
      `The speaker relates her misgivings about the character of another individual and then rationalizes her mistaken perception.`,
      `The speaker considers the duplicity of human nature and then issues a warning about the misconceptions of personal opinion.`,
      `The speaker describes a type of error and then reveals the sources of information that lead to such errors.`,
    ],
    correctAnswer: "D",
    explanation: `Elinor first identifies the error of misjudging people's character. She then explains that such errors can arise from what people say about themselves and what others say about them. _________________________________________________________________________________________________________`,
  },
  {
    module: 2,
    passage: `In order to combat the effects of human life on the planet's climate, many environmental and governmental establishments lay the foundation for forests in localities that previously did not have woodland areas, also known as afforestation. To begin the operation, potential sites are first surveyed in order to select regions with

Exam 10 M2 the best factors in terms of aspects such as vegetation, amount of human activity, weather, and soil quality. Once a site has been selected, the land must then be developed for planting. After the land has been prepared, trees can be planted with different methods of seeding, depending on the site and soil present.`,
    questionText: `Which choice best describes the overall structure of the text?`,
    choices: [
      `It presents a solution to a widespread issue, then elaborates on why the issue should be solved.`,
      `It defines a strategy, then lists the reasons why the strategy is useful.`,
      `It examines an effective practice, then argues that the practice has negative consequences.`,
      `It introduces a process, then explains the steps taken in executing that process.`,
    ],
    correctAnswer: "D",
    explanation: `The passage introduces afforestation and then proceeds in chronological order through site selection, land preparation, and planting. _________________________________________________________________________________________________________`,
  },
  {
    module: 2,
    passage: `Text 1
A recent series of psychological studies that included subjects from different parts of the world looked at the effects that nostalgia, the feeling and experience of thinking about one's own past, has on psychological wellbeing. The results of the studies demonstrated a relationship between nostalgia and authenticity, one's sense of being aligned with one's true self. A greater sense of authenticity was found to correlate with greater measurements of all aspects of psychological well-being.

Text 2
While there has been some demonstration that nostalgia is associated with mental health benefits, it is important to remember that there are different types of nostalgia and that some can be highly destructive. A recent study performed by psychologists David B. Newman, Arthur A. Stone, and Norbert Schwarz found that conscious acts of extreme nostalgia have positive effects, while smaller and momentary, more unconscious nostalgic experiences can result in negative mental health effects, such as neuroticism.`,
    questionText: `Based on the texts, what would Newman, Stone, and Schwarz (Text 2) say about the results of the studies discussed in Text 1?`,
    choices: [
      `They are completely consistent with the results of other studies on the subject.`,
      `They are from studies that fail to differentiate between different types of nostalgia and so provide an incomplete picture of nostalgia's impact on mental health.`,
      `They provide empirical evidence for a hypothesis long untested but assumed to be true.`,
      `They suggest a possible new direction for future research but provide no definitive resolutions.`,
    ],
    correctAnswer: "B",
    explanation: `Text 2 argues that nostalgia can have positive or negative effects depending on its type. Therefore, the broad positive relationship reported in Text 1 would be incomplete if the studies did not distinguish among types of nostalgia. _________________________________________________________________________________________________________

Exam 10 M2`,
  },
  {
    module: 2,
    passage: `The packaging of many fruit drinks contains health-related claims and imagery that can sometimes be misleading to parents who purchase such drinks for their children. To assess the impact of the front of packaging on consumers' purchasing decisions, nutrition researchers Aviva A. Musicus, Christina A. Roberto, and Alyssa J. Moran conducted a study wherein participants were shown fruit drinks with high amounts of sugar added with seven different conditions of packaging: with claim and imagery (control), no claim, no imagery, no claim or imagery, disclosure of percentage of juice, a warning, and disclosure of amount of added sugar in teaspoons. At the end of the study, the researchers concluded that the presence of warnings and absence of claims and imagery may reduce likelihood of purchase, whereas disclosure of percentage of juice may have very little impact.`,
    chartId: "exam2-fruit-drinks" as SatChartId,
    questionText: `Which choice most effectively uses data from the graph to support the researchers' conclusion?`,
    choices: [
      `The percentage of participants who selected the high-added-sugar fruit drink was highest when a warning was placed on the front of the packaging.`,
      `The percentage of participants who selected the high-added-sugar fruit drink when the percentage of juice was disclosed on the front of the packaging was comparable to the percentage who selected the drink in the control group.`,
      `The absence of the claim had the same impact as did the absence of imagery from the front of the packaging.`,
      `When the front of packaging disclosed the amount of added sugar in teaspoons, participants were more likely to select a low-added-sugar fruit drink than a high-added-sugar fruit drink.`,
    ],
    correctAnswer: "B",
    explanation: `The control condition is about 33%, while the percentage-of-juice disclosure condition is about 32%. Those nearly identical values support the conclusion that percentage-of-juice disclosure had very little impact. _________________________________________________________________________________________________________`,
  },
  {
    module: 2,
    passage: `"The Emerald Eyes" is an 1861 short story by Gustavo Adolfo Becquer, originally written in Spanish. In the story, the protagonist, Fernando, is continually drawn to a Poplar fountain in an attempt to learn the identity of a mysterious woman with emerald eyes. Fernando's friend Inigo is worried and tries to warn him to stay away from the fountain when he says, _____.`,
    questionText: `Which quotation from a translation of "The Emerald Eyes" most effectively illustrates the claim?`,
    choices: [
      `"Do you not see that [the stag] is going toward the fountain of the Poplars, and if he lives to reach it we must give him up for lost?"`,
      `"I exposed myself to death under his horse's hoofs to hold him back."`,
      `"You do not go to the mountains now preceded by the clamorous pack of hounds, nor does the blare of your horns awake the echoes."`,
      `"I conjure you by that which you love most on earth not to return to the fountain of the Poplars."`,
    ],
    correctAnswer: "D",
    explanation: `Choice D directly records Inigo pleading with Fernando not to return to the fountain, exactly illustrating the claim that he warns Fernando to stay away. _________________________________________________________________________________________________________`,
  },
  {
    module: 2,
    passage: `Anthony Doerr won a Pulitzer Prize, among other literary awards, for his work in fiction novels, and his short stories have been anthologized in collections of American literature. In an essay about Doerr's works, a student claims that Doerr uses children as his protagonists in order to create a story from an unbiased and hopeful perspective of humanity.`,
    questionText: `Which quotation from a literary critic best supports the student's claim?`,
    choices: [
      `"Doerr's novels are influenced by the themes present in fables, thus presenting an ordeal through which the protagonist learns a lesson about life."`,
      `"Doerr prefers to have the protagonist's story told through the eyes of a child who seeks to learn more about the world."`,
      `"Doerr's novels often contain multiple story arcs or perspectives culminating in a universal truth."`,
      `"Doerr's protagonists are often children who see the world with an open mind and contribute towards the betterment of humanity."`,
    ],
    correctAnswer: "D",
    explanation: `Choice D addresses both parts of the claim: Doerr often uses child protagonists, and those children display an open-minded, hopeful orientation toward humanity. _________________________________________________________________________________________________________`,
  },
  {
    module: 2,
    passage: `Social exclusion can have a detrimental impact on an individual's mental and emotional state. Psychologists Melissa Jauch, Selma Carolin Rudert, and Rainer Greifeneder hypothesized that individuals would experience

Exam 10 M2 equivalent effects of social exclusion regardless of whether the source of exclusion was human or computer. The researchers conducted a study in which subjects played a word riddle game. The subjects were grouped with other players who were computer-generated, though some subjects were told that they were playing with other humans. Throughout the game, the other players would either include the subjects or exclude them from participating. After the game, researchers measured the subjects' need satisfaction and mood on a scale of 1 to 9 immediately after the game (the reflexive stage) as well as after some time had passed (the reflective stage).`,
    chartId: "exam2-social-exclusion" as SatChartId,
    questionText: `Which choice most effectively uses data from the table to support the researchers' hypothesis?`,
    choices: [
      `At the reflexive stage, subjects' ratings in both mood and need satisfaction when excluded by a human were comparable to the corresponding ratings when excluded by a computer.`,
      `Subjects reported higher mood and need satisfaction ratings when included than they did when excluded.`,
      `When included by a human or a computer, subjects exhibited lower need satisfaction at the reflective stage than they did at the reflexive stage.`,
      `Subjects experienced the highest mood rating when they believed they were socially included by a human.`,
    ],
    correctAnswer: "A",
    explanation: `At the reflexive stage, human exclusion produced ratings of 3.13 for need satisfaction and 3.29 for mood, while computer exclusion produced 3.29 and 3.43. The similar values directly support the claim that exclusion had equivalent effects regardless of the source. _________________________________________________________________________________________________________`,
  },
  {
    module: 2,
    passage: `It is commonly accepted that the Cretaceous-Paleogene extinction event some 66 million years ago was caused by an asteroid impact, believed to correspond to an impact crater in Chicxulub, Mexico, that dates to the same time and is the second-largest impact structure on Earth. Geologist Uisdean Nicholson discovered an undersea impact crater while reviewing seismic survey data and conducted a study that demonstrated that this crater also formed around 66 million years ago. Nicholson claims that the rock whose impact caused the formation of the undersea crater could have broken off from a parent asteroid that also caused the Chicxulub impact.`,
    questionText: `Which finding, if true, would most directly support Nicholson's claim?`,
    choices: [
      `The undersea impact would have caused major earthquakes and tsunamis, leading to significant damage to the planet.`,
      `Some evidence points to a gradual Cretaceous-Paleogene extinction rather than a sudden one caused by an asteroid.`,
      `Many species of marine animals, in addition to land animals, went extinct during the Cretaceous-Paleogene extinction.`,
      `The undersea impact crater contains some of the same minerals not normally found on Earth that were also found at the Chicxulub impact site.`,
    ],
    correctAnswer: "D",
    explanation: `Matching unusual extraterrestrial minerals at both impact sites would suggest that the two impactors shared a common source, directly supporting the parent-asteroid claim. _________________________________________________________________________________________________________`,
  },
  {
    module: 2,
    passage: `In a study of neuronal sleeping patterns, researchers tracked the electrical waves (using EEG) and blood flow patterns (using fMRI) in participants while they slept. Researchers hypothesized that a correlation between electrical wave activity and blood flow patterns could indicate which regions of the brain, if any, fell asleep or awoke first. Like with previous studies, the researchers found that the thalamus, a region located near the center of the brain, had decreased blood flow patterns in association with increased electrical sleep waves in the early minutes of sleep activity. This suggests that _____.`,
    questionText: `Which choice most logically completes the text?`,
    choices: [
      `the thalamus is one of the first brain regions to fall asleep.`,
      `increased blood flow patterns in association with decreased electrical sleep waves indicate a brain region that is asleep.`,
      `the thalamus is the last brain region to fall asleep.`,
      `humans may use only one hemisphere of the brain while asleep.`,
    ],
    correctAnswer: "A",
    explanation: `The thalamus displayed the physiological pattern associated with sleep during the early minutes of sleep activity. Therefore, it is reasonable to infer that the thalamus is among the first regions to fall asleep. _________________________________________________________________________________________________________`,
  },
  {
    module: 2,
    passage: `In order to avoid physical damage, a formula is used to calculate the maximum gross weight for a commercial vehicle traveling over a bridge. The Federal Bridge Gross Weight Formula takes into account not only the weight of the vehicle but also its number of axles (shafts for wheels) and the spacing between axles, given that a shorter vehicle with its weight concentrated in a smaller area could cause more damage than could a longer vehicle of the same weight whose mass is more dispersed. This suggests that, when comparing a two-axle vehicle to a four-axle vehicle, _____.`,
    questionText: `Which choice most logically completes the text?`,
    choices: [
      `the four-axle vehicle likely has a lower weight limit on a given bridge than does the two-axle vehicle.`,
      `the vehicles likely have the same weight limit on a given bridge.`,
      `the two-axle vehicle is unlikely to surpass the bridge's weight limit, as it is smaller.`,
      `the two-axle vehicle likely has a lower weight limit on a given bridge than does the four-axle vehicle.`,
    ],
    correctAnswer: "D",
    explanation: `A vehicle with fewer axles concentrates its weight over a smaller area, increasing potential bridge damage. It would therefore generally be permitted a lower maximum weight than a comparable vehicle with more axles. _________________________________________________________________________________________________________

Exam 10 M2`,
  },
  {
    module: 2,
    passage: `A recent study looked at whether students who took photos of PowerPoint slides during lessons remembered the content. When students took a photo of the slides, they were able to better remember the information on those slides compared to slides _____ did not photograph.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `they`,
      `one`,
      `it`,
      `we`,
    ],
    correctAnswer: "A",
    explanation: `The pronoun must refer back to the plural noun "students" and serve as the subject of "did not photograph." "They" is the correct plural subject pronoun. _________________________________________________________________________________________________________`,
  },
  {
    module: 2,
    passage: `Soft drinks have become very popular in recent years, but consuming too many is associated with many diseases and intellectual deterioration. Scientists wanted to explore another question related to this topic: _____.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `does the consumption of soft drinks cause changes in mammal behavior?`,
      `does the consumption of soft drinks cause changes in mammal behavior.`,
      `the consumption of soft drinks causes changes in mammal behavior?`,
      `the consumption of soft drinks causes changes in mammal behavior.`,
    ],
    correctAnswer: "A",
    explanation: `The colon introduces a direct question. A direct question requires interrogative word order ("does ... cause") and a question mark. _________________________________________________________________________________________________________`,
  },
  {
    module: 2,
    passage: `Heat islands are urban areas that, due to a high number of buildings and limited greenery, have a higher temperature compared to outlying areas. There are several strategies and technologies to counteract the higher temperatures of heat islands. For example, green roofs, which are rooftops covered in vegetation, reduce the temperatures of _____ cool pavements, which are made with materials that reflect solar energy, can lower the temperatures above the pavement surface and the surrounding air.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `roofs, while`,
      `roofs; while`,
      `roofs. While`,
      `roofs: while`,
    ],
    correctAnswer: "A",
    explanation: `"While" introduces a dependent clause that contrasts cool pavements with green roofs. A comma correctly separates the main clause from the following dependent clause. _________________________________________________________________________________________________________`,
  },
  {
    module: 2,
    passage: `With a focus on public health, Abla Mehio Sibai is currently working at a university in Lebanon. She primarily focuses on the process of aging, especially in the context of different demographics, and _____ to research on noncontagious illnesses.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `contribute`,
      `contributes`,
      `are contributing`,
      `have contributed`,
    ],
    correctAnswer: "B",
    explanation: `The singular subject "She" governs both verbs in the sentence: "focuses" and "contributes." The singular present-tense form maintains parallel structure. _________________________________________________________________________________________________________`,
  },
  {
    module: 2,
    passage: `Bribery is recognized as a problem in India by local and international organizations. In response to this problem, 5th Pillar, a non-governmental organization, printed a zero-rupee _____ imitation banknote that resembles real money and is covered in anti-corruption slogans.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `note. An

Exam 10 M2`,
      `note, an`,
      `note an`,
      `note; an`,
    ],
    correctAnswer: "B",
    explanation: `"An imitation banknote" is an appositive that renames and explains "a zero-rupee note." A comma correctly introduces the appositive within the sentence. _________________________________________________________________________________________________________`,
  },
  {
    module: 2,
    passage: `Scientists wanted to learn how verbal statements can alter someone's visual interpretation of a situation. Participants were shown an image of 100 colored dots alongside a written hint and asked to identify the dominant color. When the hint accurately identified the dominant color, participants self-identified as more confident and _____ quicker response times.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `exhibit`,
      `exhibits`,
      `exhibiting`,
      `exhibited`,
    ],
    correctAnswer: "D",
    explanation: `The sentence describes a completed experiment in the past. "Exhibited" matches the past-tense verb phrase "self-identified" and creates parallel structure. _________________________________________________________________________________________________________`,
  },
  {
    module: 2,
    passage: `Quantum computers rely on entangled building blocks to perform computational calculations. Scientists are attempting to find a new source for these building _____ photons, or small quanta of light, emitted by an atom.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `blocks, such as:`,
      `blocks`,
      `blocks,`,
      `blocks:`,
    ],
    correctAnswer: "D",
    explanation: `The clause before the blank is complete, and the phrase after it identifies the specific building blocks being discussed. A colon correctly introduces that explanation. _________________________________________________________________________________________________________ Transition`,
  },
  {
    module: 2,
    passage: `Suzan Shown Harjo initially worked to write poems and produce news shows advocating for equal rights for Native Americans. _____ she moved to Washington, D.C., and served as Congressional Liaison for Indian Affairs for President Jimmy Carter while continuing to produce powerful pieces.`,
    questionText: `Which choice completes the text with the most logical transition?`,
    choices: [
      `As a rule,`,
      `Despite this,`,
      `Conversely,`,
      `After some time,`,
    ],
    correctAnswer: "D",
    explanation: `The second sentence describes a later stage in Harjo's career. "After some time" accurately signals chronological progression. _________________________________________________________________________________________________________`,
  },
  {
    module: 2,
    passage: `Scientists studied how electrical stimulation to the brain affected honeybees' ability to steer while flying. They were able to determine the parameters for honeybee flight and develop strategies to manipulate it. _____ scientists hope to use a similar technique to control the flight of miniature drones that will perform a variety of tasks for the military and other industries.

Exam 10 M2`,
    questionText: `Which choice completes the text with the most logical transition?`,
    choices: [
      `In contrast,`,
      `Eventually,`,
      `On one hand,`,
      `Specifically,`,
    ],
    correctAnswer: "B",
    explanation: `The final sentence describes a hoped-for future application of the research. "Eventually" clearly signals that future development. _________________________________________________________________________________________________________`,
  },
  {
    module: 2,
    passage: `In order to study an abrupt increase in global mean lower stratosphere temperatures, scientists used a timespecific analysis of wildfires in Australia. They determined that the wildfires are the source of this abrupt increase in temperature. _____ reducing the number of wildfires in Australia may help return the temperature to a normal value.`,
    questionText: `Which choice completes the text with the most logical transition?`,
    choices: [
      `On the other hand,`,
      `Meanwhile,`,
      `Instead,`,
      `Therefore,`,
    ],
    correctAnswer: "D",
    explanation: `The proposed effect of reducing wildfires follows logically from the finding that wildfires caused the temperature increase. "Therefore" signals this conclusion. _________________________________________________________________________________________________________`,
  },
  {
    module: 2,
    passage: `Ed Yost designed the first modern hot air balloon with an inflight heating system after working with General Mills on the company's research balloons. The first piloted hot air balloon was designed in France, but it heated the air on the ground and came with a large risk of explosion. _____ Yost's balloon design involved heating the fuel in the air and was much safer.`,
    questionText: `Which choice completes the text with the most logical transition?`,
    choices: [
      `Ultimately,`,
      `On the other hand,`,
      `Otherwise,`,
      `Despite this fact,`,
    ],
    correctAnswer: "B",
    explanation: `The sentence contrasts the dangerous earlier design with Yost's safer design. "On the other hand" is the logical contrast transition. _________________________________________________________________________________________________________`,
  },
];

export const SAT_EXAM_2_QUESTIONS: SatQuestion[] = EXAM_2_DRAFTS.map(
  (draft, index) => ({
    id: `exam-2-q-${index + 1}`,
    examId: 2,
    module: draft.module,
    section: SECTION,
    passage: draft.passage,
    passageImageUrl: draft.passageImageUrl,
    chartId: draft.chartId,
    questionText: draft.questionText,
    choices: draft.choices.map((text, choiceIndex) => ({
      label: LABELS[choiceIndex],
      text,
    })),
    correctAnswer: draft.correctAnswer,
    explanation: draft.explanation,
  })
);
