const form = document.querySelector("#budget-form");
const balanceInput = document.querySelector("#balance");
const paydayInput = document.querySelector("#payday");
const result = document.querySelector("#result");

const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
paydayInput.min = toDateValue(tomorrow);

const saved = JSON.parse(localStorage.getItem("daily-budget-inputs") || "{}");
if (saved.balance) balanceInput.value = Number(saved.balance).toLocaleString("ja-JP");
if (saved.payday && saved.payday >= paydayInput.min) paydayInput.value = saved.payday;

balanceInput.addEventListener("input", () => {
  const digits = balanceInput.value.replace(/\D/g, "").slice(0, 10);
  balanceInput.value = digits ? Number(digits).toLocaleString("ja-JP") : "";
  clearError("balance");
});

paydayInput.addEventListener("input", () => clearError("payday"));

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const balance = Number(balanceInput.value.replace(/,/g, ""));
  const payday = paydayInput.value ? new Date(`${paydayInput.value}T00:00:00`) : null;
  let valid = true;

  if (!balanceInput.value || !Number.isFinite(balance) || balance <= 0) {
    showError("balance", "1円以上の金額を入力してください");
    valid = false;
  }
  if (!payday) {
    showError("payday", "次の給料日を選んでください");
    valid = false;
  } else if (payday <= today) {
    showError("payday", "明日以降の日付を選んでください");
    valid = false;
  }
  if (!valid) {
    result.hidden = true;
    return;
  }

  const days = Math.round((payday - today) / 86400000);
  const daily = Math.floor(balance / days);
  document.querySelector("#daily-amount").textContent = daily.toLocaleString("ja-JP");
  document.querySelector("#days-left").textContent = `${days}日間`;
  document.querySelector("#payday-label").textContent = new Intl.DateTimeFormat("ja-JP", { month: "long", day: "numeric" }).format(payday);
  localStorage.setItem("daily-budget-inputs", JSON.stringify({ balance, payday: paydayInput.value }));
  result.hidden = false;
});

function toDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function showError(field, message) {
  document.querySelector(`#${field}-error`).textContent = message;
  document.querySelector(`#${field}`).setAttribute("aria-invalid", "true");
}

function clearError(field) {
  document.querySelector(`#${field}-error`).textContent = "";
  document.querySelector(`#${field}`).removeAttribute("aria-invalid");
}
