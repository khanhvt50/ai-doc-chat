const chat = document.getElementById("chat");
const input = document.getElementById("input");

// ENTER to send
input.addEventListener("keypress", function (e) {
  if (e.key === "Enter") send();
});

// add message
function addMessage(text, type) {
  const msg = document.createElement("div");
  msg.className = "msg " + type;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerText = text;

  msg.appendChild(bubble);
  chat.appendChild(msg);

  chat.scrollTop = chat.scrollHeight;
}

// typing effect
function typeEffect(text, element) {
  let i = 0;
  const speed = 15;

  function typing() {
    if (i < text.length) {
      element.innerText += text.charAt(i);
      i++;
      setTimeout(typing, speed);
    }
  }

  typing();
}

// send
async function send() {
  const question = input.value.trim();
  if (!question) return;

  addMessage(question, "user");
  input.value = "";

  // loading
  const msg = document.createElement("div");
  msg.className = "msg bot";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerText = "Đang suy nghĩ...";

  msg.appendChild(bubble);
  chat.appendChild(msg);

  chat.scrollTop = chat.scrollHeight;

  try {
    const res = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    });

    const data = await res.json();

    bubble.innerText = "";
    typeEffect(data.answer, bubble);

  } catch (err) {
    bubble.innerText = "Lỗi server";
  }
}

// new chat
function newChat() {
  chat.innerHTML = "";
}