import type { SatChoiceLabel, SatQuestion } from "@/types/sat-exam";

const SECTION = "Section 1: Reading and Writing";
const LABELS: SatChoiceLabel[] = ["A", "B", "C", "D"];

type Exam1Draft = {
  passage: string;
  passageImageUrl?: string;
  questionText: string;
  choices: [string, string, string, string];
  correctAnswer: SatChoiceLabel;
  explanation: string;
};

const EXAM_1_DRAFTS: Exam1Draft[] = [
  {
    passage:
      "Dark energy may be even more __________ than scientists have bargained for, potentially “evolving” over time rather than remaining relentlessly constant in its acceleration of cosmic expansion.",
    questionText:
      "Which choice completes the text with the most logical and precise word or phrase?",
    choices: ["complicated", "multifaceted", "immutable", "constant"],
    correctAnswer: "A",
    explanation:
      "The sentence contrasts scientists’ expectation of constancy with the possibility that dark energy evolves, so “complicated” best fits the blank.",
  },
  {
    passage:
      "Charles Darwin proposed that evolution is driven by gradual variations in organisms that have a survival advantage in a changing environment. But University of Maryland evolutionary biologist Karen Carleton says that scientists have long grappled with the __________ that “evolution can happen abruptly, as described by Steven Jay Gould in [the theory of] punctuated equilibrium.",
    questionText:
      "Which choice completes the text with the most logical and precise word or phrase?",
    choices: ["interpretation", "confirmation", "quandary", "offer"],
    correctAnswer: "C",
    explanation:
      "“Grappled with” signals a difficult puzzle; “quandary” matches that meaning.",
  },
  {
    passage:
      "Despite a significant decrease in crime rates in the U.S. and specific cities like New York, public perception remains __________ fearful, with many Americans believing crime is worsening, influenced by media, political rhetoric, and historical events like 9/11. This heightened sense of danger affects daily behaviors and attitudes, leading to unnecessary precautions and a pervasive fear that impacts mental health and community engagement, even in areas with low crime rates.",
    questionText:
      "Which choice completes the text with the most logical and precise word or phrase?",
    choices: ["slightly", "reasonably", "disproportionately", "occasionally"],
    correctAnswer: "C",
    explanation:
      "Fear persists despite falling crime, so the fear is out of proportion—“disproportionately.”",
  },
  {
    passage:
      "Gene editing technology, particularly CRISPR, has revolutionized biomedical research by enabling precise alterations in the DNA of living organisms. These modifications can lead to significant improvements in crop resilience and disease resistance, highlighting its transformative potential. However, ethical concerns about the __________ spread of edited genes into wild populations remain a contentious issue among scientists.",
    questionText:
      "Which choice completes the text with the most logical and precise word or phrase?",
    choices: ["natural", "rapid", "minimal", "uncontrolled"],
    correctAnswer: "D",
    explanation:
      "Ethical worry centers on edited genes spreading without control into wild populations.",
  },
  {
    passage: `The following text is from The Great Gatsby by F. Scott Fitzgerald.

He smiled understandingly—much more than understandingly. It was one of those rare smiles with a quality of eternal reassurance in it, that you may come across four or five times in life. It faced—or seemed to face—the whole eternal world for a moment, and then concentrated on you with an irresistible prejudice in your favor. It understood you just as far as you wanted to be understood, believed in you as you would like to believe in yourself.`,
    questionText:
      "As used in the text, what does the word “irresistible” most nearly mean?",
    choices: ["undeniable", "overwhelming", "potent", "compelling"],
    correctAnswer: "D",
    explanation:
      "In context, the smile powerfully draws favor toward you—“compelling.”",
  },
  {
    passage: `Gibson Morib, a biology student, rediscovered the long-lost Attenborough’s long-beaked echidna in Indonesian New Guinea, inspiring a study led by Thomas Evans which created a catalog of 856 "lost" species, finding that about a quarter are likely extinct. The study, published in Global Change Biology, utilized advanced technology to detect elusive species, noting that small, less charismatic animals like reptiles have higher chances of being extant. Island-dwelling mammals are more likely to be extinct, whereas there's an optimal 66-year window for rediscovering lost bird species. However, rediscovery poses risks, such as attracting poachers or tourists, but it can also lead to increased protection and conservation efforts.

[Underlined sentence] However, rediscovery poses risks, such as attracting poachers or tourists, but it can also lead to increased protection and conservation efforts.`,
    questionText:
      "Which choice best describes the function of the underlined sentence in the text as a whole?",
    choices: [
      "It emphasizes the urgency and potential negative impacts of rediscovering lost species, contributing to a balanced view of conservation efforts.",
      "It introduces the main topic of the study, which is the methodology used in cataloging the \"lost\" species.",
      "It provides a statistical analysis of the species studied, highlighting the specific findings related to their likelihood of extinction.",
      "It contrasts the methodologies of past research with the current study to show improvements in data gathering and analysis.",
    ],
    correctAnswer: "A",
    explanation:
      "The underlined sentence adds risks of rediscovery while also noting protection benefits, balancing the account.",
  },
  {
    passage:
      "Hummingbirds, known for their agility and varied flying capabilities, use unique visual processing modes for different types of flight, particularly forward flight, as discovered in a study published in the Proceedings of the Royal Society B. Researchers analyzed over 3,500 flights in a tunnel, finding that hummingbirds have an internal sense of speed, rather than relying solely on visual cues like pattern velocity from their environment. This internal gauge was evident when movements that contradicted their expected visual surroundings caused them to slow down. Their brains have evolved to rapidly transition from visual signals to motor outputs, essential for their complex flight maneuvers.",
    questionText:
      "According to the text, which choice most effectively describes the mechanism used by hummingbirds for forward flight?",
    choices: [
      "Hummingbirds navigate by solely interpreting the patterns seen in their environment to maintain velocity.",
      "Hummingbirds possess an innate velocity gauge that influences their flight adjustments when external visual inputs are inconsistent.",
      "The flight of hummingbirds is enhanced by their ability to process auditory signals for complex aerial maneuvers.",
      "In flight, hummingbirds depend primarily on their physical reactions rather than visual feedback from their surroundings.",
    ],
    correctAnswer: "B",
    explanation:
      "The text states hummingbirds have an internal sense of speed and slow when visual input conflicts with expectation.",
  },
  {
    passage:
      "Research published in the Proceedings of the National Academy of Sciences USA suggests that stimulating cells with hyperactivated RAC genes, which are involved in cellular engulfment, could enhance a novel cancer immunotherapy called CAR-M. This therapy genetically engineers macrophages to recognize and consume cancer cells, but was limited by the macrophages' tendency to only nibble after the long period patient diagnosed with cancer.",
    questionText:
      "According to the text, which of the following treatment outcomes might indicate the likelihood that the authors of the study overcame the main obstacle exhibited by macrophages?",
    choices: [
      "Reports of cancer cells showing signs of being completely consumed by macrophages",
      "A significant increase in the activity of hyperactivated RAC genes during treatment, promoting more aggressive cellular interactions.",
      "A reduction in the activation of RAC genes post-therapy, showing less cellular engagement.",
      "Evidence of increased macrophage activity targeting and destroying cancer cells at the onset of their detection.",
    ],
    correctAnswer: "A",
    explanation:
      "The obstacle is that macrophages only nibble; full consumption would show that obstacle was overcome.",
  },
  {
    passage:
      "A study by Eva Zangerle and colleagues at the University of Innsbruck analyzed 353,320 songs from 1970 to 2020 and found that popular music lyrics have become simpler and more repetitive, with a rise in choruses and rhyming lines. The study, covering five major English-language music genres, used machine learning to examine linguistic features like repeated words, emotional cues, and vocabulary richness. Results showed an increase in negative emotions in lyrics, a decline in lyrical complexity, and a higher use of personal pronouns. The authors of the study also analyzed German-language and French-language songs, measuring complexity and emotional intention in their lyrics.",
    questionText:
      "The design of the study by Eva Zangerle and colleagues helped exclude which potential objection?",
    choices: [
      "The study only analyzes popular music, ignoring other forms like classical or folk music.",
      "The study does not take into account the influence of music streaming platforms on song popularity.",
      "The study focuses only on English-language songs, neglecting other languages.",
      "The study does not consider the impact of technological advancements in music production.",
    ],
    correctAnswer: "C",
    explanation:
      "Analyzing German- and French-language songs directly answers the objection that the study covers only English.",
  },
  {
    passage:
      "Researchers led by Selmaan Chettih at Columbia University suggest that Black-capped Chickadees use unique neural “barcodes” in their brain to remember the locations of their food caches. This study, involving chickadees equipped with headgear to measure neural activity, argues that when these birds hide a seed, specific and sparse neural patterns fire in their hippocampus. These barcodes, which are unique for each memory of a hidden item, help the chickadees recall specific locations without confusion.",
    questionText:
      "Which finding, if true, would most directly weaken the study's claim?",
    choices: [
      "Chickadees were found to have a significantly larger hippocampus than other bird species, indicating enhanced memory capabilities.",
      "The neural activity in the chickadees’ hippocampus remained constant, regardless of whether they were hiding seeds or engaging in other activities.",
      "Other bird species, such as sparrows, also demonstrate similar barcode-like neural patterns when hiding food.",
      "Chickadees often succeeded to relocate their food caches, suggesting a lack of precise memory recall.",
    ],
    correctAnswer: "B",
    explanation:
      "If hippocampal activity does not change when caching, the unique “barcode” claim for each memory is weakened.",
  },
  {
    passage:
      "In 2024, the Eastern U.S. will witness a rare simultaneous emergence of two different broods of periodical cicadas: the 13-year Brood XIX and the 17-year Brood XIII. These insects, which have spent over a decade underground, emerge en masse for mating and egg-laying, contributing significantly to the ecosystem. The overlap of these two broods, particularly in Illinois, offers a unique opportunity for scientific observation, including the potential for interbreeding between the different cicada species.",
    questionText:
      "According to the text, what is unique about the 2024 emergence of Brood XIX and Brood XIII cicadas?",
    choices: [
      "The broods will rise in distinct regions, ensuring minimal ecological impact.",
      "They are set to emerge in separate years, maintaining their lifecycle patterns.",
      "These broods will synchronously appear in an unusual event, especially in the East.",
      "One brood is expected to dominate, overshadowing the emergence of the other.",
    ],
    correctAnswer: "C",
    explanation:
      "The text stresses a rare simultaneous emergence of the two broods in the Eastern U.S.",
  },
  {
    passage: `Archaeologists have long believed that ancient Egyptians, around 2000 B.C., relied on rudimentary methods, like canals and buckets, for transporting water. This perception was primarily based on the limited archaeological evidence available from that era. However, a recent excavation in Crocodilopolis, an ancient Egyptian city, has challenged this view. The discovery of a sophisticated network of wooden pipes suggests that their water transportation technology was more advanced than previously thought. Therefore, __________

This scientific text is a fictional creation by Murad Mammadov for educational purposes and does not represent actual research findings.`,
    questionText: "Which choice most effectively completes the text?",
    choices: [
      "reassessment of other technological capabilities of ancient Egyptians becomes imperative.",
      "the findings validate long-held beliefs about the primitive nature of Egyptian technology.",
      "implications of similar advanced systems in surrounding civilizations are worth exploring.",
      "the ancient Egyptians’ understanding of water management was possibly underestimated.",
    ],
    correctAnswer: "D",
    explanation:
      "The discovery of advanced pipes most directly supports that water management was underestimated.",
  },
  {
    passage: `Scientists recently argued that the evolution of the striking orange stripes in Graphosoma italicum, a shield bug, is a direct adaptation to avoid predation by their main predator, Argiope lobata, a spider known to lack the pigments necessary for detecting orange colors. To test this hypothesis, the researchers designed an experiment where both orange-striped and non-striped variations of Graphosoma italicum were introduced into environments with and without the presence of Argiope lobata. In environments with these spiders, the scientists observed the predator’s response to both variations of the shield bug. They particularly monitored the rate at which Argiope lobata captured orange-striped versus non-striped bugs, expecting fewer orange-striped insects to be preyed upon.

This scientific text is a fictional creation by Murad Mammadov for educational purposes and does not represent actual research findings.`,
    questionText:
      "Which finding, if true, would most directly support the scientists' argument?",
    choices: [
      "In regions where Argiope lobata spiders are common, a significant increase in the population of non-striped Graphosoma italicum was observed.",
      "The Graphosoma italicum population showed a predominant orange coloration even in areas where Argiope lobata spiders are absent.",
      "In different geographical regions where Argiope lobata spiders are not prevalent, the Graphosoma italicum lacked the distinctive orange coloration.",
      "Despite the presence of Argiope lobata spiders, orange-striped Graphosoma italicum were more frequently preyed upon compared to their non-striped counterparts.",
    ],
    correctAnswer: "C",
    explanation:
      "If orange coloration is absent where the spider predator is absent, that supports orange as an adaptation to that predator.",
  },
  {
    passage: `The theory that football teams wearing red kits are more likely to win is supported by several statistical analyses. Research suggests that the color red may have a psychological impact on players, boosting confidence and aggression levels during matches. Additionally, opponents may perceive teams in red as more dominant, potentially influencing their performance. These effects, when combined, might contribute to a higher win rate for teams adorned in red. For example, __________

This scientific text is a fictional creation by Murad Mammadov for educational purposes and does not represent actual research findings.`,
    passageImageUrl: "/sat/exam1-q14-chart.png",
    questionText:
      "Which choice most effectively uses data from the table to complete the example?",
    choices: [
      "all four teams demonstrate higher win percentages in home games where they wear red kits.",
      "the teams perform equally well at home and away, regardless of kit color.",
      "teams wearing non-red kits away have lower win percentages, with the data showing reductions ranging from 11% to 12% compared to their performance in red kits at home.",
      "teams C and D, when wearing non-red kits away, have win percentages of 54% and 49% respectively.",
    ],
    correctAnswer: "A",
    explanation:
      "The chart shows every team has a higher win percentage in Home (Red) than Away (Non-Red), so A best completes the example. C is inaccurate because Team B’s drop is 10%, not 11–12%.",
  },
  {
    passage: `The following text is from Jane Austen's 1813 novel Pride and Prejudice.

It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters. 'My dear Mr. Bennet,' said his lady to him one day, 'have you heard that Netherfield Park is let at last?' Mr. Bennet replied that he had not.`,
    questionText: "Which choice best states the main purpose of the text?",
    choices: [
      "To introduce the characters of Mr. and Mrs. Bennet and set up a dialogue that explores their differing personalities.",
      "To critique societal expectations and the commodification of marriage through the ironic portrayal of societal views on wealthy bachelors.",
      "To provide a humorous take on the societal customs of early 19th century England, focusing on marriage and wealth.",
      "To establish the setting of Netherfield Park and its significance in the local community as a symbol of social status.",
    ],
    correctAnswer: "B",
    explanation:
      "The famous opening ironically treats marriage as social property, critiquing those expectations.",
  },
  {
    passage:
      "“The Road Not Taken” is an 1915 poem by Robert Frost. In the poem, the narrator rationalizes his decision to choose a certain way by revealing natural feature that attracted him, saying, __________",
    questionText:
      "Which quotation from “The Road Not Taken” most effectively illustrates the claim?",
    choices: [
      "Two roads diverged in a yellow wood, / And sorry I could not travel both",
      "And both that morning equally lay / In leaves no step had trodden black.",
      "And having perhaps the better claim, / Because it was grassy and wanted wear;",
      "Two roads diverged in a wood, and I— / I took the one less traveled by,",
    ],
    correctAnswer: "C",
    explanation:
      "Only C cites a natural feature (“grassy and wanted wear”) that attracted the speaker.",
  },
  {
    passage:
      "A healthy colon is a marvelously effective organ that squeezes nutrients and water out of food while pumping out __________ small clumps of abnormal cells grow on the colon’s lining and turn into cancer.",
    questionText:
      "Which choice completes the text so that it conforms to the conventions of Standard English?",
    choices: [
      "waste, however; sometimes",
      "waste, however, sometimes",
      "waste however sometimes",
      "waste; however, sometimes",
    ],
    correctAnswer: "D",
    explanation:
      "Two independent clauses join with a semicolon before “however,” then a comma after it.",
  },
  {
    passage:
      "In trying to predict the future, the past is always __________ is wont to repeat itself, at least on Earth.",
    questionText:
      "Which choice completes the text so that it conforms to the conventions of Standard English?",
    choices: ["key, history", "key—history", "key; history", "key history"],
    correctAnswer: "C",
    explanation:
      "Two independent clauses should be joined by a semicolon: “key; history.”",
  },
  {
    passage:
      "Children who are born with heart valve defects often undergo surgery to receive frozen valves from __________ thawed cadaver tissue is dead and doesn’t grow, however, the child must periodically have operations to get larger valves—which can lead to a poor prognosis.",
    questionText:
      "Which choice completes the text so that it conforms to the conventions of Standard English?",
    choices: [
      "cadavers because",
      "cadavers. Because",
      "cadavers—because",
      "cadavers, because",
    ],
    correctAnswer: "B",
    explanation:
      "A new sentence beginning with “Because” correctly separates the ideas.",
  },
  {
    passage:
      "AlphaGeometry, an AI program developed by researchers from Google DeepMind and New York University, successfully solved 25 out of 30 past International Mathematical Olympiad (IMO) geometry problems, demonstrating a capability comparable to human gold medalists. Exhibiting this advanced performance, __________",
    questionText:
      "Which choice completes the text so that it conforms to the conventions of Standard English?",
    choices: [
      "the potential for nonhuman participants in future IMOs becomes more feasible.",
      "the possibility of AI challenging human contestants in the IMO seems increasingly likely.",
      "human contestants are subject to be outcompeted by AI.",
      "the AI suggests the potential for nonhuman participants in future IMOs.",
    ],
    correctAnswer: "D",
    explanation:
      "The modifier “Exhibiting this advanced performance” must modify the AI, so the subject must be the AI.",
  },
  {
    passage:
      "Rabindranath Tagore was a pivotal figure in the Bengali Renaissance, infusing literature and arts with new life through his profound poetry and visionary ideas. __________, his influence was not confined to Bengal or even India, as his thoughts and works resonated globally, earning him the Nobel Prize in Literature in 1913. His legacy continues to inspire discussions on culture, education, and the arts worldwide.",
    questionText:
      "Which choice completes the text with the most logical transition?",
    choices: ["Further", "However", "Thus", "Similarly"],
    correctAnswer: "B",
    explanation:
      "The second sentence contrasts local importance with global reach—“However.”",
  },
  {
    passage:
      "By thinking of the collective actions of electrons as quasiparticles, physicists have made testable predictions that have been verified time and again in experiments on metals such as gold, silver, copper and aluminum. __________, the electrical resistivity—how much a material resists the flow of a current through it—of a Fermi liquid at low temperatures is predicted to vary in proportion to the square of the temperature, and experiments show that it does.",
    questionText:
      "Which choice completes the text with the most logical transition?",
    choices: ["Indeed", "For example", "Moreover", "As a result"],
    correctAnswer: "B",
    explanation:
      "The resistivity result is a specific instance of the verified predictions—“For example.”",
  },
  {
    passage:
      "Does Planet Nine exist? The first credible observations supporting the existence of such is the discovery of trans-Neptunian object (or TNO) Sedna. At very roughly 1,000 kilometers across it’s classified as a dwarf planet, and its orbit is very unusual: it never gets closer than approximately 11 billion kilometers to the sun, well outside Neptune’s orbit. Theoretical models show that it’s difficult to form a body with those characteristics in place. __________, it formed closer in to the sun, and an unseen planetary mass farther out—Planet Nine?—pulled it into its current orbit.",
    questionText:
      "Which choice completes the text with the most logical transition?",
    choices: ["Surprisingly", "Notwithstanding", "Consequently", "More likely"],
    correctAnswer: "D",
    explanation:
      "After rejecting in-place formation, the text offers the likelier alternative—“More likely.”",
  },
  {
    passage:
      "The Venus flytrap is renowned for its ability to snap shut in less than a second, making it one of the fastest-moving carnivorous plants. __________, compared to other insect-eating plants, its closing speed is remarkably quick, ensuring it rarely misses a passing meal.",
    questionText:
      "Which choice completes the text with the most logical transition?",
    choices: ["Regardless", "In fact", "Still", "Additionally"],
    correctAnswer: "B",
    explanation:
      "The second sentence intensifies the same claim about speed—“In fact.”",
  },
  {
    passage:
      "The strong force has been traditionally difficult to measure accurately at different energy scales, notably at longer distances termed as Terra Damnata. Recent collaborative efforts in both experimental and theoretical physics have started to unveil more about the strong force’s behavior. __________, these discoveries not only enhance our understanding of the fundamental forces but also pave the way for new theoretical approaches in quantum field theories.",
    questionText:
      "Which choice completes the text with the most logical transition?",
    choices: ["Nonetheless", "Granted", "Indeed", "Despite this"],
    correctAnswer: "C",
    explanation:
      "“Indeed” affirms and expands on the importance of the discoveries.",
  },
  {
    passage:
      "Research in navigational skills highlights significant variability among individuals, influenced by factors like upbringing, experience, and cultural context. __________, while some people naturally excel at navigation, many struggle due to a lack of practice or inherent difficulties in developing spatial awareness. Technologies like GPS have proven both to aid in navigation and to potentially degrade natural navigational skills when overused.",
    questionText:
      "Which choice completes the text with the most logical transition?",
    choices: ["In particular", "In addition", "In effect", "Admittedly"],
    correctAnswer: "A",
    explanation:
      "The next sentence specifies the variability—“In particular.”",
  },
  {
    passage:
      "Batteries vary in size and shape based on their specific uses and the amount of charge they need to store, from small button cells for watches to large lead-acid batteries for cars. The design and structure of batteries, such as cylindrical lithium-ion cells or blocky lead-acid units, are influenced by manufacturing processes, cost-effectiveness, and application requirements. __________, market demands and technological advancements continue to shape the development of battery types, influencing future designs and uses based on energy storage capacity and production efficiency.",
    questionText:
      "Which choice completes the text with the most logical transition?",
    choices: ["Lastly", "In addition", "To sum up", "Therefore"],
    correctAnswer: "B",
    explanation:
      "Market demands are another shaping factor alongside manufacturing—“In addition.”",
  },
];

export const SAT_EXAM_1_QUESTIONS: SatQuestion[] = EXAM_1_DRAFTS.map(
  (draft, index) => ({
    id: `exam-1-q-${index + 1}`,
    examId: 1,
    section: SECTION,
    passage: draft.passage,
    passageImageUrl: draft.passageImageUrl,
    questionText: draft.questionText,
    choices: draft.choices.map((text, choiceIndex) => ({
      label: LABELS[choiceIndex],
      text,
    })),
    correctAnswer: draft.correctAnswer,
    explanation: draft.explanation,
  })
);
