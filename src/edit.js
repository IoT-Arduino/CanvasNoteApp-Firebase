import { db, auth } from "./firebase-init"
import moment from "moment"
import { generateLastEdited } from "./notes-function"
import {
  startPoint,
  movePoint,
  endPoint,
  prevCanvas,
  nextCanvas,
  draw,
} from "./edit-canvas"

import { setupUI } from "./notes-function"

// ======　edit page auth 関連 ======

auth.onAuthStateChanged((user) => {
  if (user) {
    setupUI(user)
  } else {
    location.assign("index.html")
  }
})

// ======　editpage　編集エリア初期化関連　======

const titleElement = document.querySelector("#note-title")
const bodyElement = document.querySelector("#note-body")
const removeElement = document.querySelector("#remove-note")
const dateElement = document.querySelector("#last-edited")
const noteId = location.hash.substring(1)

if (noteId === undefined) {
  location.assign("index.html")
}

let canvasItems = []

const initEditPage = () => {
  db.collection("notes")
    .doc(noteId)
    .get()
    .then((snapshot) => {
      titleElement.value = snapshot.data().title
      bodyElement.value = snapshot.data().body
      canvasItems = snapshot.data().canvas
      dateElement.textContent = generateLastEdited(snapshot.data().updatedAt)
    })
    .then(() => {
      if (canvasItems.length > 0) {
        draw(canvasItems[0]["png"])
      }
    })
}

initEditPage()


titleElement.addEventListener("blur", (e) => {
  db.collection("notes")
    .doc(noteId)
    .update({
      title: e.target.value,
      updatedAt: moment().valueOf(),
    })
})

bodyElement.addEventListener("blur", (e) => {
  db.collection("notes")
    .doc(noteId)
    .update({
      body: e.target.value,
      updatedAt: moment().valueOf(),
    })
})

removeElement.addEventListener("click", (e) => {
  e.stopPropagation()
  db.collection("notes")
    .doc(noteId)
    .delete()
    .then(() => {
      location.assign(`index.html`)
    })
})


// ===== 手書きCanvas関連処理 ======

const canvas = document.getElementById("canvasArea")
const prevCan = document.getElementById("prevCanvas")
const nextCan = document.getElementById("nextCanvas")

//PC対応
canvas.addEventListener("mousedown", startPoint, false)
canvas.addEventListener("mousemove", movePoint, false)
canvas.addEventListener("mouseup", endPoint, false)

//スマホ対応
canvas.addEventListener("touchstart", startPoint, false)
canvas.addEventListener("touchmove", movePoint, false)
canvas.addEventListener("touchend", endPoint, false)

//進む、戻るボタン
prevCan.addEventListener("click", function() {
  prevCanvas()
})

nextCan.addEventListener("click", function() {
  nextCanvas()
})




