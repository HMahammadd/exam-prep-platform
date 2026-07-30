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

const EXAM_1_DRAFTS: ExamDraft[] = [
  {
    module: 1,
    passage: `The Chilean volcano Calabozos is located in ________ area. Therefore, the risk of loss of human life in the event of an eruption is minimal.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `a hazardous`,
      `an active`,
      `a mountainous`,
      `a remote`,
    ],
    correctAnswer: "D",
    explanation: `"Remote" means far from populated places. If the volcano is in a remote area, relatively few people would be nearby during an eruption, which explains why the risk of loss of human life is minimal.`,
  },
  {
    module: 1,
    passage: `Contemporaries of American modernist poet H.D. focused only on her important contributions to the Imagist movement in the 1920s, taking ________ view of her work. However, she wrote in a variety of forms and genres, from short, lyrical works to complex, book-length poems.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `an expansive`,
      `a limited`,
      `an imaginative`,
      `a complicated`,
    ],
    correctAnswer: "B",
    explanation: `The contemporaries focused only on one part of H.D.'s career even though she wrote in many forms and genres. Therefore, they took a "limited," or narrow, view of her work.`,
  },
  {
    module: 1,
    passage: `The Atlantic bluefin tuna (hereafter referred to as "bluefin tuna"), one of the world's most valuable and exploited fish species, has been declining in abundance throughout the Atlantic from the 1960s until the mid-2000s. Following the establishment of ________ management measures, the stock has started to recover recently and, as a result, stakeholders have raised catch quotas by 50% for the period 2017-2020.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `intense`,
      `drastic`,
      `stark`,
      `comparative`,
    ],
    correctAnswer: "B",
    explanation: `"Drastic" describes measures that are severe or far-reaching. Strong restrictions would logically help a heavily depleted fish population recover; the other choices do not fit the meaning or the phrase "management measures" as precisely.`,
  },
  {
    module: 1,
    passage: `Galileo Galilei was one of the first scientists to discuss scaling trends in nature, observing that a scaled-up "giant ten times taller than ordinary man" could not exist in the natural world unless his limbs were greatly altered to bear the extra mass. Although he was unaware of it, Galileo was describing the concept of what is now called allometry. Allometry was originally ________ in 1936 as a term to describe the discrepancy between the rate of growth of a part of the body and the body as a whole, i.e., the deviation from self-similar scaling.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `coined`,
      `formulated`,
      `implemented`,
      `modified`,
    ],
    correctAnswer: "A",
    explanation: `A term is "coined" when it is created or introduced. The sentence concerns the introduction of the word "allometry" as a term in 1936, not the implementation or modification of a concept.`,
  },
  {
    module: 1,
    passage: `Text 1
An animal is said to have a theory of mind when it is able to act according to the mental states of other individuals. Psychologists David Premack and Guy Woodruff studied whether chimpanzees have such a theory of mind. They showed videos of human actors struggling with various problems. The chimpanzees were able to select photographs that showed the best tool to solve each actor's problem.

Text 2
Biologist Daniel J. Povinelli and psychologists Kurt E. Nelson and Sarah T. Boysen have argued that previous research into whether chimpanzees have a theory of mind has not adequately addressed alternative explanations for the chimpanzees' behaviors. Specifically, it may be the case that chimpanzees are following learned behaviors in a known environment, rather than applying a theory of mind in a novel situation.`,
    questionText: `Based on the texts, how would Povinelli, Nelson, and Boysen (Text 2) most likely respond to Premack and Woodruff (Text 1)?`,
    choices: [
      `They would argue that nonhuman primates other than chimpanzees, such as baboons and gorillas, may also have a theory of mind.`,
      `They would argue that the chimpanzees would be able to solve the problems themselves without referencing the photographs by struggling with the situation themselves and eventually determining the correct solution.`,
      `They would encourage Premack and Woodruff to show the same videos and photographs to other nonhuman primates and compare the other nonhuman primates' reactions to the chimpanzees' reactions.`,
      `They would suggest that placing the chimpanzee subjects in novel environments, such as rooms distinct from the chimpanzees' regular enclosures, may help better ascertain whether chimpanzees have a theory of mind.`,
    ],
    correctAnswer: "D",
    explanation: `Text 2 argues that the observed behavior may reflect learned responses in a familiar setting rather than genuine reasoning about another individual's mental state. Testing the chimpanzees in a novel environment would reduce that alternative explanation and better test whether they possess a theory of mind.`,
  },
  {
    module: 1,
    passage: `A comprehensive study on the origins of wine has revealed new insights into the history of grape cultivation. Contrary to the belief that wild grapes originated in central Asia and spread westward, genetic data suggests they naturally grew across the western and central Eurasian continent hundreds of thousands of years ago. Researchers previously believed grapevines were domesticated 8,000 years ago, but the study suggests humans in western Asia domesticated table grapes about 11,000 years ago, and wine grapes were domesticated simultaneously in the Caucasus.`,
    questionText: `Which finding, if true, would most directly support the study's claim?`,
    choices: [
      `Archaeological evidence from central Asia indicating domestication of grapevines 9,000 years ago.`,
      `Genetic markers from wild grapes found in the western and central Eurasian continent dating back 500,000 years.`,
      `Records of wine production from the Caucasus region dating back 6,000 years.`,
      `Discovery of ancient table grape remnants in western Asia from approximately 11,000 years ago.`,
    ],
    correctAnswer: "D",
    explanation: `The study specifically claims that table grapes were domesticated in western Asia about 11,000 years ago. Ancient table-grape remains from that location and time would directly support that claim. Choice B concerns the much earlier natural distribution of wild grapes, not their domestication.`,
  },
  {
    module: 1,
    passage: `The following text is from Frederick Marryat's 1847 novel The Children of the New Forest. The old forester lay awake the whole of this night, reflecting how he should act relative to the children; he felt the great responsibility that he had incurred, and was alarmed when he considered what might be the consequences if his days were shortened. What would become of them-living in so sequestered a spot that few knew even of its existence-totally shut out from the world, and left to their own resources?`,
    questionText: `Based on the text, what is true about the children?`,
    choices: [
      `They are isolated from people other than the old forester.`,
      `They are completely unable to take care of themselves.`,
      `The old forester is resentful of having to take care of them.`,
      `They attempt to help the old forester with his responsibilities.`,
    ],
    correctAnswer: "A",
    explanation: `The children live in a secluded place that few people know exists and are described as "totally shut out from the world." This supports the conclusion that they are isolated from everyone except the old forester.`,
  },
  {
    module: 1,
    passage: `The following text is from Baron George Gordon Byron's poem "Answer to ______'s Professions of Affection," written around 1814. The poem is addressed to an unknown person.

In hearts like thine ne'er may I hold a place
Till I renounce all sense, all shame, all grace-
That seat,-like seats, the bane of Freedom's realm,
But dear to those presiding at the helm-
Is basely purchased, not with gold alone;
Add Conscience, too, this bargain is your own-
'Tis thine to offer with corrupting art
The rotten borough of the human heart.`,
    questionText: `What is the main idea of the text?`,
    choices: [
      `The speaker is expressing disapproval toward the unknown person.`,
      `The speaker is unimportant to the unknown person.`,
      `The speaker is thinking of purchasing a seat.`,
      `The speaker holds a place in the heart of the unknown person.`,
    ],
    correctAnswer: "A",
    explanation: `The speaker refuses a place in the addressee's heart unless he abandons "sense," "shame," "grace," and conscience, and calls that heart corrupt and rotten. These descriptions clearly express moral disapproval of the unknown person.`,
  },
  {
    module: 1,
    passage: `So-called "fake news" has renewed concerns about the prevalence and effects of misinformation in political campaigns. Given the potential for widespread dissemination of this material, researchers examined the individual-level characteristics associated with sharing false articles during the 2016 U.S. presidential campaign. To do so, they uniquely linked an original survey with respondents' sharing activity as recorded in Facebook profile data. First and foremost, they found that sharing this content was a relatively rare activity. Conservatives were more likely to share articles from fake news domains, which in 2016 were largely pro- Trump in orientation, than liberals or moderates. They also found a strong age effect, which persists after controlling for partisanship and ideology: On average, users over 65 shared nearly seven times as many articles from fake news domains as the youngest age group.`,
    questionText: `Which choice best states the function of the underlined portion in the overall structure of the text?`,
    choices: [
      `To delineate the credibility of research control measures applied in the study.`,
      `To suggest that age was the most significant factor in sharing fake news.`,
      `To emphasize that the age effect was independent of political beliefs.`,
      `To contrast the sharing habits of different age groups.`,
    ],
    correctAnswer: "C",
    explanation: `The underlined phrase states that the relationship between age and sharing false articles remains even after political affiliation and ideology are statistically accounted for. Its function is therefore to show that the age effect is independent of political beliefs.`,
  },
  {
    module: 1,
    passage: `"Alone" is an 1829 poem by Edgar Allan Poe. In the poem, Poe uses imagery to describe a transformation of a natural formation, writing, ________.`,
    questionText: `Which quotation from "Alone" most effectively illustrates the claim?`,
    choices: [
      `"From the lightning in the sky / As it pass'd me flying by- / From the thunder, and the storm-"`,
      `"And the cloud that took the form / (When the rest of Heaven was blue) / Of a demon in my view-"`,
      `"From ev'ry depth of good and ill / The mystery which binds me still-"`,
      `"From the torrent, or the fountain- / From the red cliff of the mountain-"`,
    ],
    correctAnswer: "B",
    explanation: `Choice B depicts a cloud changing into, or taking, the form of a demon. This is a clear transformation of a natural formation and therefore directly illustrates the claim.`,
  },
  {
    module: 1,
    passage: `India is the largest democracy in the world, with over 614 million people voting in the 2019 election for the Lok Sabha, the parliament of the federal government. In the early years of Indian independence, from the first election in 1951-52 through the eighth Lok Sabha in 1984, each election resulted in one party winning the majority of seats. However, starting with the 1989 election, the party with the largest number of seats failed to win more than half of the total seats. This trend was eventually broken by the Bharatiya Janata Party, which ________.`,
    chartId: "exam1-lok-sabha" as SatChartId,
    questionText: `Which choice most effectively uses data from the graph to illustrate the claim?`,
    choices: [
      `went from holding the second most seats among the top 3 parties in parliament in 2004 and 2009 to holding a majority of seats in 2014 and 2019.`,
      `reached its highest percentage of seats the same year that the Indian National Congress had its lowest percentage of seats over the same time period.`,
      `won a lower percentage of seats in the 2009 election than in the 2004 election.`,
      `had a lower percentage of seats than the Indian National Congress in 2004 but a higher percentage of seats than the Indian National Congress in 1999.`,
    ],
    correctAnswer: "A",
    explanation: `The table shows that the Bharatiya Janata Party held 25% of seats in 2004 and 21% in 2009, placing it second among the three named parties in both years. It then won majorities in 2014 and 2019, with 52% and 56% of seats, respectively, directly illustrating that the no-majority trend was broken.`,
  },
  {
    module: 1,
    passage: `Fatty liver disease (FLD) occurs when excess fat builds up in the liver. While there are often few or no symptoms of FLD, if left untreated, it can lead to cirrhosis or liver cancer. Because FLD is often asymptomatic, doctors and researchers rely on indicators such as steatosis (retention of fat in the liver), fibrosis (scarring), blood glucose (sugar), serum insulin, and insulin resistance to measure and track the development of FLD. A group of researchers led by radiologist Hamid Reza Talari hypothesized that those who take vitamin B12 would experience improvements in fibrosis and insulin resistance when compared to a control group over the same time period.`,
    chartId: "exam1-fatty-liver" as SatChartId,
    questionText: `Which choice best describes data from the table that support the researchers' hypothesis?`,
    choices: [
      `Those in the control group had decreases in their steatosis values and fasting blood glucose but had increases in fibrosis values and HOMA-IR.`,
      `Those in the vitamin B12 group had decreases in fibrosis values and HOMA-IR levels, whereas those in the control group had increases in these same values.`,
      `Both those in the vitamin B12 group and the control group had decreases in their steatosis values.`,
      `Those in the control group had a decrease in their fasting blood glucose, but those in the vitamin B12 group had an increase in their fasting blood glucose.`,
    ],
    correctAnswer: "B",
    explanation: `The hypothesis predicts improvement in fibrosis and insulin resistance for the vitamin B12 group relative to the control group. The table shows decreases in fibrosis (-0.35) and HOMA-IR (-0.23) for the vitamin B12 group but increases in those measures (0.10 and 0.06) for the control group.`,
  },
  {
    module: 1,
    passage: `The following text is from Archibald Lampman's 1899 poem "The Mystery of a Year." In this poem, the speaker is describing a woman whom he has known for some time.

A little while, a year agone, I knew her for a romping child,
A dimple and a glance that shone With idle mischief when she smiled.
To-day she passed me in the press, And turning with a quick surprise
I wondered at her stateliness, I wondered at her altered eyes.`,
    questionText: `Which choice best states the main idea of the text?`,
    choices: [
      `The speaker is reminiscing about a past romantic relationship with a woman.`,
      `The speaker is astonished at the changes within a certain individual.`,
      `The speaker is an expert in observing subtle changes in others.`,
      `The speaker uses intricate and complex thought processes to impress those around him.`,
    ],
    correctAnswer: "B",
    explanation: `The speaker remembers the woman as a playful child and is now surprised by her stateliness and altered appearance. The central idea is his astonishment at how much she has changed.`,
  },
  {
    module: 1,
    passage: `Neurons respond to stimuli from sensory organs or other neurons. Learning occurs when neurons change how they respond to stimuli based on previous experience, which is a property of memory. Electrical engineers seek to replicate similar processes in their development of computer memory. Recently, research by electrical engineer Mohammad Samizadeh Nikoo has demonstrated that vanadium dioxide (VO2) has a similar memory property to that of neurons, suggesting that ________.`,
    questionText: `Which choice most logically completes the text?`,
    choices: [
      `VO2 could be used in the development of computer memory.`,
      `neurons use VO2 when forming memories.`,
      `VO2 can learn to respond to stimuli from sensory organs.`,
      `electrical engineers can now use neurons to develop computer memory.`,
    ],
    correctAnswer: "A",
    explanation: `Engineers want materials that can reproduce neuron-like memory processes. Because VO2 has a similar memory property, it may be useful in developing computer memory; the passage does not suggest that neurons contain VO2 or that the material receives sensory input.`,
  },
  {
    module: 1,
    passage: `Uruguayan-Spanish author Carmen Posadas has written the children's books Juego de Ninos (Child's Play) and La Cinta Roja (The Red Ribbon). Currently, ________ available in over fifty countries and thirty languages.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `some are`,
      `this is`,
      `they are`,
      `it is`,
    ],
    correctAnswer: "C",
    explanation: `The antecedent is the plural noun "books," so the plural pronoun and verb "they are" correctly complete the sentence.`,
  },
  {
    module: 1,
    passage: `During a meeting, a group of twelve young deaf people shared their feelings of isolation and their desire for support. In 1988, the group worked together to form Action Deaf Youth, an ________ provides services and programs for deaf children and youth throughout Northern Ireland.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `organization, that`,
      `organization`,
      `organization that`,
      `organization,`,
    ],
    correctAnswer: "C",
    explanation: `The sentence needs the noun "organization" followed by the restrictive relative clause "that provides services and programs." No comma should separate the noun from this essential identifying information.`,
  },
  {
    module: 1,
    passage: `In 1986, after a 56-day expedition, Ann Bancroft became the first woman to reach the North Pole. Her experience as a physical education teacher and her leadership of the first all-female team to cross the ice to the South ________ her to create a foundation that supports girls in pursuing their dreams.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `Pole to inspire`,
      `Pole that inspired`,
      `Pole, inspiring`,
      `Pole inspired`,
    ],
    correctAnswer: "D",
    explanation: `The compound subject "Her experience ... and her leadership ..." requires the main verb "inspired." Therefore, "Pole inspired" produces a complete and grammatically correct sentence.`,
  },
  {
    module: 1,
    passage: `American artist Simone Leigh creates art in various mediums, including sculptures, video, and ________ the themes and images in her artwork, Leigh has emphasized that Black women are her primary audience and that they would be familiar with the allusions in her work.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `performance. Discussing`,
      `performance discussing`,
      `performance and discussing`,
      `performance, discussing`,
    ],
    correctAnswer: "A",
    explanation: `"American artist Simone Leigh creates art ... including sculptures, video, and performance" is a complete sentence. A period correctly ends it, and "Discussing the themes and images ..." begins a new sentence with a modifying phrase that logically describes Leigh.`,
  },
  {
    module: 1,
    passage: `Japanese origamist Akira Yoshizawa is considered the grandmaster of origami, creating more than 50,000 models as well as wet-folding, the most well-known of his invented techniques. ________ dampening the paper before folding, leading to origami models with rounder and more sculpted looks.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `It involves`,
      `They involve`,
      `One involves`,
      `These involve`,
    ],
    correctAnswer: "A",
    explanation: `The singular pronoun "It" clearly refers to the singular technique "wet-folding." The singular verb "involves" agrees with that subject and correctly introduces a description of the technique.`,
  },
  {
    module: 1,
    passage: `Chinese artist Xu Bing is known for his art installations that showcase his printmaking skills and his creative use of languages and texts. His 1991 installation A Book from the Sky, for example, consists of volumes and scrolls printed with characters he invented, while his 2004 installation The Glassy Surface of a ________ uses the text of Henry David Thoreau's Walden to create the illusion of a lake.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `Lake:`,
      `Lake`,
      `Lake,`,
      `Lake-`,
    ],
    correctAnswer: "B",
    explanation: `"The Glassy Surface of a Lake" is the complete title and serves as the subject of the verb "uses." No punctuation should separate the subject from its verb.`,
  },
  {
    module: 1,
    passage: `Developed along with the swing style of jazz music in the 1920s, swing dance is a group of social dances that once comprised hundreds of styles. Not all of the styles survived beyond that time ________ the dances that are still popular today include Lindy Hop, Balboa, Collegiate Shag, and Charleston.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `period; however,`,
      `period, however;`,
      `period, however,`,
      `period, however`,
    ],
    correctAnswer: "A",
    explanation: `The blank joins two independent clauses. A semicolon correctly ends the first clause, and the conjunctive adverb "however" is followed by a comma: "period; however, the dances ..." Transition`,
  },
  {
    module: 1,
    passage: `Evolutionary biologist Jonathan Calede may have discovered the oldest amphibious beaver species in the world. Calede first compared measurements of the beaver's ankle to those of almost 350 other rodent species to learn more about how it moved. ________ Calede dated the species to approximately 30 million years ago based on its location between rock and ash layers.`,
    questionText: `Which choice completes the text with the most logical transition?`,
    choices: [
      `For example,`,
      `In conclusion,`,
      `Next,`,
      `In fact,`,
    ],
    correctAnswer: "C",
    explanation: `The passage describes two stages of Calede's research in chronological order: first comparing anatomical measurements and then dating the species. "Next" clearly signals the second step.`,
  },
  {
    module: 1,
    passage: `Male and female American citizens had starkly different roles during World War II. Men served as soldiers or took part in the workforce to create weapons and other wartime materials. ________ women were responsible for maintaining the home and supporting the men. Some women also ventured into the workforce for the first time, and the famous "We Can Do It" poster featuring "Rosie the Riveter" was created to motivate women to pursue this new role.`,
    questionText: `Which choice completes the text with the most logical transition?`,
    choices: [
      `Besides,`,
      `Instead,`,
      `Likewise,`,
      `Meanwhile,`,
    ],
    correctAnswer: "D",
    explanation: `The sentence shifts from what men were doing during the war to what women were doing at the same time. "Meanwhile" logically signals simultaneous but different activities.`,
  },
  {
    module: 1,
    passage: `While treatment for hearing loss is typically associated with the ears, some patients with damaged ear structures are not able to use traditional cochlear implants. ________ researchers are working to develop hearing aids anchored to patients' bones in order to combat hearing loss through vibrations in the skull.`,
    questionText: `Which choice completes the text with the most logical transition?`,
    choices: [
      `Secondly,`,
      `In addition,`,
      `Finally,`,
      `Hence,`,
    ],
    correctAnswer: "D",
    explanation: `The development of bone-anchored hearing aids is a consequence of the fact that some patients cannot use traditional cochlear implants. "Hence" means "for this reason" and correctly signals that cause-andeffect relationship.`,
  },
  {
    module: 1,
    passage: `Korean artist Anicka Yi uses a unique process and materials to generate her art installations. Her materials are often perishable and biological, such as soap and flowers, and are not traditionally used for artwork. ________ Yi spends almost as much time transforming these substances into completely new materials as she does creating the actual art pieces.`,
    questionText: `Which choice completes the text with the most logical transition?`,
    choices: [
      `Meanwhile,`,
      `Instead,`,
      `In fact,`,
      `To conclude`,
    ],
    correctAnswer: "C",
    explanation: `The final sentence adds a striking detail that reinforces how unusual and labor-intensive Yi's process is. "In fact" appropriately introduces this supporting elaboration. Expression of Ideas`,
  },
  {
    module: 1,
    passage: `While researching a topic, a student has taken the following notes:
• A writing system for expressing numbers is a numeral system.
• Two examples of numeral systems from history are Babylonian cuneiform numerals and Roman numerals.
• The Babylonian cuneiform numeral system is a base-60 system and lacks a zero digit.
• It is a positional numeral system in which the position of a digit affects its value.
• The Roman numeral system is a base-10 system and lacks a zero digit.
• It is a non-positional numeral system in which the position of a digit does not affect its value.`,
    questionText: `The student wants to emphasize a difference between the two numeral systems. Which choice most effectively uses relevant information from the notes to accomplish this goal?`,
    choices: [
      `Babylonian cuneiform numerals and Roman numerals are two writing systems for expressing numbers.`,
      `The Roman numeral system is a base-10 non-positional system that lacks a zero digit.`,
      `One system for expressing numbers is Babylonian cuneiform; however, another one is the Roman numeral system.`,
      `The Babylonian cuneiform numeral system is base-60 and positional, while the Roman numeral system is base-10 and non-positional.`,
    ],
    correctAnswer: "D",
    explanation: `Choice D directly contrasts two relevant differences: the systems use different numerical bases, and one is positional while the other is non-positional. The other choices either state similarities or describe only one system.`,
  },
  {
    module: 1,
    passage: `While researching a topic, a student has taken the following notes:
• Archaeologists studied the burial of an individual at the Newen Antug site in Argentinian Patagonia.
• The individual was buried in a wooden structure over 800 years ago.
• An analysis of the structure revealed that it was carved from a tree with excellent buoyancy.
• The wooden structure was a canoe, suggesting that canoes were used as coffins at that time.`,
    questionText: `The student wants to present the Newen Antug study and its conclusions. Which choice most effectively uses relevant information from the notes to accomplish this goal?`,
    choices: [
      `The burial site of an individual over 800 years ago was found at the Newen Antug site in Argentinian Patagonia.`,
      `Archaeologists studied the burial site of an individual who was buried at the Newen Antug site over 800 years ago.`,
      `An analysis of a burial site at the Newen Antug site in Argentinian Patagonia provided evidence that canoes were used as coffins over 800 years ago.`,
      `As part of a study of a burial site at the Newen Antug site in Argentinian Patagonia, a wooden structure buried with an individual was analyzed.`,
    ],
    correctAnswer: "C",
    explanation: `Choice C identifies the study and clearly states its conclusion: the burial provides evidence that canoes were used as coffins more than 800 years ago. The other choices mention the study but omit the main conclusion.`,
  },
  {
    module: 2,
    passage: `Shakespeare intentionally provided no stage directions for his play Macbeth regarding whether to have Banquo's ghost physically present on stage or simply to have Macbeth react fearfully to something invisible, thus providing future directors with the ______ to indulge their own artistic interpretations.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `confusion`,
      `dedication`,
      `instruction`,
      `liberty`,
    ],
    correctAnswer: "D",
    explanation: `"Liberty" means freedom to act or interpret as one chooses. By leaving the staging unspecified, Shakespeare gave future directors freedom to develop their own artistic interpretations.`,
  },
  {
    module: 2,
    passage: `German-Dutch paleontologist Ralph von Koenigswald was the first to discover the fossilized remains of Gigantopithecus blacki, a gargantuan ape believed to have lived during the Pleistocene Epoch. Because the fossils were exclusively found in caves in southern China, many experts believe that the species was ______ that region-that is, anyone claiming to have found remains of Gigantopithecus elsewhere would be mistaken.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `restricted to`,
      `eliminated from`,
      `common in`,
      `unknown to`,
    ],
    correctAnswer: "A",
    explanation: `"Restricted to" means limited to a particular place. The sentence explains that experts believe the species existed only in southern China.

Exam 9 M2`,
  },
  {
    module: 2,
    passage: `Computer scientist Ray Kurzweil ______ that although artificial intelligence will not displace human beings, it will undoubtedly become smarter than people within this generation. This possibility has been the domain of science fiction writers for decades, whose works explore the ramifications of just such a future.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `proves`,
      `requires`,
      `predicts`,
      `denies`,
    ],
    correctAnswer: "C",
    explanation: `Kurzweil is making a claim about what will happen in the future, so "predicts" is the precise word. Nothing in the passage suggests that he proves, requires, or denies the outcome.`,
  },
  {
    module: 2,
    passage: `In psychology, it is critical not to generalize from the results of studies in which the subjects are not representative of the larger population. The infamous Stanford Prison Experiment ______ this principle: the participants, whose behavior supposedly demonstrated the "human" tendency toward alarming aggression in authoritarian situations, were a handful of male college-age individuals from the same private university in California rather than a diverse sampling of subjects.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `illustrates`,
      `refutes`,
      `supersedes`,
      `critiques`,
    ],
    correctAnswer: "A",
    explanation: `The Stanford Prison Experiment serves as an example of the danger described in the first sentence. Therefore, it "illustrates" the principle rather than refuting or replacing it.

Exam 9 M2`,
  },
  {
    module: 2,
    passage: `Neurologists know that prosopagnosia-the ______ to recognize faces-involves a specific lesion in the brain and can be caused by disease or head injury. However, prominent author Dr. Oliver Sacks believes that this "face blindness" also has a definite genetic component.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `capability`,
      `incapacity`,
      `tendency`,
      `reluctance`,
    ],
    correctAnswer: "B",
    explanation: `Prosopagnosia is the inability to recognize faces. "Incapacity" means lack of ability and therefore precisely describes the condition.`,
  },
  {
    module: 2,
    passage: `The shark's competitive advantage in the oceanic ecosystem is principally due to electroreception, or ability to detect electrical impulses. Marine biologists believe that this heightened ______ to electrical stimuli allows the shark to easily find its prey, for as fish swim through water, their movement produces minute electrical signals.`,
    questionText: `Which choice completes the text with the most logical and precise word or phrase?`,
    choices: [
      `allergy`,
      `sensitivity`,
      `indifference`,
      `aversion`,
    ],
    correctAnswer: "B",
    explanation: `"Sensitivity" is the ability to detect or respond to slight stimuli. That meaning directly matches the shark's heightened ability to detect weak electrical signals.

Exam 9 M2`,
  },
  {
    module: 2,
    passage: `The following text is from Herman Melville's 1924 short novel Billy Budd and pertains to Edward Vere, the captain of the ship on which Billy is sailing. Captain the Honorable Edward Fairfax Vere, to give his full title, was a bachelor of forty or thereabouts, a sailor of distinction even in a time prolific of renowned seamen. Though allied to the higher nobility, his advancement had not been altogether owing to influences connected with that circumstance. He had seen much service, been in various engagements, always acquitting himself as an officer mindful of the welfare of his men, but never tolerating an infraction of discipline; thoroughly versed in the science of his profession, and intrepid to the verge of temerity, though never injudiciously so.`,
    questionText: `According to the text, what is true of Captain Vere?`,
    choices: [
      `He dislikes many of the men who serve under him.`,
      `He is proud of his aristocratic background.`,
      `He is a capable and evenhanded naval officer.`,
      `He prefers navy life to life outside the navy.`,
    ],
    correctAnswer: "C",
    explanation: `The passage describes Vere as experienced, knowledgeable, brave, attentive to his crew's welfare, and firm about discipline. These details support the conclusion that he is both capable and evenhanded.

Exam 9 M2`,
  },
  {
    module: 2,
    passage: `Dracula is an 1897 novel by Bram Stoker. In the story, English lawyer Jonathan Harker has traveled to Transylvania to conduct business with Count Dracula at his castle. In his journal, Harker conveys his belief that he has become Dracula's prisoner: ______`,
    questionText: `Which quotation from Jonathan Harker's journal most effectively illustrates the claim?`,
    choices: [
      `"What manner of man is this, or what manner of creature, is it in the semblance of man? I feel the dread of this horrible place overpowering me."`,
      `"My lamp seemed to be of little effect in the brilliant moonlight, but I was glad to have it with me, for there was a dread loneliness in the place which chilled my heart and made my nerves tremble."`,
      `"I start at my own shadow, and am full of all sorts of horrible imaginings. God knows that there is ground for my terrible fear in this accursed place."`,
      `"I rushed up and down the stairs, trying every door and peering out of every window I could find, but after a little the conviction of my helplessness overpowered all other feelings."`,
    ],
    correctAnswer: "D",
    explanation: `The quoted attempt to find an exit, followed by Harker's realization of his helplessness, most directly shows that he believes he is unable to leave and is therefore a prisoner.`,
  },
  {
    module: 2,
    passage: `"In Flanders Fields" is a 1915 poem written by Lieutenant-Colonel John McCrae, a Canadian military officer who died three years later in World War I. The poem is meant to be a plea toward others to join the war effort, as is evident by the following lines: ______`,
    questionText: `Which quotation from "In Flanders Fields" most effectively illustrates the claim?`,
    choices: [
      `"Loved and were loved and now we lie / In Flanders fields"`,
      `"In Flanders fields the poppies blow / Between the crosses row on row"`,
      `"To you from failing hands we throw / The torch; be yours to hold it high"`,
      `"We are the dead. Short days ago / We lived, felt dawn, saw sunset glow"`,
    ],
    correctAnswer: "C",
    explanation: `These lines directly call on the living to take up the "torch," symbolically continuing the soldiers' cause. The other quotations describe the dead or the battlefield without making such an appeal.

Exam 9 M2`,
  },
  {
    module: 2,
    passage: `The curator of a museum claims that a dress in his possession was worn by the wife of one of Lincoln's generals at the presidential inauguration in 1865. Radiocarbon dating, which dates organic material with an error range of about thirty years in either direction, was performed on the sleeves of the dress, revealing that they date back to the 1975-2005 period. If both the curator's claim and the radiocarbon dating analysis are correct, that would suggest that ______.`,
    questionText: `Which choice most logically completes the text?`,
    choices: [
      `the dress was made sometime between 1835 and 1895 and then damaged sometime after 1975.`,
      `vintage dresses are more commonly recovered from the late twentieth and early twenty-first centuries than from the mid-nineteenth century.`,
      `over one hundred years after the dress was made, its sleeves were replaced.`,
      `the dress was made from material different from that used for most dresses in the nineteenth century.`,
    ],
    correctAnswer: "C",
    explanation: `If the dress was worn in 1865 but the sleeves date to 1975-2005, the original sleeves could not still be attached. The most logical conclusion is that the sleeves were replaced more than a century later.`,
  },
  {
    module: 2,
    passage: `In the early 1900s, paleontologists largely believed that there were no undocumented prehistoric aquatic species that had survived to the present day because it would be impossible for such a species to have enough animals to sustain a breeding population while escaping detection in the modern era. However, a coelacanth, a large lobe-finned fish universally believed by scientists to have gone extinct sixty-six million years ago, was found off the coast of South Africa as recently as 1938. This event may suggest that ______.`,
    questionText: `Which choice most logically completes the text?`,
    choices: [
      `fewer coelacanths are required to sustain a breeding population than was previously thought.`,
      `it is possible for a prehistoric species to go undiscovered for longer than expected.`,
      `the scientists who determined that the coelacanth was extinct ignored critical evidence.`,
      `the same environmental conditions that eliminated the dinosaurs nearly killed off the coelacanths.`,
    ],
    correctAnswer: "B",
    explanation: `The discovery of a supposedly extinct species demonstrates that a surviving population can remain undetected for a very long time. The passage provides no evidence for the other claims.

Exam 9 M2`,
  },
  {
    module: 2,
    passage: `The door-in-the-face technique involves initially making an outrageous or unappealing request or offer, which the other person is highly likely to refuse, then following up with a more reasonable one. The subject is more likely to look favorably upon this second request or offer because it seems acceptable compared to the initial proposition. So, if an employee wants the best raise in annual salary from her boss that she can get, she might succeed by asking for a ______.`,
    questionText: `Which choice most logically completes the text?`,
    choices: [
      `50% raise, then asking for a 5% raise.`,
      `3% raise, then asking for a 2% raise.`,
      `10% raise, then asking for a 50% raise.`,
      `3% raise, then asking for a 3% raise again.`,
    ],
    correctAnswer: "A",
    explanation: `The technique requires an extreme first request that is likely to be rejected, followed by a much more reasonable request. A 50% raise followed by a 5% raise fits that pattern.`,
  },
  {
    module: 2,
    passage: `The North American Free Trade Agreement (NAFTA) was an agreement among the United States, Canada, and Mexico that was in effect between 1994 and 2020. During this time, the number of manufacturing jobs in the United States and Canada declined, but the total number of manufacturing jobs in the countries covered by NAFTA increased. This suggests that, between 1994 and 2020, ______.`,
    questionText: `Which choice most logically completes the text?`,
    choices: [
      `the number of manufacturing jobs in Mexico increased by a greater amount than the combined decreases in the United States and Canada.`,
      `NAFTA made it more difficult for manufacturers to establish factories in the United States and Canada.`,
      `the cost of manufacturing goods in the area covered by NAFTA decreased.`,
      `complex goods, such as automobiles and electronics, were increasingly manufactured in the United States, Canada, and Mexico.`,
    ],
    correctAnswer: "A",
    explanation: `The total across all three countries increased even though the totals in the United States and Canada fell. Therefore, Mexico's increase must have been larger than the combined declines in the other two countries.

Exam 9 M2`,
  },
  {
    module: 2,
    passage: `The following text is adapted from Charles Dickens's 1859 novel A Tale of Two Cities. Mr. Lorry, traveling to France on business, is delivering some news to Miss Manette, the daughter of one of his friends. "Miss Manette, I am a man of business. I have a business charge to acquit myself of. In your reception of it, don't heed me any more than if I was a speaking machine-truly, I am not much else. I will, with your leave, relate to you, miss, the story of one of our customers." "Story!" He seemed wilfully to mistake the word she had repeated, when he added, in a hurry, "Yes, customers; in the banking business we usually call our connection our customers. He was a French gentleman; a scientific gentleman; a man of great acquirements-a Doctor."`,
    questionText: `Based on the text, how does Mr. Lorry interact with Miss Manette?`,
    choices: [
      `Although he claims to be uninterested in the news, he makes purposeful decisions during his conversation with Miss Manette.`,
      `Although he is a professional, he misunderstands Miss Manette's interjection.`,
      `Although he acts as if the news has no importance to him, he cannot keep the details of the story accurate.`,
      `Although he is unthinkingly following directions, he is flustered by Miss Manette's rudeness.`,
    ],
    correctAnswer: "A",
    explanation: `Mr. Lorry presents himself as an impersonal "speaking machine," but the narrator says he deliberately pretends to misunderstand Miss Manette and carefully frames the information as a business matter. His choices are purposeful, not accidental.

Exam 9 M2`,
  },
  {
    module: 2,
    passage: `Nisga'a poet Jordan Abel addresses the experiences of Indigenous people as European settlers and their descendants took over North America. Abel's first book of poetry, The Place of Scraps (2014), uses Totem Poles, a 1929 book by anthropologist Marius Barbeau, as source material. Abel claims that his use of Barbeau's text shows how anthropological texts can be used to portray Indigenous people differently based on the author.`,
    questionText: `Which finding, if true, would most directly support Abel's claim?`,
    choices: [
      `Abel intersperses Barbeau's text with images of Indigenous people and personal anecdotes written in the third person.`,
      `Abel explains that Barbeau presented two chiefs feuding over constructing the largest pole as unreasonable, yet other anthropologists claim that such arguments between chiefs of Indigenous tribes were important political exchanges.`,
      `The Place of Scraps won the Dorothy Livesay Poetry Prize and was a finalist for the Gerald Lampert Award.`,
      `Before Abel wrote The Place of Scraps, other Indigenous writers had used texts from anthropologists in their works.`,
    ],
    correctAnswer: "B",
    explanation: `Choice B shows the same type of behavior being portrayed differently by different authors, which directly supports Abel's claim that an author's perspective affects how Indigenous people are represented.

Exam 9 M2`,
  },
  {
    module: 2,
    passage: `Caribbean box jellyfish, despite having only 1,000 active neurons at a time and no central brain, demonstrated evidence of learning, according to a recent study in the journal Current Biology. The research classified learning into two types: nonassociative (like habituation) and associative, which involves connecting cues in the environment. The study's experiment involved placing jellyfish in tanks with different visual contrasts. Only jellyfish in tanks with medium-contrast stripes learned to associate the visual pattern with the risk of hitting a wall, adjusting their behavior rapidly after a few bumps. This study suggests that even simple animals can exhibit basic neural processes associated with learning, without needing complex structures like a human brain.`,
    questionText: `Which choice best states the main purpose of the text?`,
    choices: [
      `To analyze the various visual patterns perceived by jellyfish in different environments.`,
      `To explore the neural complexities and learning behaviors across marine species.`,
      `To investigate the potential for associative learning in a simple marine organism.`,
      `To compare the brain structures of humans, mice, and jellyfish and their role in learning.`,
    ],
    correctAnswer: "C",
    explanation: `The passage focuses on an experiment testing whether box jellyfish can connect a visual cue with the risk of collision. That is an investigation of associative learning in a simple organism.

Exam 9 M2`,
  },
  {
    module: 2,
    passage: `If you've ever been in an unhealthy work situation, you probably know how hard it can be to leave. Leaving a bad job is never easy, and each person's breaking point is different, so beating yourself up over why you stayed so long in a traumatic situation won't ______ from each experience will empower you to own your career choices and leave earlier if you find yourself in a comparable situation again.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `help however learning`,
      `help however, learning`,
      `help, however, learning`,
      `help; however, learning`,
    ],
    correctAnswer: "D",
    explanation: `"Beating yourself up ... won't help" and "learning from each experience will empower you" are independent clauses. A semicolon before the conjunctive adverb "however" and a comma after it correctly join them.`,
  },
  {
    module: 2,
    passage: `Electrically active constructs can have a beneficial effect on electroresponsive tissues, ______ the brain, heart, and nervous system. Conducting polymers (CPs) are being considered as components of these constructs because of their intrinsic electroactive and flexible nature.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `such as:`,
      `such as`,
      `such as,`,
      `such as---`,
    ],
    correctAnswer: "B",
    explanation: `The phrase "such as" directly introduces examples and should not be separated from them by punctuation. The sentence correctly reads "tissues, such as the brain, heart, and nervous system."

Exam 9 M2`,
  },
  {
    module: 2,
    passage: `To handle the increasing variety and complexity of managerial forecasting problems, many forecasting techniques have been developed in recent years. Each has ______ special use, and care must be taken to select the correct technique for a particular application.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `their`,
      `its`,
      `it's`,
      `they're`,
    ],
    correctAnswer: "B",
    explanation: `"Each" is singular, so the singular possessive pronoun "its" is required. "It's" means "it is," and the plural forms do not agree with "each."

Exam 9 M2 Transition`,
  },
  {
    module: 2,
    passage: `When bees pollinate flowers, they may be exposed to insecticides, potentially affecting their nervous systems. Recently, Dr. Rachel Parkinson of the University of Oxford added the common ______ to a sucralose solution to examine the insecticide's impact on honeybees' ability to walk in a straight line.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `insecticide sulfoxaflor`,
      `insecticide, sulfoxaflor,`,
      `insecticide sulfoxaflor,`,
      `insecticide, sulfoxaflor`,
    ],
    correctAnswer: "A",
    explanation: `"Sulfoxaflor" identifies which common insecticide was used, so it is essential information and should not be set off with commas.`,
  },
  {
    module: 2,
    passage: `Researchers studying bacteria have solved a 50-year mystery of how bacteria are able to move using appendages that are made of a single ______ the subunits of the protein can exist in 11 different shapes, allowing the appendages to "supercoil" into corkscrews that the bacteria use to propel themselves.`,
    questionText: `Which choice completes the text so that it conforms to the conventions of Standard English?`,
    choices: [
      `protein`,
      `protein while`,
      `protein,`,
      `protein:`,
    ],
    correctAnswer: "D",
    explanation: `The first clause is complete, and the following clause explains how a single protein can form the appendages. A colon correctly introduces that explanation.

Exam 9 M2`,
  },
  {
    module: 2,
    passage: `Fault tree analysis was originally used in engineering to enhance safety practices in high-risk fields, such as nuclear power and pharmaceuticals, but other fields are experimenting with ways to utilize this process to benefit their work. ______ fault tree analysis is also being used in low-risk fields, such as social services and software engineering.`,
    questionText: `Which choice completes the text with the most logical transition?`,
    choices: [
      `Increasingly,`,
      `Nevertheless,`,
      `Therefore,`,
      `In addition,`,
    ],
    correctAnswer: "A",
    explanation: `The passage describes fault tree analysis spreading from its original high-risk uses into a growing range of other fields. "Increasingly" most precisely signals this expanding trend.`,
  },
  {
    module: 2,
    passage: `When Monika Sosnowska began her career in Amsterdam as a painter, she never expected to branch out into other media. ______ she had primarily worked on canvas, but she quickly found her works evolving to include the three-dimensional space around her.`,
    questionText: `Which choice completes the text with the most logical transition?`,
    choices: [
      `Instead,`,
      `Consequently,`,
      `Previously,`,
      `Similarly,`,
    ],
    correctAnswer: "C",
    explanation: `The sentence contrasts her earlier work on canvas with the later development of three-dimensional work. "Previously" clearly refers to that earlier period.

Exam 9 M2`,
  },
  {
    module: 2,
    passage: `Fish sometimes appear in otherwise uninhabited bodies of water, seemingly emerging out of nowhere. Some scientists believe that the fish are carried to these locations in the beaks or talons of birds. ______ new research suggests that the fish eggs enter a state of hibernation and are actually eaten by birds and excreted out into the bodies of water.`,
    questionText: `Which choice completes the text with the most logical transition?`,
    choices: [
      `For instance,`,
      `Next,`,
      `Likewise,`,
      `Alternatively,`,
    ],
    correctAnswer: "D",
    explanation: `The new research offers a different explanation for how fish reach the water. "Alternatively" properly introduces this competing possibility.`,
  },
  {
    module: 2,
    passage: `The maturation of the prefrontal cortex (PFC) is linked to the development of declarative memory, but its exact role is unclear. A study on seventeen subjects aged 6.2 to 19.4 years found that earlier PFC activity predicted better memory, and the flow of activity between certain PFC subregions was crucial for memory formation, refining during adolescence. ______ middle frontal activity consistently influenced memory regardless of age.`,
    questionText: `Which choice completes the text with the most logical transition?`,
    choices: [
      `However,`,
      `Moreover,`,
      `In contrast,`,
      `Thus,`,
    ],
    correctAnswer: "C",
    explanation: `The previous sentence describes activity patterns that change or refine with age. The next sentence presents a contrasting finding: middle frontal activity influenced memory consistently regardless of age.

Exam 9 M2 Expression of Ideas`,
  },
  {
    module: 2,
    passage: `While researching a topic, a student has taken the following notes:
• To restore oyster reefs in Australia, limestone boulders are submerged to provide habitats, but baby oysters need help finding the boulders.
• A team from University of Adelaide looked into using sound as a way to encourage the baby oysters to attach to the boulders.
• The research team recorded sounds at the healthy Port Noarlunga Reef to play near the submerged boulders.
• Boulders in the area with the soundscape attracted around 17,000 more oysters per square meter compared to boulders without the soundscape.
• Soundscapes can indicate a healthy place for baby oysters to grow and can be a cost-effective way to restore oyster reefs.`,
    questionText: `The student wants to emphasize the aim of the research study. Which choice most effectively uses relevant information from the notes to accomplish this goal?`,
    choices: [
      `Researchers obtained a soundscape at Port Noarlunga Reef to help in the restoration of oyster reefs in Australia.`,
      `Researchers now know that the soundscape of a healthy marine ecosystem can attract baby oysters to attach to submerged limestone boulders.`,
      `After they measured the number of oysters attracted to boulders in the soundscape area compared to no soundscape, researchers determined that the soundscape attracted more baby oysters.`,
      `Researchers wanted to know whether a soundscape of a healthy marine ecosystem could encourage baby oysters to attach to submerged limestone boulders.`,
    ],
    correctAnswer: "D",
    explanation: `Choice D directly states what the researchers wanted to determine, which is the study's aim. The other choices emphasize the method or findings instead.

Exam 9 M2`,
  },
  {
    module: 2,
    passage: `While researching a topic, a student has taken the following notes:
• Neanderthals are an extinct species of humans who died out about 40,000 years ago and are the closest evolutionary relatives of present-day humans.
• Studying the genomes of Neanderthals provides insight into human evolution.
• Professor Svante Pääbo is a Swedish geneticist and the director of the Department of Genetics at the Max Planck Institute for Evolutionary Anthropology.
• His landmark study presented the first draft sequence of the Neanderthal genome.
• Laurits Skov of the Max Planck Institute for Evolutionary Anthropology has a doctorate in bioinformatics and studied evolutionary anthropology.
• One of his recent studies revealed the genomes of a family of Neanderthals.`,
    questionText: `The student wants to emphasize the affiliation and purpose of Pääbo's and Skov's work. Which choice most effectively uses relevant information from the notes to accomplish this goal?`,
    choices: [
      `The closest evolutionary relatives of present-day humans, Neanderthals went extinct about 40,000 years ago.`,
      `By studying the genomes of Neanderthals, Svante Pääbo and Laurits Skov of the Max Planck Institute for Evolutionary Anthropology provide insight into human evolution.`,
      `Svante Pääbo and Laurits Skov study the genome of Neanderthals, an extinct species of humans.`,
      `Studies by Svante Pääbo and Laurits Skov reveal information about Neanderthals, who died out about 40,000 years ago.`,
    ],
    correctAnswer: "B",
    explanation: `Choice B includes both researchers' shared affiliation with the Max Planck Institute and the purpose of their genomic research: providing insight into human evolution.`,
  },
];

export const SAT_EXAM_1_QUESTIONS: SatQuestion[] = EXAM_1_DRAFTS.map(
  (draft, index) => ({
    id: `exam-1-q-${index + 1}`,
    examId: 1,
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
