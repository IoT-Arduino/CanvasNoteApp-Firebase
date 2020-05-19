import { db } from "./firebase-init"
import moment from "moment"

const canvas = document.getElementById("canvasArea")
const noteId = location.hash.substring(1)
const ctx = canvas.getContext("2d")
let moveflg = 0
let Xpoint
let Ypoint
let currentCanvas
let temp = []
let canvasItems = []


//ペンの初期値（サイズ、色）
const defSize = 7
const defColor = "#555"

function startPoint(e) {
  e.preventDefault()
  ctx.beginPath()

  if (e.changedTouches) {
    e = e.changedTouches[0]
    Xpoint = e.clientX - event.target.getBoundingClientRect().left - 2
    Ypoint = e.clientY - event.target.getBoundingClientRect().top - 2
  } else {
    Xpoint = e.offsetX - 2
    Ypoint = e.offsetY - 2
  } // ポインタ先端の位置調整

  Xpoint = e.offsetX - 2
  Ypoint = e.offsetY - 2

  ctx.moveTo(Xpoint, Ypoint)
}

function movePoint(e) {
  if (e.buttons === 1 || e.witch === 1 || e.type == "touchmove") {
    if (e.changedTouches) {
      e = e.changedTouches[0]
      Xpoint = e.clientX - event.target.getBoundingClientRect().left - 2
      Ypoint = e.clientY - event.target.getBoundingClientRect().top - 2
    } else {
      Xpoint = e.offsetX - 2
      Ypoint = e.offsetY - 2
    }

    moveflg = 1

    ctx.lineTo(Xpoint, Ypoint)
    ctx.lineCap = "round"
    ctx.lineWidth = defSize * 2
    ctx.strokeStyle = defColor
    ctx.stroke()
  }
}

function endPoint(e) {
  if (moveflg === 0) {
    ctx.lineTo(Xpoint - 1, Ypoint - 1)
    ctx.lineCap = "round"
    ctx.lineWidth = defSize * 2
    ctx.strokeStyle = defColor
    ctx.stroke()
  }
  moveflg = 0
  saveCanvasData()
}

function resetCanvas() {
  ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight)
}

function saveCanvasData() {
  db.collection("notes")
    .doc(noteId)
    .get()
    .then((snapshot) => {
      canvasItems = snapshot.data().canvas
    })
    .then(() => {
      const png = canvas.toDataURL()

      setTimeout(function() {
        canvasItems.unshift({ png })

        db.collection("notes")
          .doc(noteId)
          .update({
            canvas: canvasItems,
            updatedAt: moment().valueOf(),
          })

        currentCanvas = 0
        temp = []
      }, 0)
    })
}

function prevCanvas() {
  db.collection("notes")
    .doc(noteId)
    .get()
    .then((snapshot) => {
      canvasItems = snapshot.data().canvas
    })
    .then(() => {
      if (canvasItems.length > 0) {
        temp.unshift(canvasItems.shift())
        setTimeout(function() {
          db.collection("notes")
            .doc(noteId)
            .update({
              canvas: canvasItems,
              updatedAt: moment().valueOf(),
            })
          resetCanvas()
          if (canvasItems.length > 0) {
            draw(canvasItems[0]["png"])
          }
        }, 0)
      }
    })
}

function nextCanvas() {
  if (temp.length > 0) {
    canvasItems.unshift(temp.shift())
    setTimeout(function() {
      db.collection("notes")
        .doc(noteId)
        .update({
          canvas: canvasItems,
          updatedAt: moment().valueOf(),
        })
      resetCanvas()
      draw(canvasItems[0]["png"])
    }, 0)
  }
}

function draw(src) {
  const img = new Image()
  img.src = src

  img.onload = function() {
    ctx.drawImage(img, 0, 0)
  }
}

export { startPoint, movePoint, endPoint, prevCanvas, nextCanvas, draw }
