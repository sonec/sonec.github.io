function csvJSON(csv) {

  var lines = csv.split("\n");

  var result = [];

  // NOTE: If your columns contain commas in their values, you'll need
  // to deal with those before doing the next step 
  // (you might convert them to &&& or something, then covert them back later)
  // jsfiddle showing the issue https://jsfiddle.net/
  var headers = lines[0].split(",");

  for (var i = 1; i < lines.length; i++) {

    var obj = {};
    var currentline = lines[i].split(",");

    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }

    result.push(obj);

  }

  //return result; //JavaScript object
  return JSON.stringify(result); //JSON
}

var states;
var electorates;
var candidatesMP;
var candidatesSEN = "";

async function populateSEN() {
  if (candidatesSEN === "") {
    const senateURL = 'senate-candidates.csv';
    const requestURL = senateURL;
    const request = new Request(requestURL);

    const response = await fetch(request);
    const body = await response.text();
    candidatesSEN = JSON.parse(csvJSON(body));
  }
  const section = document.querySelector("#candidates");
  section.textContent = "";
  var list;
  var columns = []
  var group;
  var sen_group;
  var sen_item;
  var selected_state = document.querySelector("#states").value
  if (selected_state === "Select") {
    section.innerHTML = "<div class='row'><div class='col'>Please select state!</div></div>";
    return;
  }
  var selected_electorate = document.querySelector("#electorates");
  selected_electorate.value = "Select";
  list = document.createElement("ul");
  list.classList.add("list-group", "list-group-horizontal", "position-relative");
  section.appendChild(list);
  for (const c of candidatesSEN) {
    if (c.state === selected_state) {
      if (!columns.includes(c.column)) {
        group = document.createElement("li");
        group.classList.add("list-group-item", "sen_group");
        columns.push(c.column);
        group.innerHTML = "<div class='row'>" + `${addBox()}<div class='col'>${c.column}<br />${shooter(c.groupName)}</div></div><hr>`;
        list.appendChild(group);
        sen_group = document.createElement("ul");
        sen_group.classList.add("list-group");
        group.appendChild(sen_group);
      }
      sen_item = document.createElement("li");
      sen_item.classList.add("list-group-item", "sen_can");
      sen_item.innerHTML = "<div class='row'>" + addBox() + `<div class='col'>${c.surname}<br />${c.ballotGivenName}</div></div>`;
      sen_group.appendChild(sen_item);
    }
  }
  section.innerHTML = "<div class='row'></div>"
    + "<div class='row'><p>"
    + "<b>Above the line</b>: "
    + "Number at least 6 boxes for parties or groups in the order of your choice (with number 1 as your first choice)."
    + "<br />"
    + "<b>Below the line</b>: "
    + "Number at least 12 boxes for individual candidates in the order of your choice (with number 1 as your first choice)."
    + "<br />"
    + "You can number as many additional boxes as you choose when voting either above the line (i.e. more than six boxes) or below the line (i.e. more than twelve boxes)."
    + "</p></div>"
    + section.innerHTML;
}

async function populateMP() {
  const houseURL = 'house-candidates.csv';
  const requestURL = houseURL
  const request = new Request(requestURL);

  const response = await fetch(request);
  const body = await response.text();

  candidatesMP = JSON.parse(csvJSON(body));
  var divisions = [];
  for (const mp of candidatesMP) {
    divisions.push({ state: mp.state, division: mp.division });
  }

  states = [...new Set(divisions.map(item => item.state))];
  electorates = [...new Map(divisions.map(item => [item['division'], item])).values()];

  populateStates(states);
}

function populateStates() {
  const dropdown = document.querySelector("#states");
  for (const s of states) {
    var option = document.createElement('option');
    if (s.length > 0) {
      option.text = s;
      option.value = s;
      dropdown.add(option);
    }
  }
}

function populateElectorates(object) {
  var selected_state = object.value;
  if(selected_state=="Select")
  {
    document.querySelector(".electorate").style.visibility = "hidden";
    document.querySelector(".senate").style.visibility = "hidden";
    const section = document.querySelector("#candidates");
    section.innerHTML = "";
    return;
  }
  const section = document.querySelector("#candidates");
  section.textContent = "";
  const dropdown = document.querySelector("#electorates");
  dropdown.options.length = 1;
  for (const e of electorates) {

    if (!e.state.includes(selected_state)) {
      continue
    }
    var option = document.createElement('option');
    option.text = e.division;
    option.value = e.division;
    dropdown.add(option);
  }
  document.querySelector(".electorate").style.visibility = "visible";
  document.querySelector(".senate").style.visibility = "visible";
}

function populateBallot(object) {
  var electorate = object.value;
  var counter = 0;
  const section = document.querySelector("#candidates");
  section.textContent = "";
  if(electorate == "Select"){
    section.innerHTML = "";
    return;
  }
  for (const candidate of candidatesMP) {
    if (candidate.division === electorate) {
      section.innerHTML = section.innerHTML + "<div class='row'>" + addBox() +
        `<div class='col'>${candidate.surname}, ${candidate.ballotGivenName}<br/>${shooter(candidate.partyBallotName)}</div></div>`;
      counter++;
    }
  }
  section.innerHTML = `<div class='row'></div><div class='row'>Number the boxes from 1 to ${counter} in the order of your choice:</div>` + section.innerHTML;
}

function addBox() {
  return "<div class='square'><input class='number' type='text' maxlength='3' size='3'/></div>";
}

function shooter(party){
  if(party=="\"Shooters"){
    return "Shooters, Fishers and Farmers Party";
  }
  return party;
}
