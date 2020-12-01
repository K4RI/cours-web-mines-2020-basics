import ky from "ky";
import $ from "jquery";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

function getMessageView(message) {
  const date = new Date(message.timestamp);
  const formattedDate = format(date, "PPPPp", { locale: fr });
  // const dateDistance = formatDistance(date, new Date(), { locale: fr });

  return `<div class="card mb-3">
  <div class="card-body">
      <p class="card-text">${message.content}</p>
  </div>
  <div class="card-footer text-muted text-right">
      Par ${message.author}, ${formattedDate}
  </div>
</div>`;
}

function displayMessages(messages) {
  const $messagesContainer = $(".messages-container");

  // Clear list content on view
  $messagesContainer.empty();

  // Iterate on messages and display getMessageView(message);
  $messagesContainer.append(messages.map((message) => getMessageView(message)));
}

async function refreshMessages() {
  let pageIndex = 0; // retient la page courante
  let messages = []; // liste de msg de la page courante
  let hasMessages = true; // a-t-on encore des messages à chercher
  while (hasMessages) {
    // GET https://ensmn.herokuapp.com/messages
    // eslint-disable-next-line
    const pageMessages = await ky
      .get(`https://ensmn.herokuapp.com/messages?page=${pageIndex}`)
      .json();
    hasMessages = pageMessages.length > 0;
    pageIndex += 1;
    messages = messages.concat(pageMessages);
  }

  displayMessages(messages.reverse());
}

function sendMessage(message) {
  // POST https://ensmn.herokuapp.com/messages (username, message)
  // After success, getMessages()
  ky.post("https://ensmn.herokuapp.com/messages", { json: message }).then(() =>
    refreshMessages()
  );
}

$("body").on("submit", "#form-send", (event) => {
  event.preventDefault();
  const $form = $("#form-send");

  const data = $form.serializeArray();

  const messageData = {};

  data.forEach(({ name, value }) => {
    messageData[name] = value;
  });

  if (
    messageData.username == null ||
    messageData.username.length === 0 ||
    messageData.message === null ||
    messageData.message.length === 0
  ) {
    return;
  }

  sendMessage(messageData);
  $("#message").val("");
});

refreshMessages();

/*
setInterval(() => {
  refreshMessages();
}, 10000);
*/
