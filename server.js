const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

function formatPhone(phone) {
  phone = phone.trim();

  if (phone.startsWith("0")) {
    return "254" + phone.slice(1);
  }

  if (phone.startsWith("+254")) {
    return phone.replace("+", "");
  }

  return phone;
}

app.post("/send-bulk", async (req, res) => {
  try {
    const { phones, amount, description } = req.body;

    if (!phones || !phones.length) {
      return res.status(400).json({
        error: "No phone numbers provided"
      });
    }

    const results = [];

    for (const phone of phones) {
      const formattedPhone = formatPhone(phone);

      try {
        const response = await axios.post(
          "https://api.nestlink.co.ke/runPrompt",
          {
            phone: formattedPhone,
            amount,
            local_id: `ORDER_${Date.now()}_${formattedPhone}`,
            transaction_desc: description
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Api-Secret": process.env.NESTLINK_SECRET
            }
          }
        );

        results.push({
          phone: formattedPhone,
          success: true,
          response: response.data
        });

      } catch (err) {
        results.push({
          phone: formattedPhone,
          success: false,
          error: err.response?.data || err.message
        });
      }

      await new Promise(resolve => setTimeout(resolve, 300));
    }

    res.json(results);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
