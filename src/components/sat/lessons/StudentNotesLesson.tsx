import {
  ExampleQuestion,
  Explanation,
  Important,
} from "@/components/sat/lessons/lesson-blocks";

export function StudentNotesLesson() {
  return (
    <article className="mx-auto max-w-3xl pb-8 text-base leading-7 text-foreground">
      <h1 className="text-3xl font-bold tracking-tight">Student Notes</h1>

      <p className="mt-4">
        Probably, one of the easiest questions on SAT are Student Notes
        Questions. Therefore, students should not have problems when solving
        these types of questions. These types of questions consist of bullet
        points (usually 3-6) about a specific topic that “a student” collected
        for “an audience” and a question asking to emphasize, introduce or
        contradict particular idea.
      </p>

      <Important>
        Although the size of this type of questions might frighten a student,
        solving this questions takes a little time when compared to other types
        of questions, because in order to solve them student needs only a
        fraction of information provided from the question and bullet points.
      </Important>

      <h2 className="mt-10 text-xl font-bold">Solving Student Notes:</h2>
      <p className="mt-3">
        In order to solve these questions students must look{" "}
        <strong className="font-bold">firstly</strong> to the question that is
        aksed, since it plays very important role In choosing the right answer.
      </p>
      <Important>
        Sometimes students may even find the answer of the question just by
        looking at the question that is asked, not even looking at the bullet
        points.
      </Important>

      <h2 className="mt-10 text-xl font-bold">
        Student Notes questions contain:
      </h2>
      <p className="mt-3">
        <strong className="font-bold">Comparisons and Contrast</strong> – In
        most of the times these questions will ask a student to identify a
        similarity/contrast between people/objects/events. The correct choice
        of answer mostly contain words such as, like, unlike, whereas, in
        contrast, ect.
      </p>
      <p className="mt-4">
        <strong className="font-bold">Familiar and Unfamiliar</strong> – In
        addition to asking to identify similarity/contrast between
        people/objects/events, these questions might also ask for an additional
        background information regarding people/objects/events.
      </p>
      <Important>
        Important to note that question does not ask it straightforward: It
        will characterize “an audience” that these bullet points were collected
        for with the words such as Familiar/Unfamiliar. One should be able to
        understand that when “an audience” is characterized with the word
        Unfamiliar, the question asks for an additional background information
        in the correct answer choice. Whereas, familiar characterization will
        not ask for a background information.
      </Important>

      <p className="mt-10">
        Before Looking at the full example question, we will look at the
        Student Notes question without bullet points to show how these
        questions can be solved without them:
      </p>

      <ExampleQuestion
        prompt={
          <>
            The student wants to present a{" "}
            <strong className="font-bold">
              similarity between dinosaurs and modern birds
            </strong>
            . Which choice most effectively uses relevant information from the
            notes to achieve this goal?
          </>
        }
        choices={[
          "Dinosaurs’ mouths contained teeth; however, birds evolved toothless beaks over millions of years.",
          "Mei long, a duck-sized bipedal dinosaur from the Cretaceous era, was found preserved in volcanic ash.",
          "Birds’ Bones are hollow, a trait that was shared by many dinosaur species.",
          "Birds are descended from the theropod group of dinosaurs, which contained Tyrannosaurus rex.",
        ]}
      />

      <p>
        In order to solve this question lets look at whether the question asks
        us to find similarity or contrast. It seems that this question asks us
        to find similarity. After that we should look at the choices to find
        the similarity between these two animals.
      </p>
      <Explanation>
        <p>
          Choice A) uses transtions ‘However’ which is used to describe
          contrast, which should be a hint for us that this choice presents
          contrast which is not what a questions asks us.
        </p>
        <p>
          Choice B) only talks about dinosaur, whereas the correct answer should
          talk about the similarity between dinosaurs and modern birds
        </p>
        <p className="font-bold text-green-700 dark:text-green-500">
          Choice C) talks about a trait that was shared between dinosaur
          species and birds. Since it is a similarity between these two animals
          this is the correct answer
        </p>
        <p>
          Choice D) states that bords are descended from the group of dinosaurs
          that also contained T-rex. Although it might sound as some sort of
          similarity between these animals, we should select a stronger answer
          choice which is choice C).
        </p>
      </Explanation>

      <h2 className="mt-10 text-xl font-bold">Now lets look at the full example:</h2>

      <ExampleQuestion
        notes={[
          "Carrie Mae Weems (born 1953) is a photographer and installation artist whose works employ text, fabric, audio, digital images, and video.",
          "She has received major awards from the MacArthur Foundation and the American Academy in Rome.",
          "Her 2021 installation in Chicago featured photos, video, text, and furniture.",
          "Visitors were encouraged to browse and sit at desks in a recreation of a historic classroom.",
          "The same year, her “Cyclorama” exhibit at the New York City Armory included video projections, shadow puppets, and a voice-over narration.",
        ]}
        prompt={
          <>
            The student wants to emphasize the{" "}
            <strong className="font-bold">
              variety of materials employed by Weems
            </strong>{" "}
            to an audience unfamiliar with her work. Which choice most
            effectively uses relevant information from the notes to achieve this
            goal?
          </>
        }
        choices={[
          "Carrie Mae Weems’s artwork has been recognized by both the MacArthur Foundation and the American Academy in Rome.",
          "In 2021, Weems staged an installation in Chicago in which visitors were encouraged to participate directly in a recreation of a historic classroom.",
          "Carrie Mae Weems, who is considered among the most influential contemporary American artists, employs a diverse set of media: her shows include elements ranging from photos to furniture to shadow puppets.",
          "Carrie Mae Weems’s 2021 show in New York City, unlike her show in Chicago the same year, included shadow puppets as well as a voice-over narration.",
        ]}
      />

      <p>
        Now before looking at the answer choices, we must look the question and
        understand what should be in the correct answer choice.
      </p>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>
          It should emphasize the{" "}
          <strong className="font-bold">
            variety of materials employed by Weems
          </strong>
          .
        </li>
        <li>
          Because it is for an audience unfamiliar with the work of Weems, it
          must also provide some sort of background information explaining her
          or her work.
        </li>
      </ul>
      <p className="mt-4">
        Now lets look at the answer choices first.
      </p>
      <Important>
        Sometimes we might find two or more choices that satisfy the question’s
        requirements. Then, one should look at the bullet points to understand
        which answer choice used correct information from the bullet notes.
        Wrong choices will use wrong information which is not supported by the
        notes or use an information that is not even in the notes.
      </Important>
      <Explanation>
        <p>
          Choice A) is not the correct choice since it does not talk about the
          materials Weems uses.
        </p>
        <p>
          Choice B) also is not correct choice because it also does not talk
          about the materials Weems uses. It also lacks background information
          about Weems.
        </p>
        <p className="font-bold text-green-700 dark:text-green-500">
          Choice C) effectively gives background information regarding Weems and
          emphasizes the materials she uses.
        </p>
        <p>
          Choice D) does talk about the materials but does not include the
          background information about the Weems.
        </p>
      </Explanation>
      <p className="mt-4">
        <strong className="font-bold">So the correct answer is C).</strong>
      </p>
    </article>
  );
}
