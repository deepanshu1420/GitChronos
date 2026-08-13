import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";
import random from "random";
import readline from "readline";

const path = "./data.json";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

const askUntilValid = async (question, validator) => {
  while (true) {
    const input = await ask(question);
    const result = validator(input);
    if (result.valid) return result.value;
    console.log(result.error);
  }
};

const makeCommits = (n, startDate, endDate) => {
  if (n === 0) {
    console.log("✅ All commits pushed successfully!");
    rl.close();
    return simpleGit().push(); // ✅ push wapas add kiya
  }

  const start = moment(startDate);
  const end = moment(endDate);
  const diff = end.diff(start, "days");
  const randomDays = diff === 0 ? 0 : random.int(0, diff);
  const date = start.clone().add(randomDays, "days").format();

  const data = { date: date, id: Date.now() };
  console.log(`Committing: ${date} | Remaining: ${n}`);

  jsonfile.writeFile(path, data, (writeError) => {
    if (writeError) {
      console.error("❌ File write failed:", writeError.message); // ✅ writeFile error handle
      rl.close();
      return;
    }

    simpleGit()
      .add([path])
      .commit(
        "Commit Successful!",
        { "--date": date },
        (error) => {
          if (error) {
            console.error("❌ Commit failed:", error.message);
            rl.close();
            return;
          }
          makeCommits(n - 1, startDate, endDate);
        }
      );
  });
};

const main = async () => {
  console.log("\n🟢 GitChronos — Custom Commit Scheduler\n");

  const startDate = await askUntilValid("📅 Start date (YYYY-MM-DD): ", (input) => {
    const date = moment(input, "YYYY-MM-DD", true);
    if (!date.isValid()) return { valid: false, error: "❌ Invalid date! Use YYYY-MM-DD format (e.g. 2025-01-15)" };
    return { valid: true, value: date };
  });

  const endDate = await askUntilValid("📅 End date   (YYYY-MM-DD): ", (input) => {
    const date = moment(input, "YYYY-MM-DD", true);
    if (!date.isValid()) return { valid: false, error: "❌ Invalid date! Use YYYY-MM-DD format (e.g. 2025-08-11)" };
    if (date.isAfter(moment())) return { valid: false, error: "❌ End date can't be in the future!" };
    if (date.isBefore(startDate)) return { valid: false, error: "❌ End date must be after start date!" };
    return { valid: true, value: date };
  });

  const count = await askUntilValid("🔢 Number of commits: ", (input) => {
    const n = parseInt(input);
    if (!/^\d+$/.test(input.trim()) || n <= 0) return { valid: false, error: "❌ Enter a valid number! (e.g. 50)" };
    return { valid: true, value: n };
  });

  console.log(`\n🚀 Starting ${count} commits from ${startDate.format("DD MMM YYYY")} to ${endDate.format("DD MMM YYYY")}\n`);
  makeCommits(count, startDate, endDate);
};

main();