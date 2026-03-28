let topics = [];

function addTopic() {
    let subject = document.getElementById("subject").value;
    let topic = document.getElementById("topic").value;
    let strength = document.getElementById("strength").value;

    topics.push({subject, topic, strength});

    displayTopics();
    generatePlan();
}

function displayTopics() {
    let list = document.getElementById("list");
    list.innerHTML = "";

    topics.forEach(t => {
        let li = document.createElement("li");
        li.innerText = `${t.subject} - ${t.topic} (${t.strength})`;
        list.appendChild(li);
    });
}

function generatePlan() {
    let weakTopics = topics.filter(t => t.strength === "weak");

    let existing = document.getElementById("suggestion");
    if (existing) existing.remove();

    if (weakTopics.length > 0) {
        let suggestion = document.createElement("h3");
        suggestion.id = "suggestion";
        suggestion.innerText = `🔥 Focus today: ${weakTopics[0].topic}`;
        document.body.appendChild(suggestion);
    }
}
