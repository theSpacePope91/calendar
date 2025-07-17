let currentEntry = null;
const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const today = new Date();
let startOfWeek = new Date(today);
const dayIndex = today.getDay(); 
const offset = dayIndex===0 ? -6 : 1-dayIndex;
startOfWeek.setDate(startOfWeek.getDate()+offset);

function formatTime(decimalHour) {
  let hours = Math.floor(decimalHour),
      minutes = (decimalHour%1)*60,
      ampm = hours<12?"AM":"PM";
  hours = (hours%12)||12;
  return String(hours).padStart(2,'0') + ":" + String(minutes).padStart(2,'0') + " " + ampm;
}
function formatDate(currentDate) {
  const mm = String(currentDate.getMonth()+1).padStart(2,'0'),
        dd = String(currentDate.getDate()).padStart(2,'0'),
        yy = currentDate.getFullYear();
  return `${mm}/${dd}/${yy}`;
}

// Build the timetable columns
function createCalendarGrid(){
  const timeCol = document.getElementById("timeColumn"),
        cal = document.getElementById("calendar");
  timeCol.innerHTML=""; cal.innerHTML="";

  // empty header cell
  const empty1 = document.createElement("div");
  empty1.className = "empty";
  timeCol.appendChild(empty1);

 const empty2 = document.createElement("div");
  empty2.className = "empty";
  timeCol.appendChild(empty2);

  // time slots down left
  for(let t=6; t<23.25; t+=0.25){
    const slot = document.createElement("div");
    slot.className="time-slot";
    slot.textContent = formatTime(t);
    timeCol.appendChild(slot);
  }


  // one column per day
  days.forEach((day,i)=>{
    const col = document.createElement("div");
    col.className="dayColumn";

    const blankHeader = document.createElement("div");
	blankHeader.className = "empty";
	col.appendChild(blankHeader);

    // header label
    const label = document.createElement("div");
    label.className="dayLabel";

    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate()+i);
    label.innerHTML = `${day} <br>${formatDate(currentDate)}`;
    col.appendChild(label);

    // scrolling day slots
    const container = document.createElement("div");
    container.className="daySlots";
    for(let t=6; t<23.25; t+=0.25){
      const slot = document.createElement("div");
      slot.className="time-slot";
      slot.dataset.time = formatTime(t);
      slot.dataset.date = formatDate(currentDate
);
      slot.style.position = "relative";
      container.appendChild(slot);
    }
    col.appendChild(container);
    cal.appendChild(col);
  });
}

// Populate the time & date dropdowns
function populateTimeSelects(){
  ["addTimeSelect","editTimeSelect"].forEach(id=>{
    const sel = document.getElementById(id);
    sel.innerHTML = '<option value="">Select Time</option>';
    for(let t=6; t<23.25; t+=0.25){
      const opt = document.createElement("option");
      opt.value = formatTime(t);
      opt.textContent = formatTime(t);
      sel.appendChild(opt);
    }
  });
}
function populateDateSelects(){
  ["addDateSelect","editDateSelect"].forEach(id=>{
    const sel = document.getElementById(id);
    sel.innerHTML = '<option value="">Select Date</option>';
    days.forEach((day,i)=>{
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate()+i);
      const val = formatDate(currentDate),
            opt = document.createElement("option");
      opt.value = val;
      opt.textContent = `${day} ${val}`;
      sel.appendChild(opt);
    });
  });
}

// Calculate and display totals
function calculateTotals(){
  let direct=0, indirect=0;
  document.querySelectorAll(".calendarEntry").forEach(en=>{
    const m = en.querySelector(".entryHeader")
                .textContent
                .match(/\((Direct|Indirect|N\/A),\s*([\d.]+)h\)/);
    if(m){
      if(m[1]==="Direct"){
      	direct+=parseFloat(m[2]);
      } else if (m[1] === "Indirect") {
        indirect+=parseFloat(m[2]);
    	}
   }
  });
  document.getElementById("hourDisplay").innerHTML =
    `Direct Hours: ${direct.toFixed(2)}<br>Indirect Hours: ${indirect.toFixed(2)}`;
}

function calculateYearlyTotals() {
  let yearDirect = 0,
      yearIndirect = 0;
  const all = JSON.parse(localStorage.getItem("calendarEntries") || "[]");
  all.forEach(({header}) => {
    const m = header.match(/\((Direct|Indirect),\s*([\d.]+)h\)/);
    if (m) {
      if (m[1] === "Direct")   yearDirect   += parseFloat(m[2]);
      else /*Indirect/N/A*/     yearIndirect += parseFloat(m[2]);
    }
  });
  document.getElementById("yearDisplay").innerHTML =
    `Year-Direct: ${yearDirect.toFixed(2)}h<br>Year-Indirect: ${yearIndirect.toFixed(2)}h`;
}

// Helper: find the correct slot div by date+time
function findSlot(date,time){
  return Array.from(document.querySelectorAll(".time-slot"))
    .find(s=> s.dataset.date===date && s.dataset.time===time );
}

function saveEntries() {
	const all = Array.from(document.querySelectorAll(".calendarEntry")).map(ent => ({
		id: ent.dataset.id,
		date: ent.dataset.date,
		time: ent.dataset.time,

		header: ent.querySelector(".entryHeader").textContent,

		notes: ent.querySelector(".entryNotes").value,
		height: ent.style.height
	}));
	localStorage.setItem("calendarEntries", JSON.stringify(all));
}

function loadEntries() {
  const raw = localStorage.getItem("calendarEntries");
  if (!raw) return;
  const all = JSON.parse(raw);
  all.forEach(createEntryFromData);
}

function openView(entry) {
  // grab the values out of the entry
  const time = entry.getAttribute("data-time");
  const date = entry.getAttribute("data-date");
  const header = entry.querySelector(".entryHeader").textContent;
  // header is like "Label (Type, Xh)"
  const [, label, type, hours] = /(.+?) \((Direct|Indirect|N\/A), ([\d.]+)h\)/.exec(header);

  // notes live in the textarea inside the entry
  const notes = entry.querySelector(".entryNotes")?.value || "";

  // populate the view modal
  document.getElementById("viewTime").textContent = time;
  document.getElementById("viewDate").textContent = date;
  document.getElementById("viewType").textContent = type;
  document.getElementById("viewHours").textContent = hours + "h";
  document.getElementById("viewNotes").textContent = notes;

  // store a reference so the Edit button knows which entry to work on
  document.getElementById("viewEditBtn").dataset.entryId = entry.dataset.id;

  // show it
  document.getElementById("viewModal").style.display = "block";
}

function createEntryFromData({id, date, time, header, notes, height}) {
  const slot = findSlot(date, time);
  if (!slot) return;  // if your week has changed, might not find it

  const entry = document.createElement("div");
  entry.className = "calendarEntry";
  entry.dataset.id    = id;
  entry.dataset.date  = date;
  entry.dataset.time  = time;

  entry.innerHTML = `
    <div class="entryHeader">${header}</div>
    <textarea class="entryNotes" readonly>${notes}</textarea>
  `;
  entry.style.height = height;

  // re‐wire your double‐click → view
  entry.addEventListener("dblclick", () => openView(entry));

  slot.appendChild(entry);
}

// Add a new entry
function addEntry(){
	// 1) read everything from the form
	const time  = document.getElementById("addTimeSelect").value;
	const date  = document.getElementById("addDateSelect").value;
	const label = document.getElementById("addLabel").value.trim();
	const type  = document.querySelector('input[name="addType"]:checked')?.value;
	const hours = parseFloat( document.getElementById("addHours").value );
	const notes = document.getElementById("addNotes").value.trim();

  // validation
  if (!time || !date || !label || !type || !hours) {
    alert("Please fill out all required fields.");
    return;
  }

  // 2) build the header text and a unique id
  const header = `${label} (${type}, ${hours}h)`;
  const id     = Date.now().toString();
  // height = (hours ÷ 0.25 slots) × 35px
  const height = `${ (hours / 0.25) * 35 }px`;

  	createEntryFromData({ id, date, time, header, notes, height });
	calculateTotals();
	saveEntries();
}

function openEdit(entry) {
  currentEntry = entry;

  // 1) parse the header text
  const hdr = entry.querySelector(".entryHeader")
                   .textContent
                   .match(/^(.+?) \((Direct|Indirect|N\/A), ([\d.]+)h\)/);
  if (!hdr) return;  
  const [, label, type, hoursStr] = hdr;

  // 2) notes
  const notes = entry.querySelector(".entryNotes")?.value || "";

  // 3) pull the *current* date & time out of the entry
  const time = entry.getAttribute("data-time");
  const date = entry.getAttribute("data-date");

  // 4) populate your edit form
  document.getElementById("editLabel").value    = label;
  document.querySelector(`input[name="editType"][value="${type}"]`).checked = true;

  // normalize the hours to *exactly* match one of your <option>s
  const normalized = parseFloat(hoursStr).toFixed(1);  
  document.getElementById("editHours").value   = normalized;

  document.getElementById("editNotes").value   = notes;
  document.getElementById("editTimeSelect").value = time;
  document.getElementById("editDateSelect").value = date;

  document.getElementById("editModal").style.display = "block";
}

// Confirm edit
function editEntry(){
  if(!currentEntry){ alert("No entry selected."); return; }
  const time = document.getElementById("editTimeSelect").value,
        date = document.getElementById("editDateSelect").value,
        label = document.getElementById("editLabel").value.trim(),
        type = document.querySelector('input[name="editType"]:checked')?.value,
        hours = parseFloat(document.getElementById("editHours").value),
        notes = document.getElementById("editNotes").value.trim();
  if(!time||!date||!label||!type||!hours){
    alert("Please fill out all required fields.");
    return;
  }
  const newSlot = findSlot(date,time);
  if(!newSlot){ alert("Time slot not found."); return; }

  // update content
  currentEntry.innerHTML =
    `<div class="entryHeader">${label} (${type}, ${hours}h)</div>
     <textarea class="entryNotes" readonly>${notes}</textarea>`;

  currentEntry.setAttribute("data-time", time);
  currentEntry.setAttribute("data-date", date);

  currentEntry.style.height = `${ (hours/0.25)*35 }px`;
  // move if needed
  if(currentEntry.parentElement !== newSlot){
    newSlot.appendChild(currentEntry);
  }
  calculateTotals();
  currentEntry = null;
}

// Wire up everything
document.addEventListener("DOMContentLoaded", ()=>{

  alert("This is a WIP. Some bugs need fixing.");
  createCalendarGrid();
  populateTimeSelects();
  populateDateSelects();
  loadEntries();
  calculateTotals();
  calculateYearlyTotals();

  // header buttons
  document.getElementById("prevBtn").onclick = ()=>{
    startOfWeek.setDate(startOfWeek.getDate()-7);
    createCalendarGrid();
    populateDateSelects();
    loadEntries();
    calculateTotals();
    calculateYearlyTotals();
  };
  document.getElementById("nextBtn").onclick = ()=>{
    startOfWeek.setDate(startOfWeek.getDate()+7);
    createCalendarGrid();
    populateDateSelects();
    loadEntries();
    calculateTotals();
    calculateYearlyTotals();
  };

  // Add modal
  document.getElementById("addButton").onclick = ()=>{
    document.getElementById("addModal").style.display="block";
  };
  document.getElementById("cancelAdd").onclick = ()=>{
    document.getElementById("addForm").reset();
    document.getElementById("addModal").style.display="none";
  };
  document.getElementById("confirmAdd").onclick = ()=>{
    addEntry();
    document.getElementById("addForm").reset();
    document.getElementById("addModal").style.display="none";
    saveEntries();
  };

  // Edit modal
  document.getElementById("cancelEdit").onclick = ()=>{
    document.getElementById("editForm").reset();
    document.getElementById("editModal").style.display="none";
    currentEntry = null;
  };
  document.getElementById("confirmEdit").onclick = ()=>{
    editEntry();
    document.getElementById("editForm").reset();
    document.getElementById("editModal").style.display="none";
    saveEntries();
  };
  document.getElementById("deleteEntry").onclick = ()=>{
    if(currentEntry && confirm("Delete this entry?")){
      currentEntry.remove();
      currentEntry = null;
      calculateTotals();
      saveEntries();
      document.getElementById("editModal").style.display="none";
    }
  };

  // CLOSE the view modal
document.getElementById("viewCloseBtn").addEventListener("click", () => {
  document.getElementById("viewModal").style.display = "none";
});

// “EDIT” from within the VIEW modal
document.getElementById("viewEditBtn").addEventListener("click", (e) => {
  const id = e.target.dataset.entryId;
  const entry = document.querySelector(`.calendarEntry[data-id="${id}"]`);

  // hide view, open edit
  document.getElementById("viewModal").style.display = "none";
  // reuse your existing edit modal logic:
  openEdit(entry);
});
});