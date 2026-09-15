import {
  ExampleQuestion,
  Explanation,
  Important,
} from "@/components/sat/lessons/lesson-blocks";

export function WordsInContextLesson() {
  return (
    <article className="mx-auto max-w-3xl pb-8 text-base leading-7 text-foreground">
      <h1 className="text-3xl font-bold tracking-tight">Words In Context</h1>

      <p className="mt-4">
        Words In Context questions are the first type of questions you will
        face in the SAT exam. However, it is recommended to skip these
        questions, and start your exam with Writing questions, since Words in
        Context questions sometimes can be challenging, putting pressure on the
        student.
      </p>
      <p className="mt-4">
        Words In Context questions consist of a medium sized text, which most
        of the times will have one word space in it, and answer choices as one
        word to put in that blank space. Here is an example question of Words
        In Context:
      </p>

      <ExampleQuestion
        prompt="For the construction of the Louvre Abu Dhabi, France joined forces with the United Arab Emirates to build a universal museum that critics considered truly ______: they praised it for its creative display of artistic works, using state-of-the-art technology that can offer visitors interactive displays, digital labels, and immersive audiovisual installations."
        choices={["profound", "innovative", "inconceivable", "discreet"]}
      />

      <h2 className="mt-10 text-xl font-bold">How to solve Words In Context:</h2>
      <Important>
        Since we don’t have a lot to work with, it is very important to learn
        as many words as possible to know each choice’s definition and meaning.
      </Important>
      <p className="mt-4">
        Although we don&apos;t have a lot to work with, a very important way to
        solve these questions is to read the text carefully and understand it
        as much as possible, since most of the times the text have the
        definition of the correct answer choice.
      </p>
      <p className="mt-4">
        In the example that we look at previously we can see that critics
        praised the universal museum for its creative display of artistic
        works, which can be described with the word “innovative” in the Choice
        B). To be sure that we choose the correct choice we can define other
        ones, as much as we know of course.
      </p>
      <Explanation>
        <p>A) Profound means intense</p>
        <p className="font-bold text-green-700 dark:text-green-500">
          B) “innovative”
        </p>
        <p>C) Inconceivable means unbelievable</p>
        <p>
          D) Discreet means careful, all of which do not work well with the
          text.
        </p>
      </Explanation>
    </article>
  );
}
