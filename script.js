function addTopic() {
    let subject = document.getElementById("subject").value;
    let topic = document.getElementById("topic").value;
    let strength = document.getElementById("strength").value;

    let list = document.getElementById("list");

    let li = document.createElement("li");
    li.innerText = `${subject} - ${topic} (${strength})`;

    list.appendChild(li);
}