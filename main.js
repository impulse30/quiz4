import "./style.css";
import { Questions } from "./question";

const app = document.querySelector("#app");
const startButton = document.querySelector("#start");

startButton.addEventListener("click", startQuiz);

function startQuiz(event) {
  event.stopPropagation();

  const nameInput = document.createElement("input");
  nameInput.placeholder = "Entrez votre prénom";
  const submitNameButton = document.createElement("button");
  submitNameButton.innerText = "Commencer le quiz";

  app.innerHTML = ""; // Clear app for name input
  app.appendChild(nameInput);
  app.appendChild(submitNameButton);

  submitNameButton.addEventListener("click", () => {
    const userName = nameInput.value || "Utilisateur";
    startQuizSession(userName);
  });
}

function startQuizSession(userName) {
  let currentQuestion = 0;
  let score = 0;
  let level = 1;
  const totalQuestions = Questions.length;

  clean();
  displayQuestion(currentQuestion);

  function clean() {
    while (app.firstElementChild) {
      app.firstElementChild.remove();
    }
  }

  function displayQuestion(index) {
    clean();
    const question = Questions[index];

    if (!question) {
      displayFinishMessage(userName);
      return;
    }

    const progress = getProgressBar(totalQuestions, currentQuestion, level);
    app.appendChild(progress);

    const title = getTitleElement(question.question);
    app.appendChild(title);
    const answersDiv = createAnswers(question.answers);
    app.appendChild(answersDiv);

    const timerDisplay = startTimer(30); // 30 seconds for each question
    const submitButton = getSubmitButton();
    submitButton.addEventListener("click", () => {
      clearInterval(timerDisplay.interval); // Stop timer on submit
      submit(); // Handle answer submission
    });
    app.appendChild(submitButton);
  }

  function startTimer(seconds) {
    const timerDisplay = document.createElement("div");
    timerDisplay.classList.add("timer");
    app.appendChild(timerDisplay);

    let remainingTime = seconds;
    const interval = setInterval(() => {
      remainingTime--;
      timerDisplay.innerText = `Temps restant: ${remainingTime}s`;

      if (remainingTime <= 0) {
        clearInterval(interval);
        alert("Temps écoulé!");
        showCorrectAnswer(Questions[currentQuestion].correct);
        displayFinishMessage(userName); // End the quiz
      }
    }, 1000);

    return { interval, timerDisplay }; // Return both interval and display
  }

  function displayFinishMessage(userName) {
    const h1 = document.createElement("h1");
    h1.innerText = `Bravo ${userName}! Tu as terminé le quiz`;
    const p = document.createElement("p");
    p.innerText = `Tu as eu ${score} sur ${totalQuestions} points. Niveau: ${level}`;

    const restartButton = document.createElement("button");
    restartButton.innerText = "Recommencer le quiz";
    restartButton.addEventListener("click", () => {
      startQuizSession(userName); // Restart the quiz
    });

    app.appendChild(h1);
    app.appendChild(p);
    app.appendChild(restartButton);
  }

  function submit() {
    const selectedAnswer = app.querySelector('input[name="answer"]:checked');

    if (!selectedAnswer) return;

    const value = selectedAnswer.value;
    const question = Questions[currentQuestion];
    const isCorrect = question.correct === value;

    if (isCorrect) {
      score++;
      // Check for level up
      if ((currentQuestion + 1) % 5 === 0) {
        level++;
      }
      displayNextQuestionButton();
    } else {
      // If the answer is incorrect, show the correct answer and finish
      showCorrectAnswer(question.correct);
      displayFinishMessage(userName);
    }

    showFeedback(isCorrect, question.correct, value);
  }

  function showCorrectAnswer(correctAnswer) {
    const answerMessage = document.createElement("p");
    answerMessage.innerText = `Désolé, la bonne réponse était : ${correctAnswer}`;
    app.appendChild(answerMessage);
  }

  function displayNextQuestionButton() {
    const TIMEOUT = 4000;
    let remainingTimeout = TIMEOUT;

    app.querySelector("button").remove();

    const nextButton = document.createElement("button");
    nextButton.innerText = `Next (${remainingTimeout / 1000}s)`;
    app.appendChild(nextButton);
    const interval = setInterval(() => {
      remainingTimeout -= 1000;
      nextButton.innerText = `Next (${remainingTimeout / 1000}s)`;
    }, 1000);

    const timeout = setTimeout(() => {
      currentQuestion++;
      clearInterval(interval);
      displayQuestion(currentQuestion);
    }, TIMEOUT);

    nextButton.addEventListener("click", () => {
      clearInterval(interval);
      clearTimeout(timeout);
      currentQuestion++;
      displayQuestion(currentQuestion);
    });
  }

  function createAnswers(answers) {
    const answersDiv = document.createElement("div");
    answersDiv.classList.add("answers");

    for (const answer of answers) {
      const label = getAnswerElement(answer);
      answersDiv.appendChild(label);
    }
    return answersDiv;
  }
}

function getTitleElement(text) {
  const title = document.createElement("h3");
  title.innerText = text;
  return title;
}

function formatId(text) {
  return text.replaceAll(" ", "-").replaceAll('"', "'").toLowerCase();
}

function getAnswerElement(text) {
  const label = document.createElement("label");
  label.innerText = text;
  const input = document.createElement("input");
  const id = formatId(text);
  input.id = id;
  label.htmlFor = id;

  input.setAttribute("type", "radio");
  input.setAttribute("name", "answer");
  input.setAttribute("value", text);
  label.appendChild(input);
  return label;
}

function getSubmitButton() {
  const submitButton = document.createElement("button");
  submitButton.innerText = "Envoyer";
  return submitButton;
}

function showFeedback(isCorrect, correct, answer) {
  const correctAnswerId = formatId(correct);
  const correctElement = document.querySelector(
    `label[for="${correctAnswerId}"]`
  );
  const selectedAnswerId = formatId(answer);
  const selectedElement = document.querySelector(
    `label[for="${selectedAnswerId}"]`
  );

  correctElement.classList.add("correct");
  selectedElement.classList.add(isCorrect ? "correct" : "incorrect");
}

function getProgressBar(maxQuestions, currentQuestion, level) {
  const progressContainer = document.createElement("div");
  progressContainer.classList.add("progress-container");

  const progress = document.createElement("progress");
  progress.setAttribute("max", maxQuestions);
  progress.setAttribute("value", currentQuestion + 1); // +1 to show the current question in progress
  progress.className = `level-${level}`; // Add level-based class for styling

  const levelIndicator = document.createElement("div");
  levelIndicator.classList.add("level-indicator");
  levelIndicator.innerText = `Niveau: ${level}`;

  progressContainer.appendChild(progress);
  progressContainer.appendChild(levelIndicator);

  return progressContainer;
}

function disableAllAnswers() {
  const radioInputs = document.querySelectorAll('input[type="radio"]');

  for (const radio of radioInputs) {
    radio.disabled = true;
  }
}
