const display = document.getElementById("display");
const buttons = document.getElementById("buttons");
const tabs = document.querySelectorAll(".tab");

let mode = "simple";
let expression = "";
let lastAnswer = 0;

const simpleButtons = [
    "C", "DEL", "%", "/",
    "7", "8", "9", "*",
    "4", "5", "6", "-",
    "1", "2", "3", "+",
    "00", "0", ".", "="
];

const scientificButtons = [
    "sin", "cos", "tan", "sqrt",
    "log", "ln", "pi", "^",
    "C", "DEL", "(", ")",
    "7", "8", "9", "/",
    "4", "5", "6", "*",
    "1", "2", "3", "-",
    "0", ".", "%", "+",
    "Ans", "exp", "!", "="
];

function renderButtons() {
    buttons.innerHTML = "";

    const list = mode === "simple" ? simpleButtons : scientificButtons;

    list.forEach(value => {
        const button = document.createElement("button");
        button.textContent = value;

        if (["+", "-", "*", "/", "%", "^"].includes(value)) {
            button.classList.add("operator");
        }

        if (value === "=") {
            button.classList.add("equal");
        }

        if (["C", "DEL"].includes(value)) {
            button.classList.add("clear");
        }

        button.addEventListener("click", () => handleInput(value));
        buttons.appendChild(button);
    });
}

function handleInput(value) {
    if (value === "C") {
        expression = "";
        display.value = "";
        return;
    }

    if (value === "DEL") {
        expression = expression.slice(0, -1);
        display.value = expression;
        return;
    }

    if (value === "=") {
        calculate();
        return;
    }

    if (value === "Ans") {
        expression += String(lastAnswer);
    } else if (value === "exp") {
        expression += "exp(";
    } else if (["sin", "cos", "tan", "sqrt", "log", "ln"].includes(value)) {
        expression += value + "(";
    } else {
        expression += value;
    }

    display.value = expression;
}

function factorial(n) {
    if (!Number.isInteger(n) || n < 0 || n > 170) {
        throw new Error("Invalid factorial");
    }

    let result = 1;

    for (let i = 2; i <= n; i++) {
        result *= i;
    }

    return result;
}

function calculate() {
    try {
        if (!expression) return;

        let exp = expression.replace(/\s+/g, "");

        // Only allow digits, operators, brackets and letters
        if (!/^[0-9+\-*/().%!A-Za-z^]*$/.test(exp)) {
            throw new Error("Invalid input");
        }

        // Factorial: 5! or (3+2)!
        exp = exp.replace(/(\d+(?:\.\d+)?|\))!/g, "factorial($1)");

        // Constants and functions
        exp = exp.replace(/\bpi\b/g, "PI");
        exp = exp.replace(/\blog\(/g, "log10(");
        exp = exp.replace(/\bln\(/g, "log(");

        // Power operator
        exp = exp.replace(/\^/g, "**");

        // Reject any unknown words
        const leftover = exp.replace(
            /\b(?:factorial|sin|cos|tan|sqrt|log10|log|exp|PI)\b/g,
            ""
        );

        if (/[A-Za-z]/.test(leftover)) {
            throw new Error("Unknown function");
        }

        // Trigonometric functions use degrees
        const toRadians = x => x * Math.PI / 180;

        const result = Function(
            "factorial", "sin", "cos", "tan",
            "sqrt", "log10", "log", "exp", "PI",
            '"use strict"; return (' + exp + ')'
        )(
            factorial,
            x => Math.sin(toRadians(x)),
            x => Math.cos(toRadians(x)),
            x => Math.tan(toRadians(x)),
            Math.sqrt,
            Math.log10,
            Math.log,
            Math.exp,
            Math.PI
        );

        if (typeof result !== "number" || !Number.isFinite(result)) {
            throw new Error("Math error");
        }

        lastAnswer = result;
        expression = String(Number(result.toPrecision(10)));
        display.value = expression;

    } catch (error) {
        display.value = "Math Error";
        expression = "";
    }
}

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        mode = tab.dataset.mode;

        tabs.forEach(item => item.classList.remove("active"));
        tab.classList.add("active");

        expression = "";
        display.value = "";

        renderButtons();
    });
});

renderButtons();
