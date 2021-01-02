const socket = io();

const inboxPeople = document.querySelector(".inbox_people");
const inputField = document.querySelector(".message_form_input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages_history");
const fallback = document.querySelector(".fallback");

let userName = "";

const newUserConnected = (user) => {
  userName = user || `User_${Math.floor(Math.random() * 1000000)}`;
  socket.emit("new user", userName);
  addToUsersBox(userName);
};

const addToUsersBox = (userName) => {
  if (!!document.querySelector(`.${userName}-userlist`)) {
    return;
  }

  const userBox = `
    <div class="chat_ib ${userName}-userlist">
      <h5>${userName}</h5>
    </div>
  `;
  inboxPeople.innerHTML += userBox;
};

const addNewMessage = ({ user, message }) => {
  const time = new Date();
  const formattedTime = time.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
  });

  const receivedMsg = `
    <div class="received_message">
      <p>${message}</p>
      <div class="message_info">
        <span class="message_author">${user}</span>
        <span class="time_date">${formattedTime}</span>
      </div>
    </div>`;

  const myMsg = `
    <div class="sent_message">
      <p>${message}</p>
      <div class="message_info">
        <span class="time_date">${formattedTime}</span>
      </div>
    </div>`;

  messageBox.innerHTML += user === userName ? myMsg : receivedMsg;
};

// new user is created so we generate nickname and emit event
newUserConnected();

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!inputField.value) {
    return;
  }

  socket.emit("chat message", {
    message: inputField.value,
    name: userName,
  });

  inputField.value = "";
});

inputField.addEventListener("keyup", () => {
  socket.emit("typing", {
    isTyping: inputField.value.length > 0,
    name: userName,
  });
});

socket.on("new user", function (data) {
  data.map((user) => addToUsersBox(user));
});

socket.on("user disconnected", function (userName) {
  document.querySelector(`.${userName}-userlist`).remove();
});

socket.on("chat message", function (data) {
  addNewMessage({ user: data.name, message: data.message });
});

socket.on("typing", function (data) {
  const { isTyping, name } = data;

  if (!isTyping) {
    fallback.innerHTML = "";
    return;
  }

  fallback.innerHTML = `<p>${name} is typing...</p>`;
});
