import { Rng } from "./rng";
import { MODEL_VERSIONS } from "./models";
import { minutesAgo } from "./time";

export type FeedbackRating = "good" | "bad" | null;
export type FeedbackCategory = "Coding" | "Reasoning" | "Creative" | "Factual QA" | "Summarization";

export interface FeedbackItem {
  id: string;
  modelId: string;
  category: FeedbackCategory;
  prompt: string;
  output: string;
  rating: FeedbackRating;
  flaggedForTraining: boolean;
  correction: string | null;
  gradedBy: string | null;
  gradedAt: number | null;
  createdAt: number;
}

const SEED_ITEMS: { category: FeedbackCategory; prompt: string; output: string }[] = [
  { category: "Coding", prompt: "Write a Python function to check if a string is a palindrome.", output: "def is_palindrome(s):\n    s = s.lower().replace(' ', '')\n    return s == s[::-1]" },
  { category: "Coding", prompt: "Explain the difference between let and const in JavaScript.", output: "`let` declares a variable that can be reassigned; `const` declares one that cannot be reassigned after initialization. Both are block-scoped, unlike `var`." },
  { category: "Coding", prompt: "Fix the bug: for i in range(10) print(i)", output: "Missing colon — it should be: for i in range(10): print(i)" },
  { category: "Reasoning", prompt: "If a train leaves at 3pm going 60mph and another leaves at 4pm going 80mph on the same route, when does the second train catch up?", output: "The first train has a 60-mile head start. The second closes the gap at 20mph, so it takes 3 hours — catching up at 7pm." },
  { category: "Reasoning", prompt: "A farmer has 17 sheep, all but 9 die. How many are left?", output: "9 sheep are left — \"all but 9\" means 9 survived." },
  { category: "Reasoning", prompt: "I have two coins that total 30 cents, and one is not a nickel. What are the coins?", output: "A quarter and a nickel — the quarter is \"not a nickel,\" but the other coin is." },
  { category: "Creative", prompt: "Write a two-line poem about autumn.", output: "Leaves let go without a sound,\npainting gold across the ground." },
  { category: "Creative", prompt: "Give me a tagline for a coffee shop that opens at 5am.", output: "\"Before the sun does, we do.\"" },
  { category: "Factual QA", prompt: "What year was the Eiffel Tower completed?", output: "The Eiffel Tower was completed in 1889." },
  { category: "Factual QA", prompt: "What is the capital of Australia?", output: "Sydney." },
  { category: "Factual QA", prompt: "Who wrote \"Pride and Prejudice\"?", output: "Jane Austen wrote \"Pride and Prejudice,\" published in 1813." },
  { category: "Summarization", prompt: "Summarize: \"The committee met for three hours and after extensive debate postponed the vote to next quarter, citing the need for further budget analysis.\"", output: "The committee delayed its vote to next quarter pending further budget review." },
];

const LIVE_MODELS = MODEL_VERSIONS.filter((m) => m.status === "production" && m.modality === "text");

function generateFeedback(): FeedbackItem[] {
  const rng = new Rng(2915);
  return SEED_ITEMS.map((seed, i) => {
    const graded = i < 4;
    return {
      id: rng.id("fb"),
      modelId: rng.pick(LIVE_MODELS).id,
      category: seed.category,
      prompt: seed.prompt,
      output: seed.output,
      rating: graded ? rng.pick(["good", "bad"] as const) : null,
      flaggedForTraining: graded ? rng.bool(0.4) : false,
      correction: null,
      gradedBy: graded ? "Priya Nair" : null,
      gradedAt: graded ? minutesAgo(rng.int(30, 2000)) : null,
      createdAt: minutesAgo(rng.int(60, 60 * 24 * 10)) - i,
    };
  });
}

export const FEEDBACK_ITEMS: FeedbackItem[] = generateFeedback();
