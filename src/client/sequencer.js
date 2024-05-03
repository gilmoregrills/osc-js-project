class gridItem {
  constructor(position, isActive) {
    this.position = position;
    this.isActive = isActive;
    this.isHighlighted = false;
  }

  toggleActive() {
    this.isActive = !this.isActive;
  }

  generateInnerHTML() {
    var character = this.isActive ? "x" : ".";
    return `
      <p>${character}</p>
    `;
  }

  render() {
    const div = document.getElementById(this.position);
    div.innerHTML = this.generateInnerHTML();
  }

  initialise(row) {
    const div = document.createElement("div");
    div.id = this.position;
    div.class = "seqItem";
    div.innerHTML = this.generateInnerHTML();
    div.addEventListener("click", (e) => {
      this.handleClick(e);
    });
    row.appendChild(div);
  }

  handleClick(e) {
    this.toggleActive();
    this.render();
  }
}

const makeGrid = () => {
  const rows = [];

  for (let i = 0; i < 4; i++) {
    const row = [];
    var x = i;
    for (let i = 0; i < 8; i++) {
      var y = i;
      row.push(new gridItem(`${x}${y}`, false));
    }
    rows.push(row);
  }

  return rows;
};

const getRandomInt = (min, max) => {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
};

const generateMessageStringForInputFields = () => {
  const channel = getRandomInt(1, 4);
  const pitch = getRandomInt(1, 13);
  const octave = getRandomInt(1, 8);
  const length = 8;
  return `${channel} ${pitch} ${octave} ${length}`;
};

export const makeSequencer = () => {
  const grid = makeGrid();
  var exampleMessages = [];
  for (let i = 0; i < grid.length; i++) {
    exampleMessages.push(generateMessageStringForInputFields());
  }
  const sequencer = document.getElementById("sequencer");
  sequencer.innerHTML =
    "<p>sequences <a href='/spec/'>messages</a> that broadcast to all clients</p>";

  // iterate through the grid
  grid.forEach((row, rowIndex) => {
    // create a parent div for each row
    const seqRow = document.createElement("div");
    seqRow.id = rowIndex;
    seqRow.className = "sequencer-row";

    // iterate through each note in the row
    row.forEach((item, itemIndex) => {
      // create a button for each note
      item.initialise(seqRow);
    });
    const msgField = document.createElement("input");
    msgField.type = "text";
    msgField.value = exampleMessages[rowIndex];
    msgField.id = `sequencer-message-field-${rowIndex}`;
    seqRow.appendChild(msgField);
    sequencer.appendChild(seqRow);
  });
  return grid;
};
