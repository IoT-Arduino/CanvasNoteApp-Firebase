import moment from "moment"
import { db } from "./firebase-init"

const loggedOutLinks = document.querySelectorAll(".logged-out")
const loggedInLinks = document.querySelectorAll(".logged-in")
const userNameArea = document.getElementById("userNameArea")
const noteArea = document.getElementById("notes")

// setUp login nav menu
const setupUI = (user) => {
  if (user) {
    loggedInLinks.forEach((item) => (item.style.display = "block"))
    loggedOutLinks.forEach((item) => (item.style.display = "none"))
    userNameArea.innerText = user.email + "さんのノート"
  } else {
    loggedInLinks.forEach((item) => (item.style.display = "none"))
    loggedOutLinks.forEach((item) => (item.style.display = "block"))
  }
}

// setup note lists
const setUpList = (changes) => {
  changes.forEach((change) => {
    if (change.type == "added") {
      const note = change.doc.data()
      const noteId = change.doc.id
      renderNoteDOM(note, noteId)
    } else if (change.type == "removed") {
      let deleteList = noteArea.querySelector(
        '[data-id="' + change.doc.id + '"]'
      )
      noteArea.removeChild(deleteList)
    }
  })
}

// render Each note item
const renderNoteDOM = (note, noteId) => {
    const noteEl = document.createElement("div")
    const textEl = document.createElement("a")
    const button = document.createElement("button")
    // const dateEl = document.createElement("div")
  
    noteEl.setAttribute("data-id", noteId)
    noteEl.classList.add("list-item")
    noteEl.classList.add("container")
    button.classList.add("list-item__button")
    button.textContent = "x"
    textEl.classList.add("list-item__title")
    // dateEl.classList.add("list-item__date")
  
    button.addEventListener("click", (e) => {
      e.stopPropagation()
      let id = e.target.parentElement.getAttribute("data-id")
      db.collection("notes")
        .doc(id)
        .delete()
    })
  
    if (note.title.length > 0) {
      textEl.textContent = note.title
    } else {
      textEl.textContent = "Unnamed note"
    }
  
    noteEl.appendChild(button)
    textEl.setAttribute("href", `edit.html#${noteId}`)
    noteEl.appendChild(textEl)
  
    document.querySelector("#notes").appendChild(noteEl)
  }


// render filtered notes
const renderNotes = (notes, filters) => {
  notes = sortNotes(notes, filters.sortBy)

  document.querySelector("#notes").innerHTML = ""

  notes.forEach((item) => {
    renderNoteDOM(item.note, item.id)
  })
}

// sort notes
const sortNotes = (notes, sortBy) => {
    if (sortBy === "updatedAt") {
      return notes.sort((a, b) => {
        if (a.note.updatedAt > b.note.updatedAt) {
          return -1
        } else if (a.note.updatedAt < b.note.updatedAt) {
          return 1
        } else {
          return 0
        }
      })
    } else if (sortBy === "createdAt") {
      return notes.sort((a, b) => {
        if (a.note.createdAt > b.note.createdAt) {
          return -1
        } else if (a.note.createdAt < b.note.createdAt) {
          return 1
        } else {
          return 0
        }
      })
    } else if (sortBy === "title") {
      return notes.sort((a, b) => {
        if (a.note.title.toLowerCase() < b.note.title.toLowerCase()) {
          return -1 // a comes first
        } else if (a.note.title.toLowerCase() > b.note.title.toLowerCase()) {
          return 1 // b comes first
        } else {
          return 0
        }
      })
    } else {
      return notes
    }
  }


// create createNote
const createNote = (user) => {
  document.querySelector("#createNote").addEventListener("click", (e) => {
    const timestamp = moment().valueOf()

    db.collection("notes")
      .add({
        title: "",
        body: "",
        canvas: [],
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: user.uid,
      })
      .then((doc) => {
        location.assign(`edit.html#${doc.id}`)
      })
  })
}


// generate last edited msg
const generateLastEdited = (timestamp) => {
  return `Last edited ${moment(timestamp).fromNow()}`
}

export {
  generateLastEdited,
  setUpList,
  setupUI,
  sortNotes,
  createNote,
  renderNotes,
  renderNoteDOM,
}
