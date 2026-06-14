// HamstersarusOS — Magic Hamster Ball.
// A hamster-pun Magic 8-Ball: ask a yes/no question, shake the hamster ball,
// get a random punny answer. Purely decorative — no network, no persistence.

const HAMSTER_BALL_ANSWERS = [
  // yes-ish
  "Squeak yes! 🐹",
  "All signs point to seeds.",
  "Cheeks don't lie — yes.",
  "By the power of the wheel, yes. 🎡",
  "It is written in the seeds.",
  // maybe-ish
  "Ask again after my nap. 😴",
  "The wheel is still spinning…",
  "Reply hazy — too much sawdust.",
  "Cheeks too full to answer.",
  "Consult the bedding and try again.",
  // no-ish
  "Not a chance, you absolute walnut.",
  "No. *aggressively stuffs cheeks*",
  "The seeds say no.",
  "My whiskers sense doubt.",
  "Don't count your seeds before they sprout.",
];

function buildHamsterBall() {
  const root = document.createElement("div");
  root.className = "app-fortune";
  root.innerHTML =
    '<div class="fortune-ball"><span class="fortune-hamster">🐹</span></div>' +
    '<p class="fortune-answer">ask me a yes / no question…</p>' +
    '<input class="fortune-question" type="text" maxlength="120" placeholder="will i...?" />' +
    '<button class="fortune-shake">shake 🔮</button>';

  const ball = root.querySelector(".fortune-ball");
  const answerEl = root.querySelector(".fortune-answer");
  const questionEl = root.querySelector(".fortune-question");
  const shakeBtn = root.querySelector(".fortune-shake");

  let lastAnswer = "";
  let timer = null;

  function shake() {
    if (!questionEl.value.trim()) {
      answerEl.textContent = "ask me something first 🐹";
      return;
    }

    // pick a random answer, avoiding an immediate repeat
    let answer;
    do {
      answer = HAMSTER_BALL_ANSWERS[Math.floor(Math.random() * HAMSTER_BALL_ANSWERS.length)];
    } while (answer === lastAnswer && HAMSTER_BALL_ANSWERS.length > 1);
    lastAnswer = answer;

    answerEl.textContent = "…";
    ball.classList.remove("shaking");
    void ball.offsetWidth; // restart the wobble animation
    ball.classList.add("shaking");

    clearTimeout(timer);
    timer = setTimeout(() => {
      answerEl.textContent = answer;
    }, 650);
  }

  shakeBtn.addEventListener("click", shake);
  questionEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") shake();
  });

  return root;
}
