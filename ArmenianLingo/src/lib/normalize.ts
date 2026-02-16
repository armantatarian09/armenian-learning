export function normalizeAnswer(input: string) {
  return input
    .trim()
    .toLocaleLowerCase("en")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export function isAnswerCorrect(answer: string, acceptedAnswers: string[]) {
  const normalized = normalizeAnswer(answer);
  return acceptedAnswers.some((candidate) => normalizeAnswer(candidate) === normalized);
}
