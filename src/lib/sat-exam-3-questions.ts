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

const EXAM_3_DRAFTS: ExamDraft[] = [
  {
    module: 1,
    passage: `The plant-based food industry, in which consumers purchase vegetarian and vegan alternatives to animal-based products, generated nearly $11 billion globally in 2022. New innovations in plant-based milks and meat are expected to spur further growth, with some analysts _____ that revenues will triple by 2032.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `authenticating`,
      `commanding`,
      `objecting`,
      `anticipating`,
    ],
    correctAnswer: "D",
    explanation: `The phrase 'analysts anticipating that revenues will triple' means that the analysts expect or predict this future growth. The other choices do not fit the context or grammar.`,
  },
  {
    module: 1,
    passage: `For his 2011 performance piece Desh, acclaimed choreographer Akram Khan collaborated with designer Tim Yip to create a work that audiences found profoundly _____: they lauded Khan for combining traditional Indian kathak dance with humorous monologues to tell a powerful story of human struggle and resilience.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `poignant`,
      `tumultuous`,
      `abstract`,
      `mundane`,
    ],
    correctAnswer: "A",
    explanation: `'Poignant' means deeply moving or emotionally affecting. The praise for a powerful story of struggle and resilience shows that audiences found the work emotionally moving.`,
  },
  {
    module: 1,
    passage: `In the fifth century BCE, Greek philosopher Anaxagoras formulated the concept of panspermia: the theory that life on Earth evolved from microorganisms that arrived from space on meteors or asteroids. Today, panspermia is considered a fringe theory, widely _____ because scientists have failed to find any experimental evidence to support it.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `validated`,
      `disparaged`,
      `deviated

Exam 12 M1`,
      `believed`,
    ],
    correctAnswer: "B",
    explanation: `'Disparaged' means regarded or spoken of negatively. A theory considered fringe because it lacks evidence would be widely criticized, not validated or generally believed.`,
  },
  {
    module: 1,
    passage: `The clownfish uses the sea anemone's stinging tentacles as protection from predators; in exchange, the clownfish provides nutrients for the sea anemone. This _____ relationship is further strengthened by the clownfish circulating the water for the sea anemone, and the sea anemone providing shelter for clownfish eggs.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `symbiotic`,
      `synchronous`,
      `disruptive`,
      `uncomplicated`,
    ],
    correctAnswer: "A",
    explanation: `A symbiotic relationship is a close interaction between two species, often one in which both benefit. The clownfish and sea anemone each provide advantages to the other.`,
  },
  {
    module: 1,
    passage: `Given the complex nature of the human brain, it is not surprising that the biological basis of behavior and consciousness has lacked _____ explanation. However, recent advances in neuroscience have allowed researchers to gain insight into the complicated and intricate relationship between brain structure and function, providing new insights into the neurological processes involved.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `a complex`,
      `a simple`,
      `a distinguishable`,
      `an impartial`,
    ],
    correctAnswer: "B",
    explanation: `The brain's complexity makes a simple explanation difficult. The contrast with recent advances also indicates that researchers previously lacked a straightforward account.`,
  },
  {
    module: 1,
    passage: `The following text is adapted from Charles Dickens's 1789 novel A Tale of Two Cities. A clergyman is passing through a small village in France. All [the village's] people were poor, and expressive signs of what made them poor were not wanting; the tax for the state, the tax for the church, the tax for the lord, tax local and tax general, were to be paid here and to be paid there, according to solemn inscription in the little village, until the wonder was that there was any village left unswallowed.

Exam 12 M1`,
    questionText: `As used in the text, what does the word 'wanting' most nearly mean?`,
    choices: [
      `desired`,
      `existing`,
      `obvious`,
      `lacking`,
    ],
    correctAnswer: "D",
    explanation: `In the phrase 'signs ... were not wanting,' 'wanting' means lacking or absent. The sentence says there were many visible signs of the causes of the villagers' poverty.`,
  },
  {
    module: 1,
    passage: `In cultures across the world, certain types of music convey different emotions. For example, for most western listeners, major chords evoke happiness while minor chords evoke sadness. Researchers from the Durham University Science Lab traveled to a remote region of Pakistan to study whether there are universal aspects to music's emotional resonance. The study participants had little or no exposure to western music, so their perceptions were not colored by previous knowledge. The researchers found that the Pakistani participants' perceptions varied dramatically from those of western listeners. For example, the participants rated speed metal music as conveying more joy than comic opera.`,
    questionText: `How did the researchers ensure that the study participants' reactions were not affected by previous exposure to western music?`,
    choices: [
      `They recruited participants from a remote area of the world where western music is very rare.`,
      `They surveyed the participants to determine their level of exposure to western music.`,
      `They asked the participants to ignore any western songs they had heard before.`,
      `They recorded the participants' reactions to various musical styles, including metal and opera.`,
    ],
    correctAnswer: "A",
    explanation: `The passage states that the researchers traveled to a remote region and selected participants with little or no exposure to western music. This minimized the influence of prior knowledge.`,
  },
  {
    module: 1,
    passage: `British graffiti artist Banksy creates street art by using stencils and black spray paint on the sides of buildings or walls. Sometimes, he integrates preexisting objects--such as fire hydrants, street signs, or concrete barricades--into his compositions. Banksy's true identity remains unknown: he does not get permission before painting on other people's property, and no one witnesses the art's creation. This mystery has increased his fame, but Banksy's true influence derives from the powerful critiques of capitalism, war, and surveillance present in his work.`,
    questionText: `Which choice best describes Banksy's approach to art, as presented in the text?`,
    choices: [
      `He creates street art that is purely aesthetic.`,
      `He asserts that artists should not ask permission before they paint on other people's property.`,
      `He uses stencils and spray paint to create politically charged street art.`,
      `He believes maintaining anonymity is the key to making powerful art.`,
    ],
    correctAnswer: "C",
    explanation: `The passage describes Banksy's use of stencils and spray paint and emphasizes that his work critiques capitalism, war, and surveillance. Thus, his street art is politically charged.`,
  },
  {
    module: 1,
    passage: `The following text is from Frances Hodgson Burnett's 1905 novel A Little Princess. The speaker, Sara, is a young girl living in a home for orphans. 'Whatever comes,' she said, 'cannot alter one thing. If I am a princess in rags and tatters, I can be a princess inside. It would be easy to be a princess if I were dressed in cloth of gold, but it is a great deal more of a triumph to be one all the time when no one knows it.'`,
    questionText: `Which choice best states the main idea of the text?`,
    choices: [
      `Dressing in expensive clothes gives Sara an aura of nobility.`,
      `Sara's social status is fixed and cannot be altered by future events.`,
      `Sara believes her difficult circumstances make her inner nobility especially significant.`,
      `Society maintains that princesses will triumph only if they wear rags.`,
    ],
    correctAnswer: "C",
    explanation: `Sara argues that true nobility comes from one's character rather than clothing or recognition. Remaining 'a princess inside' while living in hardship is, to her, the greater achievement.`,
  },
  {
    module: 1,
    passage: `Many historians turn to the written works of the early United States Presidents--particularly George Washington, John Adams, Thomas Jefferson, and James Madison--in order to understand their intentions for the country's government. However, many of these writings have likely been lost: the presidents' letters exist today only if kept safe in personal collections, and their speeches may not have been transcribed. Therefore, the numbers listed in the table should be considered minimums, not definitive totals; for example, _____.`,
    chartId: "exam3-presidents" as SatChartId,
    questionText: `Which choice most effectively uses data from the table to complete the example?`,
    choices: [
      `George Washington likely wrote more than 47 letters in his lifetime.`,
      `John Adams wrote significantly fewer books than James Madison, who wrote 12.`,
      `Thomas Jefferson probably wrote only 16 books, not the 20 he is often credited with.`,
      `James Madison may have authored more books than he did letters.`,
    ],
    correctAnswer: "A",
    explanation: `The passage says the listed totals are minimums because some writings were lost. Since the table credits Washington with 47 surviving letters, it is reasonable to infer that he likely wrote more than 47 in total.`,
  },
  {
    module: 1,
    passage: `My Antonia is a 1918 novel by Willa Cather. In the novel, the narrator describes his sense of powerlessness in the face of the natural world: _____.`,
    questionText: `Which quotation from My Antonia most accurately illustrates this claim?`,
    choices: [
      `'There was nothing but land: not a country at all, but the material out of which countries are made.... I had the feeling that the world was left behind, that we had got over the edge of it, and were outside man's jurisdiction.'`,
      `'There, along the western sky-line it skirted a great cornfield, much larger than any field I had ever seen. This cornfield, and the sorghum patch behind the barn, were the only broken land in sight.'`,
      `'The red of the grass made all the great prairie the color of winestains, or of certain seaweeds when they are first washed up. And there was so much motion in it; the whole country seemed, somehow, to be running.'`,
      `'I was something that lay under the sun and felt it, like the pumpkins, and I did not want to be anything more. I was entirely happy.'`,
    ],
    correctAnswer: "A",
    explanation: `The description of being beyond 'man's jurisdiction' portrays the land as vast and outside human control, directly illustrating the narrator's powerlessness before nature.`,
  },
  {
    module: 1,
    passage: `Scholars have long noted that women played prominent roles in ancient Mesopotamia as priestesses, but many fail to recognize that women's religious authority led them to influence literature as well. Indeed, Enheduanna, a 23rd century BCE Akkadian high priestess, is the earliest known named author in history, writing numerous hymns that were passed down for generations on clay tablets. Thus, those who primarily view ancient writings as the product of male authors _____.`,
    questionText: `Which choice most logically completes the text?`,
    choices: [
      `tend to overestimate the importance of male religious figures.`,
      `may have overlooked a crucial element of Mesopotamian literature.`,
      `do not understand the obstacles women faced in getting their work written down.`,
      `overemphasize the importance of Akkadian literature in the greater scope of world history.`,
    ],
    correctAnswer: "B",
    explanation: `Enheduanna's authorship shows that women contributed importantly to Mesopotamian literature. A view centered only on male authors would therefore omit a crucial part of that literary history.

Exam 12 M1`,
  },
  {
    module: 1,
    passage: `Many migratory birds use magnetoreceptors in their eyes to sense Earth's magnetic field as an aid to long-distance navigation, allowing them to stay on course even when there are no visible landmarks. Thus, some researchers have proposed that disturbances in the magnetic field, such as those caused by sunspots and solar flares, might cause birds to veer off course, a phenomenon scientists call 'vagrancy.' If this were the case, we would expect to see an increase in episodes of vagrancy during periods of solar activity. Yet a recent study showed that solar activity did not increase the frequency of vagrancy, suggesting that _____.`,
    questionText: `Which choice most logically completes the text?`,
    choices: [
      `migratory birds possess the ability to use alternate navigation methods when their perception of magnetic fields is unreliable.`,
      `birds cannot compensate for disturbances in the magnetic field, so their navigation is impaired during solar activity.`,
      `the Earth's magnetic field is not a significant factor in bird migration.`,
      `disturbances in the magnetic field affect migratory birds' ability to navigate by landmarks.`,
    ],
    correctAnswer: "A",
    explanation: `If magnetic disturbances do not increase vagrancy, birds may compensate by relying on other navigational cues. The finding does not show that magnetic sensing is irrelevant; only that disturbances do not necessarily make the birds lose their way.`,
  },
  {
    module: 1,
    passage: `Renowned for his groundbreaking work in the fields of robotics and artificial intelligence, Rodney _____ is perhaps best known as the inventor of the Roomba, a self-propelled robotic vacuum that can learn the layout of a home and perform cleaning tasks without human instruction.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `Brooks--`,
      `Brooks:`,
      `Brooks,`,
      `Brooks`,
    ],
    correctAnswer: "D",
    explanation: `'Rodney Brooks' is the complete subject of the sentence, followed directly by the verb 'is.' No punctuation should separate the subject from its verb.`,
  },
  {
    module: 1,
    passage: `The first commercial steam engine, invented by James Watts, revolutionized large-scale industry not only by providing factories with an efficient means of power but also by revolutionizing transportation, freeing humans from their reliance on animal-drawn _____ the engine's invention, transporting goods and people often required feeding and caring for a full complement of horses or oxen.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `Vehicles before

Exam 12 M1`,
      `vehicles, before`,
      `vehicles. Before`,
      `Vehicles and before`,
    ],
    correctAnswer: "C",
    explanation: `The first sentence ends after 'animal-drawn vehicles.' The next idea begins a new sentence with the introductory phrase 'Before the engine's invention,' so a period and capital letter are required.`,
  },
  {
    module: 1,
    passage: `Architect Frank Gehry utilized an innovative approach to create the panels of the steel surface of the Guggenheim Museum Bilbao in 1997. The iconic building's undulating metal 'skin,' formed by the _____, was designed with the help of computer programmers, positioning Gehry as the first architect of the digital age.

Exam 12 M1`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `steel panel's interlocking shapes`,
      `steel panel's interlocking shape's`,
      `steel panels' interlocking shapes`,
      `steel panels' interlocking shapes'`,
    ],
    correctAnswer: "C",
    explanation: `Multiple steel panels possess the interlocking shapes, so the plural possessive 'panels'' is required. 'Shapes' is simply plural and does not need an apostrophe.`,
  },
  {
    module: 1,
    passage: `The Montevideo Convention, a 1933 treaty signed by nineteen Latin American countries, established the legal criteria for _____ it requires a permanent population, a defined territory, a functioning government capable of protecting the well-being of its citizens, and the ability to conduct international relations while adhering to diplomatic protocols.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `statehood and`,
      `statehood`,
      `statehood;`,
      `statehood,`,
    ],
    correctAnswer: "C",
    explanation: `The clauses before and after the blank are independent: the convention established criteria, and it requires several features. A semicolon correctly joins these closely related complete clauses.`,
  },
  {
    module: 1,
    passage: `Researchers studying the patterns of butterfly wings in the Amazon rainforest were amazed to find that the colorful design of each butterfly's wings, much like the pattern of human fingerprints, _____ unique to the individual.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `are`,
      `is`,
      `were`,
      `have been`,
    ],
    correctAnswer: "B",
    explanation: `The subject is the singular noun 'design,' so the singular verb 'is' is required. The intervening phrases do not change the subject's number.`,
  },
  {
    module: 1,
    passage: `The intricate hand-weaving traditions of the Philippines--with roots tracing back to the 12th _____ to thrive today, as artisans use pedal looms to create intricate geometric designs from local cotton.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `century continue`,
      `century; continue`,
      `century--continue`,
      `century, continue`,
    ],
    correctAnswer: "C",
    explanation: `The phrase 'with roots tracing back to the 12th century' is supplementary and is set off by a pair of dashes. The second dash after 'century' correctly closes the interruption before the main verb 'continue.'`,
  },
  {
    module: 1,
    passage: `In drought years, the diets of North American bison, also known as buffalo, can be heavily influenced by the availability of vegetation and water. Although bison prefer to graze on native grasses, their access to these plants may be limited during dry periods, _____ them to eat bark, woody shrubs, and broad-leafed plants.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `compels`,
      `to compel`,
      `compelling`,
      `compelled`,
    ],
    correctAnswer: "C",
    explanation: `The participial phrase 'compelling them to eat...' correctly describes the result of their limited access to grass. The other forms do not fit the sentence's structure. Transition`,
  },
  {
    module: 1,
    passage: `Nobel laureate Eric Kandel sees the divide between art and science as artificial. _____ Kandel's study of learning and memory has shown that the fields of neuroscience, psychology, and art are deeply intertwined.

Exam 12 M1`,
    questionText: `Which choice completes the text with the most logical transition?`,
    choices: [
      `However,`,
      `Similarly,`,
      `In addition,`,
      `Indeed,`,
    ],
    correctAnswer: "D",
    explanation: `The second sentence directly confirms and illustrates the first. 'Indeed' signals that the study provides strong support for Kandel's view. Expression of Ideas`,
  },
  {
    module: 1,
    passage: `While researching a topic, a student has taken the following notes:
• Lipids extracted from microalgae can be used to make biofuels, but the conventional Bligh and Dyer method of extraction is a very slow, multistep process.
• Yen-Hsun Tseng and Swomitra Mohanty from the University of Utah wondered if confined impinging jet mixers (CIJMs) could improve the efficiency of lipid extraction from microalgae.
• The researchers extracted lipids from microalgae using a CIJM and compared them to those extracted using the Bligh and Dyer method.
• The researchers concluded that CIJMs produced similar yields to the Bligh and Dyer method in a fraction of the time.`,
    questionText: `The student wants to present the study and its methodology. Which choice most effectively uses relevant information from the notes to accomplish this goal?`,
    choices: [
      `A study revealed that confined impinging jet mixers could extract lipids from microalgae more quickly than could traditional methods.`,
      `Researchers at the University of Utah extracted lipids from microalgae using a confined impinging jet mixer (CIJM) and compared the results to those obtained using traditional methods.`,
      `Yen-Hsun Tseng and Swomitra Mohanty studied a new method of lipid extraction from microalgae, confined impinging jet mixers.`,
      `Scientists at the University of Utah have shown that using CIJMs to extract lipids from microalgae is a far more efficient process than the Bligh and Dyer method.`,
    ],
    correctAnswer: "B",
    explanation: `Choice B identifies the researchers' procedure--using a CIJM--and the comparison with the traditional method. It therefore presents both the study and its methodology rather than only its finding.`,
  },
  {
    module: 1,
    passage: `While researching a topic, a student has taken the following notes:
• Microplastics are small plastic pieces that measure less than 5 millimeters in length.
• In 2017, Sherri A. Mason was concerned that the microplastics in lakes could contaminate drinking water.
• She was initially unsure if water treatment plants could successfully filter out microplastics.
• She examined 159 tap water samples from 14 different countries and found that 88% of the samples contained significant evidence of microplastic contamination.
• She concluded that water treatment plants were not effectively removing microplastics from tap water. Exam 12 M1`,
    questionText: `The student wants to present the study and its findings. Which choice most effectively uses relevant information from the notes to accomplish this goal?`,
    choices: [
      `In 2017, Sherri A. Mason studied microplastics and was initially unsure if water treatment plants could effectively remove such contamination from drinking water.`,
      `Fragments of plastic from around the world were the focus of Mason's study.`,
      `In a 2017 study, Mason gathered 149 tap water samples from 14 different countries to search for evidence of microplastic contamination.`,
      `In a 2017 study, Mason determined that a significant portion of the world's tap water may contain microplastics, and thus many water treatment plants are ineffective at removing such contamination from the drinking water supply.`,
    ],
    correctAnswer: "D",
    explanation: `Choice D presents both the study and its central finding: widespread microplastic contamination indicating ineffective filtration. Choice C gives an incorrect sample count, and the other choices omit the finding.`,
  },
  {
    module: 1,
    passage: `While researching a topic, a student has taken the following notes:
• Zina Saro-Wiwa is a Nigerian-British filmmaker.
• Saro-Wiwa started her career working as a television and radio reporter for the BBC.
• She directed a documentary film called This Is My Africa in 2008.
• Her 2010 short film Phyllis explores the practice of wig-wearing among Nigerian actresses.
• Saro-Wiwa's art often explores themes of Black identity and belonging.`,
    questionText: `The student wants to introduce Zina Saro-Wiwa and her films to a new audience. Which choice most effectively uses relevant information from the notes to accomplish this goal?`,
    choices: [
      `Nigerian-British filmmaker Zina Saro-Wiwa directs films that often explore themes of Black identity and belonging.`,
      `Saro-Wiwa began her career at the BBC, working as a television and radio reporter.`,
      `Phyllis, a short film about wig-wearing among Nigerian actresses, was directed by Zina Saro-Wiwa in 2010.`,
      `Zina Saro-Wiwa directed Phyllis and This Is My Africa.`,
    ],
    correctAnswer: "A",
    explanation: `Choice A introduces Saro-Wiwa by nationality and profession and gives a broad description of the themes of her films, making it most suitable for a new audience.`,
  },
  {
    module: 1,
    passage: `While researching a topic, a student has taken the following notes:
• Pyrolysin is an enzyme produced by Pyrococcus furiosus, a microorganism that lives at extremely high temperatures.
• A study by chemist Jing Zeng and others investigated the effects of different salts on the activity of pyrolysin.
• The activity of pyrolysin in the absence of supplemental salts was defined as 100%.
• The presence of sodium chloride (NaCl) at an 80 millimolar concentration resulted in pyrolysin activity of approximately 167%.
• The presence of calcium chloride (CaCl2) at a 5 millimolar concentration resulted in pyrolysin activity of approximately 228%. Exam 12 M1`,
    questionText: `The student wants to contrast sodium chloride's effect on the enzyme with calcium chloride's effect on the enzyme. Which choice most effectively uses relevant information from the notes to accomplish this goal?`,
    choices: [
      `The activity of pyrolysin in the presence of the two salts was measured relative to the enzyme's activity without any supplemental salts.`,
      `While both salts produced increases in pyrolysin activity, the presence of CaCl2 resulted in larger increases at smaller concentrations than did the presence of NaCl.`,
      `The researchers tested NaCl at a significantly higher concentration than they tested CaCl2.`,
      `Both salts had a significant effect on the enzyme produced by Pyrococcus furiosus, a microorganism that lives at extremely high temperatures.`,
    ],
    correctAnswer: "B",
    explanation: `Choice B directly contrasts the two effects: calcium chloride produced a larger increase in activity even at a much lower concentration than sodium chloride.`,
  },
  {
    module: 1,
    passage: `While researching a topic, a student has taken the following notes:
• Lucy Stone was a pioneering orator and writer in the women's rights movement in the mid-nineteenth century.
• Stone organized the first national women's rights convention and spoke across the country advocating suffrage and abolition.
• Historian Sally G. McMillen wrote the biography Lucy Stone: An Unapologetic Life in 2016.
• The book aims to elevate the lesser-known Stone to the ranks of more famous feminist leaders such as Elizabeth Cady Stanton and Susan B. Anthony.`,
    questionText: `The student wants to introduce Sally G. McMillen's book to an audience already familiar with Lucy Stone and mid-nineteenth-century feminism. Which choice most effectively uses relevant information from the notes to accomplish this goal?`,
    choices: [
      `Sally G. McMillen's 2016 biography Lucy Stone: An Unapologetic Life seeks to secure Stone a place among such luminaries as Stanton and Anthony.`,
      `Lucy Stone is the subject of a biography written by historian Sally G. McMillen and published in 2016.`,
      `Lucy Stone: An Unapologetic Life tells the story of one of the early women's rights movement's most important writers and orators.`,
      `A feminist discussed by Sally McMillen is Lucy Stone, who traveled the country advocating for women's rights and abolition in the mid-nineteenth century.`,
    ],
    correctAnswer: "A",
    explanation: `Because the audience already knows Stone and the movement, the most useful introduction emphasizes the book's title, author, date, and distinctive aim of elevating Stone alongside Stanton and Anthony.`,
  },
  {
    module: 1,
    passage: `While researching a topic, a student has taken the following notes:
• Mangrove forests can help ecosystems adapt to climate change by storing substantial quantities of carbon dioxide (CO2), a greenhouse gas.
• Decomposing mangrove sediments also emit methane (CH4), another greenhouse gas.
• Ecologist Fiona Soper wondered the extent to which mangrove forests' methane emissions counteracted the benefits provided by their carbon storage.
• In 2019, Soper quantified total ecosystem carbon storage and methane emissions from a 70-year-old mangrove forest.
• Soper's study determined that emitted CH4 offsets only 2%-4% of the stored CO2, highlighting the mangroves' net-positive greenhouse gas removal effect. Exam 12 M1`,
    questionText: `The student wants to emphasize the aim of the research study. Which choice most effectively uses relevant information from the notes to accomplish this goal?`,
    choices: [
      `Prior to 2019, Fiona Soper wondered if the benefits of mangrove forests' ability to store carbon might be offset by their production of methane.`,
      `Fiona Soper studied the effect of mangrove forests on climate change by quantifying both carbon storage and methane emissions in a 70-year-old mangrove forest.`,
      `Ecologist Fiona Soper sought to determine whether mangrove forests' methane emissions negated the positive effects of the forests' carbon dioxide storage.`,
      `Fiona Soper's study concluded that the mangrove forests have a net-positive effect on the removal of greenhouse gases.`,
    ],
    correctAnswer: "C",
    explanation: `Choice C states the research question the study was designed to answer, directly emphasizing its aim rather than its method or conclusion.`,
  },
  {
    module: 2,
    passage: `Certain species of snakes exhibit vestigial skeletal formations--tiny hind-leg bones buried near the ends of their tails. Despite these structures' apparent unimportance, however, most researchers maintain the bones should not be considered _____; rather, they provide key insights into reptilian evolution.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `illustrative`,
      `inconsequential`,
      `provisional`,
      `significant`,
    ],
    correctAnswer: "B",
    explanation: `'Inconsequential' means unimportant or insignificant. The sentence contrasts that idea with the claim that the bones provide key evolutionary insights.`,
  },
  {
    module: 2,
    passage: `The European nation of Bosnia possesses what is arguably the most complicated system of government in the world, composed of three presidents and four major legislative bodies that aim to balance the competing interests of the country's many ethnic factions. Given such complexity, few outsiders can _____ to understand the details of Bosnia's governing process.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `presume`,
      `speculate`,
      `fail`,
      `relegate`,
    ],
    correctAnswer: "A",
    explanation: `To 'presume to understand' is to claim or suppose that one understands. Because Bosnia's system is extremely complex, few outsiders can reasonably make that claim.`,
  },
  {
    module: 2,
    passage: `Although Holden Caulfield, the protagonist of J.D. Salinger's novel The Catcher in the Rye, is considered a hero by many, he is far from _____: he makes many mistakes as he navigates adolescence.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `flawed`,
      `infallible`,
      `ambiguous`,
      `complex

Exam 12 M2`,
    ],
    correctAnswer: "B",
    explanation: `'Infallible' means incapable of making mistakes. The colon explains that Holden makes many mistakes, so he is far from infallible.`,
  },
  {
    module: 2,
    passage: `People often think of scientific research as limited only by the ingenuity of its practitioners, but additional restraints can be introduced by the society in which it is conducted. In addition to financial limitations, constraints may be _____ by societal norms regarding acceptable topics and procedures for research.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `imposed`,
      `disputed`,
      `intended`,
      `transcended`,
    ],
    correctAnswer: "A",
    explanation: `Societal norms can 'impose' constraints, meaning they can place or enforce limitations on what research is considered acceptable.`,
  },
  {
    module: 2,
    passage: `The following text is from Edith Wharton's 1913 novel The Custom of the Country. Ralph, an aspiring poet, is experiencing a moment of intense emotion. He had had glimpses of such a state before, of such mergings of the personal with the general life that one felt one's self a mere wave on the wild stream of being, yet thrilled with a sharper sense of individuality than can be known within the mere bounds of the actual. But now he knew the sensation in its fulness, and with it came the releasing power of language. Words were flashing like brilliant birds through the boughs overhead; he had but to wave his magic wand to have them flutter down to him. Underlined sentence: 'But now he knew the sensation in its fulness, and with it came the releasing power of language.'`,
    questionText: `Which choice best describes the function of the underlined sentence in the text as a whole?`,
    choices: [
      `It provides a contrast to the idea introduced in the next sentence.`,
      `It provides a contrast to the idea introduced in the next sentence.`,
      `It emphasizes Ralph's discomfort with his sense of self and his desire to escape into a new world.`,
      `It provides a transition between the discussion of emotion and the discussion of writing.`,
    ],
    correctAnswer: "D",
    explanation: `The sentence links Ralph's intense emotional sensation to the arrival of language. It therefore bridges the passage's discussion of feeling and its subsequent imagery about words and writing.

Exam 12 M2`,
  },
  {
    module: 2,
    passage: `The following text is adapted from Susan Glaspell's 1915 novel Fidelity. Only cowards and the broken in spirit surrendered the future as payment for the past. Love was the great and beautiful wonder--but surely one should not stay with it in the place where it found one. Why, loving should light the way! Far from engulfing all the rest of life it seemed now that love should open life to one. Whether one kept it or whether one lost it, it failed if it did not send one farther along the way.`,
    questionText: `Which choice best states the main purpose of the text?`,
    choices: [
      `To emphasize the importance of preserving love at all costs`,
      `To criticize those who reject their past and focus solely on the future`,
      `To suggest that love should lead to growth and progress`,
      `To suggest that love should lead to growth and progress`,
    ],
    correctAnswer: "C",
    explanation: `The passage argues that love should 'light the way,' open life, and move a person forward. Choices C and D are identical in the source; the first identical correct choice is C.`,
  },
  {
    module: 2,
    passage: `The following text is adapted from Gwendolyn Bennett's 1923 poem 'Heritage': I want to hear the silent sands, Singing to the moon Before the Sphinx-still face ... I want to hear the chanting Around a heathen fire Of a strange black race. I want to breathe the Lotus flow'r, Sighing to the stars With tendrils drinking at the Nile ... I want to feel the surging Of my sad people's soul Hidden by a minstrel-smile.`,
    questionText: `Which choice best describes the overall structure of the text?`,
    choices: [
      `It presents a series of rebuttals against entrenched racism.`,
      `It explores the advantages of connecting with nature then rejects those advantages.`,
      `It presents a series of desires to connect with a specific cultural background.`,
      `It reflects on the nature of time and the inevitability of death.`,
    ],
    correctAnswer: "C",
    explanation: `The repeated phrase 'I want' introduces a sequence of desires to experience African landscapes, rituals, and the speaker's people's soul, showing a longing for cultural connection.`,
  },
  {
    module: 2,
    passage: `According to Stanford University's Chinese Railroad Workers in North America Project, which studies the lives of Chinese migrant workers in the nineteenth century, historians should aim to research narratives that produce a rich, three-dimensional picture of these workers' lives. This task will be difficult, as this transient workforce left few written records behind. However, information can be gleaned from Chinese artifacts uncovered by archeologists at former campsites including porcelain, metal fragments, and glass. Underlined portion: 'as this transient workforce left few written records behind.'`,
    questionText: `Which choice best describes the function of the underlined portion in the text as a whole?`,
    choices: [
      `It provides a potential explanation for a challenge noted earlier in the text.

Exam 12 M2`,
      `It notes a possible exception to the list of evidence listed later in the text.`,
      `It suggests the impossibility of accomplishing the historians' goal stated earlier in the text.`,
      `It offers an example of the three-dimensional lives mentioned earlier in the text.`,
    ],
    correctAnswer: "A",
    explanation: `The underlined portion explains why producing a rich historical picture will be difficult: the transient workers left few written records. It gives the cause of the challenge stated immediately before it.`,
  },
  {
    module: 2,
    passage: `Text 1
Astronomers have long sought to explain the mysterious X-ray emissions from certain stars in our galaxy. These stars emit X-rays at much higher rates than do other nearby stars. Despite extensive research and the proposal of numerous theories, no clear explanation for this phenomenon has emerged.

Text 2
Astronomer Magda Bukowsky and her team have found a new relationship between hot plasma and excess X-ray emissions from stars. They discovered that the magnetic fields around these stars channel hot plasma, causing it to collide with the star's surface and emit X-rays. The team's findings suggest that the X-ray emission is not only a result of the star's intrinsic properties but also its interaction with its surrounding environment.`,
    questionText: `Based on the texts, how would Bukowsky and team (Text 2) most likely respond to the discussion of X-ray emissions in Text 1?`,
    choices: [
      `By agreeing that the mystery of X-ray emissions is still far from being understood`,
      `By questioning the fundamental assumptions behind earlier findings on X-ray emissions`,
      `By asserting that their findings offer an explanation for some stars' higher rate of X-ray emissions`,
      `By recommending that research on distant stars focus more on hot plasma than magnetic fields`,
    ],
    correctAnswer: "C",
    explanation: `Text 2 identifies a mechanism--magnetic fields channeling hot plasma into the stellar surface--that can account for excess X-rays. The team would therefore say its findings help explain the phenomenon described as unresolved in Text 1.

Exam 12 M2`,
  },
  {
    module: 2,
    passage: `Tourism is a significant source of revenue for many countries in Europe. Open borders across much of the continent make travel easy, especially for European citizens. At the same time, non-Europeans from across the world come to explore the continent's rich cultural heritage and stunning natural landscapes. In 2019, a record number of tourists visited several countries in Europe. According to a recent survey by the European Tourism Association, in 2019 France had the highest number of tourists with 91 million, while _____.`,
    chartId: "exam3-tourism" as SatChartId,
    questionText: `Which choice most effectively uses data from the graph to complete the text?`,
    choices: [
      `Italy had the second highest number with 65 million.`,
      `Spain had the second highest number with 84 million.`,
      `Greece had between 20 million and 30 million tourists.`,
      `Portugal had more tourists than Greece.`,
    ],
    correctAnswer: "B",
    explanation: `The graph shows Spain at about 84 million visitors, second only to France at 91 million. Italy is lower, and Greece exceeds 30 million.`,
  },
  {
    module: 2,
    passage: `Researcher Stanton Bergstrom and his colleagues investigated the evolution of ancient wolf populations. They analyzed the genomes of 72 ancient wolves from Siberia, North America, and Europe. The researchers determined that the wolves from different locations had very similar genomes, indicating significant movement and interbreeding between distant wolf populations. They hypothesized that such connectivity and mobility allowed the species to survive the end of the last ice age, when many other mammal species, such as cave bears and woolly mammoths, went extinct.`,
    questionText: `Which finding, if true, would most strongly support the researchers' hypothesis?`,
    choices: [
      `The genomes of extinct cave bears and woolly mammoths show much greater genetic variation across geographic regions than do those of ancient wolves.`,
      `Further investigation revealed that ancient wolf genomes include harmful mutations that persisted over time.

Exam 12 M2`,
      `Wolves' genomes are easier to map than those of other extinct mammals such as cave bears and woolly mammoths but harder to map than those of modern species.`,
      `The researchers found that modern wolf populations are far more genetically diverse than ancient ones.`,
    ],
    correctAnswer: "A",
    explanation: `Greater regional genetic variation in the species that went extinct would indicate less movement and interbreeding than in wolves. That contrast supports the idea that wolves' connectivity helped them survive.`,
  },
  {
    module: 2,
    passage: `The Saffir-Simpson Hurricane Wind Scale is used to classify hurricanes into five categories based on their maximum sustained wind speed. (Category 1: 74-95 mph, Category 2: 96-110 mph, Category 3: 111-129 mph, Category 4: 130-156 mph, and Category 5: 157 mph or higher.) When a hurricane is at least a Category 4 at landfall and produces a storm surge that exceeds 10 feet, the combination of flooding and high winds can devastate coastal communities. A meteorological student asserted that only two hurricanes in 2020 met this classification level.`,
    chartId: "exam3-hurricanes" as SatChartId,
    questionText: `Which choice best describes data from the table that support the student's assertion?`,
    choices: [
      `None of the storms had winds of 157 mph or greater.`,
      `Hurricane Eta had a wind speed of 125 mph, which made it the median wind speed of the five storms.`,
      `All the hurricanes had wind speeds of at least 100 mph and storm surges of at least 6 feet.`,
      `Each of the hurricanes Laura, Eta, and Iota had storm surges in excess of 10 feet, but Eta's wind speed was only 125 mph.`,
    ],
    correctAnswer: "D",
    explanation: `Laura and Iota both had winds of at least 130 mph and storm surges above 10 feet. Eta also had a surge above 10 feet, but its 125 mph wind speed was only Category 3, leaving exactly two qualifying hurricanes.`,
  },
  {
    module: 2,
    passage: `One widely supported goal of military benefit policy is to allow military veterans to attend college without accruing debt. Policy makers who support the traditional structure of military benefits argue that this goal is best accomplished by a current law that pays 100% of tuition costs at a public university for military veterans. Researchers at the Pew Charitable Trust examined this claim through a 2021 survey. They collected data on the percentage of veterans who took out student loans--distinguishing between those who attend for-profit, private, and public institutions--and the size of those loans. The researchers then surveyed respondents on their reasons for taking out the loans.

Exam 12 M2`,
    questionText: `Which finding from the researchers' study, if true, would most directly weaken the argument of policy makers who support the traditional structure of military benefits?`,
    choices: [
      `Veterans attending for-profit private institutions took out considerably more in loans than did veterans attending public universities.`,
      `Over half of all veterans who took out student loans attended public universities, often in order to pay for childcare and housing while attending college.`,
      `82% of college-educated veterans attended a public university at some point in their educational career.`,
      `Military officers, who already have undergraduate degrees when they enter the military, rarely accrue debt from additional educational costs.`,
    ],
    correctAnswer: "B",
    explanation: `If many public-university veterans still borrow for childcare and housing, paying tuition alone does not achieve the goal of college without debt. This directly weakens the claim that the current benefit structure is sufficient.`,
  },
  {
    module: 2,
    passage: `A marketing firm surveyed customers in three regions of a county--an urban north, a suburban center, and a more rural south--to learn more about their shopping habits. In most categories, men and women constituted dramatically different percentages of customers, but for some categories in certain regions, such differences were far less significant; for example, _____.`,
    chartId: "exam3-shopping" as SatChartId,
    questionText: `Which choice most effectively uses data from the graph to complete the example?`,
    choices: [
      `Men and women purchased roughly similar numbers of electronics in the urban and the rural regions.`,
      `Over 80% of the customers who purchased clothing in the rural region were female.`,
      `Men and women in the suburban region made up nearly equal percentages of customers who purchased both electronics and home goods.`,
      `In the urban region, men and women represented equal percentages of consumers of electronics and home goods.`,
    ],
    correctAnswer: "C",
    explanation: `In the central suburban region, women account for about 50% of electronics customers and just over 50% of home-goods customers. Those values indicate nearly equal male and female shares in both categories.

Exam 12 M2`,
  },
  {
    module: 2,
    passage: `Self-checkout and pay systems (SCOs) make it harder to stop customers from stealing goods: in a 2022 survey of 93 grocery stores in 25 countries, SCOs accounted for 48% of store losses due to theft. Even so, 96% of respondents utilized SCOs, which can save money by reducing staffing needs and are generally popular with younger customers who appreciate touchscreen technology. This finding suggests that _____.`,
    questionText: `Which choice most logically completes the text?`,
    choices: [
      `grocery stores will begin phasing out SCOs, despite the cost savings of reducing their in-store staffing needs.`,
      `many grocery stores find that the benefits of SCOs outweigh their drawbacks.`,
      `grocery stores will increase the use of SCOs because store losses that are not related to the use of SCOs represent a majority of grocery store thefts.`,
      `younger customers, who are more likely to use SCOs, are also more likely to steal goods.`,
    ],
    correctAnswer: "B",
    explanation: `Despite the theft risk, nearly all surveyed stores use SCOs because they reduce staffing costs and appeal to customers. This suggests stores judge the advantages to be greater than the disadvantages.`,
  },
  {
    module: 2,
    passage: `Peanut allergy is a potentially life-threatening condition, and current treatment options are limited to allergen avoidance and emergency medication in case of accidental exposure. A study investigated a new treatment called sublingual immunotherapy (SLIT) that involves administering small amounts of peanut protein under the tongue over an extended period of time. The study found that SLIT meaningfully desensitized a majority of children with peanut allergies: after three to five years of treatment, 67% of patients in the study could consume 750 mg or more of peanut protein without adverse reactions. Therefore, the researchers suggest that when treating a child with a peanut allergy, it would be most useful to _____.`,
    questionText: `Which choice most logically completes the text?`,
    choices: [
      `prioritize emergency medication over SLIT as a treatment option.`,
      `recommend that children with peanut allergy consume at least 750 mg of peanut protein over the course of three to five years.`,
      `maintain allergen avoidance as the primary treatment option for peanut allergy.`,
      `consider the use of SLIT to decrease the dangers of accidental peanut consumption.`,
    ],
    correctAnswer: "D",
    explanation: `Because SLIT raised the amount of peanut protein most children could tolerate, it may reduce the danger posed by accidental exposure. The study does not support simply feeding children peanut protein without the treatment protocol.`,
  },
  {
    module: 2,
    passage: `Defying gravity, high-wire artist Philippe Petit not only walked on _____ 1974, he crossed a wire between the twin towers of the World Trade Center in New York City, astounding onlookers for forty-five minutes of death-defying acrobatics 1,312 feet above the ground.

Exam 12 M2`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `tightropes--he danced--in`,
      `tightropes--he danced in`,
      `tightropes--he danced, in`,
      `tightropes--he danced. In`,
    ],
    correctAnswer: "D",
    explanation: `'He danced' completes the contrast begun by 'not only walked.' A dash introduces this emphatic addition, and a period then ends the sentence before 'In 1974' begins the next one.`,
  },
  {
    module: 2,
    passage: `Astronomer Katie Bouman and the Event Horizon Telescope team _____ an algorithm to process the data collected from radio observatories around the world when they made an incredible breakthrough: they captured the first-ever image of a black hole.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `develop`,
      `have been developing`,
      `will develop`,
      `were developing`,
    ],
    correctAnswer: "D",
    explanation: `The past progressive 'were developing' describes an ongoing action that was occurring when the breakthrough happened. It matches the past-time event 'made.'`,
  },
  {
    module: 2,
    passage: `On April 16, 1945, the Soviet Union launched a massive assault on Berlin, the capital of Nazi Germany, in the final days of the Second World _____ by Marshal Georgy Zhukov, the Soviet troops were able to breach the city's defenses, eventually capturing key landmarks such as the Reichstag building.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `War and spearheaded`,
      `War. Spearheaded`,
      `War, spearheaded`,
      `War spearheaded`,
    ],
    correctAnswer: "B",
    explanation: `The first complete sentence ends with 'Second World War.' The next sentence begins with the introductory participial phrase 'Spearheaded by Marshal Georgy Zhukov,' so a period and capital letter are required.`,
  },
  {
    module: 2,
    passage: `Photosynthesis is a complex series of processes in which plants absorb solar energy to fuel the production of chemical energy. Converting carbon dioxide and water into oxygen and sugars _____ the plant to manufacture its own food from the most abundant energy source in the solar system--the Sun.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `enables`,
      `are enabling`,
      `have enabled`,
      `enable`,
    ],
    correctAnswer: "A",
    explanation: `The gerund phrase 'Converting carbon dioxide and water into oxygen and sugars' functions as a singular subject, so it takes the singular verb 'enables.' Transition`,
  },
  {
    module: 2,
    passage: `Many scholars consider Jericho the oldest known walled city on Earth, with traces of habitation dating back to 9000 BCE. During the Bronze and Iron Ages, it was a major cultural and commercial center, known for its fortifications and water supply _____ beneath a tell (or archaeological mound), ancient Jericho's remains were originally excavated by British archaeologist Kathleen Kenyon in the 1950s.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `system. Located`,
      `system, located`,
      `system and located`,
      `system located`,
    ],
    correctAnswer: "A",
    explanation: `The first sentence ends after 'water supply system.' 'Located beneath a tell' then introduces a new complete sentence whose subject is 'ancient Jericho's remains.'

Exam 12 M2`,
  },
  {
    module: 2,
    passage: `Rock-and-roll emerged in the 1950s as a quintessentially American genre that blended rhythm and blues with country music, yet one of its most ardent early influencers was born and raised in Turkey. During his sixty years at Atlantic Records, music _____ introduced stars such as Eric Clapton, Led Zeppelin, and the Rolling Stones to listeners, forever changing the American soundtrack.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `executive, Ahmet Ertegun`,
      `executive Ahmet Ertegun,`,
      `executive Ahmet Ertegun`,
      `executive, Ahmet Ertegun,`,
    ],
    correctAnswer: "C",
    explanation: `The name 'Ahmet Ertegun' is essential to identify which music executive the sentence means, so no commas should separate it from the title. The complete subject is 'music executive Ahmet Ertegun.'`,
  },
  {
    module: 2,
    passage: `Takeo Kanade, a renowned robotics engineer and computer scientist, conceived the first facial-recognition software, a type of computer _____ the CMU Direct-Drive Arm, in 1981; and developed the first software to steer a self-driving car across the country, the Rapidly Adapting Lateral Position Handler, in 1995.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `vision; in 1973, invented the first direct-drive robotic arm;`,
      `vision; in 1973, invented the first direct-drive robotic arm,`,
      `vision, in 1973; invented the first direct-drive robotic arm,`,
      `vision, in 1973, invented the first direct-drive robotic arm,`,
    ],
    correctAnswer: "B",
    explanation: `The sentence contains a complex series of three achievements. A semicolon separates the first and second items, while the comma after 'arm' introduces the appositive name 'the CMU Direct-Drive Arm.'`,
  },
  {
    module: 2,
    passage: `Orgyia antiqua displays some of the most striking sexual dimorphism in the insect world. Males of the species look like normal moths: their red-brown wings can span up to 38 mm. _____ the flightless females look like swollen, grey caterpillars.`,
    questionText: `Which choice completes the text with the most logical transition?`,
    choices: [
      `For instance,`,
      `By contrast,`,
      `Specifically,`,
      `In conclusion,`,
    ],
    correctAnswer: "B",
    explanation: `The female moths' appearance differs sharply from the males' normal moth-like appearance. 'By contrast' correctly signals that difference.`,
  },
  {
    module: 2,
    passage: `Louis Armstrong was one of the world's best-loved jazz musicians of the twentieth century. Known primarily as a highly skilled and expressive trumpeter, Armstrong also earned accolades for his distinctive, gravelly vocals on tracks such as What a Wonderful World. _____ he composed more than fifty songs, some of which have become jazz standards.`,
    questionText: `Which choice completes the text with the most logical transition?`,
    choices: [
      `In addition,`,
      `Actually,`,
      `However,

Exam 12 M2`,
      `Regardless,`,
    ],
    correctAnswer: "A",
    explanation: `The final sentence adds another accomplishment to Armstrong's instrumental and vocal achievements. 'In addition' appropriately introduces this further point.`,
  },
  {
    module: 2,
    passage: `Every person's brain has a unique pattern of electrical activity that can be measured using electroencephalogram (EEG) signals. These 'biomarkers' can only be recorded from a living person's brain, thus are difficult to falsify or steal. _____ researcher Ivana Kralikova has suggested that identity verification through EEG biomarkers can provide an alternative to systems that use fingerprints or facial imaging.`,
    questionText: `Which choice completes the text with the most logical transition?`,
    choices: [
      `Nevertheless,`,
      `At the same time,`,
      `Therefore,`,
      `Surprisingly,`,
    ],
    correctAnswer: "C",
    explanation: `Because EEG biomarkers are unique and difficult to steal, the proposal to use them for identity verification follows logically. 'Therefore' signals this cause-and-effect relationship. Expression of Ideas`,
  },
  {
    module: 2,
    passage: `While researching a topic, a student has taken the following notes:
• In 1919, the 18th Amendment to the US Constitution banned the production, sale, and transportation of liquor.
• This ensuing era of illegal alcohol was known as 'Prohibition.'
• Prohibition led to a rise in crime, including 'bootlegging' (smuggling liquor) and attending or operating 'speakeasies' (illegal bars).
• During the 1920s, the number of federal convicts increased by 561% due to Prohibition-related offenses.
• The 21st Amendment to the US Constitution, which repealed the 18th Amendment, was ratified in 1933.`,
    questionText: `The student wants to present the significance of the 21st Amendment to an audience unfamiliar with US history. Which choice most effectively uses relevant information from the notes to accomplish this goal?`,
    choices: [
      `The 18th Amendment to the US Constitution banned the production, sale, and transportation of alcohol, leading to a rise in criminal activity.`,
      `During the 1920s, Prohibition led to a 561% increase in federal crimes, a situation remedied by the ratification of the 21st Amendment in 1933.`,
      `The 21st Amendment to the US Constitution, ratified in 1933, repealed the 18th Amendment and ended Prohibition.`,
      `In 1933, ratification of the 21st Amendment ended the era known as 'Prohibition' by repealing the 18th Amendment, which had banned the transportation, sale, and manufacture of liquor.`,
    ],
    correctAnswer: "D",
    explanation: `Choice D explains both what the 21st Amendment did and why that mattered: it repealed the earlier ban and ended Prohibition. This context is especially helpful for an audience unfamiliar with US history.`,
  },
];

export const SAT_EXAM_3_QUESTIONS: SatQuestion[] = EXAM_3_DRAFTS.map(
  (draft, index) => ({
    id: `exam-3-q-${index + 1}`,
    examId: 3,
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
