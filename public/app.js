async function sendBulk() {
  const numbersInput =
    document.getElementById("numbers").value;

  const amount =
    document.getElementById("amount").value;

  const description =
    document.getElementById("description").value;

  const numbers = numbersInput
    .split(/[\n,]+/)
    .map(n => n.trim())
    .filter(Boolean);

  const resultsDiv =
    document.getElementById("results");

  resultsDiv.innerHTML = "Sending requests...";

  const response = await fetch("/send-bulk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      phones: numbers,
      amount,
      description
    })
  });

  const data = await response.json();

  resultsDiv.innerHTML = "";

  data.forEach(item => {
    const div = document.createElement("div");

    div.className =
      "result " +
      (item.success ? "success" : "error");

    div.innerHTML = `
      <strong>${item.phone}</strong><br>
      ${item.success ? "Success" : "Failed"}
    `;

    resultsDiv.appendChild(div);
  });
}
