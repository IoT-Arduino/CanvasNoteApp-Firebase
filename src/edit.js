import { db, auth } from './firebase-init'
import moment from 'moment'
import  { generateLastEdited, generateLastEditedTop } from './notes-function'

// edit page auth 関連

const userNameArea = document.getElementById('userNameArea')
const loggedOutLinks = document.querySelectorAll('.logged-out')

auth.onAuthStateChanged(user => {
    if(user){
        setupUI(user)
        // console.log('user logged in' , user.email)
    } else {
        location.assign('index.html')
    }
})

const setupUI = (user) => {
    if(user){
        loggedOutLinks.forEach(item => item.style.display = "none")
        userNameArea.innerText = user.email + "さんのノート"
    } 
}


// editpage　画面初期化関連　================================

const titleElement = document.querySelector('#note-title')
const bodyElement = document.querySelector('#note-body')
const removeElement = document.querySelector('#remove-note')
// const dateElement = document.querySelector('#last-edited')

const noteId = location.hash.substring(1);

if(noteId === undefined){
    location.assign('index.html')
}

let canvasItems = [];


db.collection('notes').doc(noteId).get().then((snapshot) => {
    titleElement.value = snapshot.data().title
    bodyElement.value = snapshot.data().body
    canvasItems = snapshot.data().canvas
}).then(()=>{
    if(canvasItems.length>0){
        draw(canvasItems[0]['png']);
    } 
})




titleElement.addEventListener('blur',(e) => {
    db.collection('notes').doc(noteId).update({
        title : e.target.value,
        updatedAt  : moment().valueOf()
    })
})

bodyElement.addEventListener('blur',(e) => {
    db.collection('notes').doc(noteId).update({
        body : e.target.value,
        updatedAt  : moment().valueOf()
    })
})

removeElement.addEventListener('click',(e)=>{
    e.stopPropagation();
    db.collection('notes').doc(noteId).delete()
    .then(()=> {
        location.assign(`index.html`)
    });
})



// ===== 手書きCanvas関連処理 ================================

const canvas = document.getElementById('canvasArea');
const ctx = canvas.getContext('2d');
let moveflg = 0;
let Xpoint;
let Ypoint;
let currentCanvas;
let temp = [];

  
//ペンの初期値（サイズ、色）
const defSize = 7;
const defColor = "#555";
  
//PC対応
canvas.addEventListener('mousedown', startPoint, false);
canvas.addEventListener('mousemove', movePoint, false);
canvas.addEventListener('mouseup', endPoint, false);

//スマホ対応
canvas.addEventListener('touchstart', startPoint, false);
canvas.addEventListener('touchmove', movePoint, false);
canvas.addEventListener('touchend', endPoint, false);





// ==== Canvas Functions ======================


function startPoint(e){
    e.preventDefault();
    ctx.beginPath();
  
    if(e.changedTouches){
          e = e.changedTouches[0]
          Xpoint = e.clientX-event.target.getBoundingClientRect().left-2;
          Ypoint = e.clientY-event.target.getBoundingClientRect().top-2;
     } else {
          Xpoint = e.offsetX-2;
          Ypoint = e.offsetY-2;
     }
  
  　// ポインタ先端の位置調整
    Xpoint = e.offsetX-2;
    Ypoint = e.offsetY-2;
      
    ctx.moveTo(Xpoint, Ypoint);
  }
  
    
  function movePoint(e){
   if(e.buttons === 1 || e.witch === 1 || e.type == 'touchmove'){
  
      if(e.changedTouches){
          e = e.changedTouches[0]
          Xpoint = e.clientX-event.target.getBoundingClientRect().left-2;
          Ypoint = e.clientY-event.target.getBoundingClientRect().top-2;
     } else {
          Xpoint = e.offsetX-2;
          Ypoint = e.offsetY-2;
     }
  
      moveflg = 1;
        
      ctx.lineTo(Xpoint, Ypoint);
      ctx.lineCap = "round";
      ctx.lineWidth = defSize * 2;
      ctx.strokeStyle = defColor;
      ctx.stroke();
    }
  }
    
  function endPoint(e){
      if(moveflg === 0)
      {
         ctx.lineTo(Xpoint-1, Ypoint-1);
         ctx.lineCap = "round";
         ctx.lineWidth = defSize * 2;
         ctx.strokeStyle = defColor;
         ctx.stroke();
  
      }
      moveflg = 0;
      saveCanvasData();
  }
   
  
  function resetCanvas() {
      ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
  }
   
  
  
function saveCanvasData(){
    const png = canvas.toDataURL();

    setTimeout(function(){
    　canvasItems.unshift({png});

      db.collection('notes').doc(noteId).update({
            canvas : canvasItems,
            updatedAt  : moment().valueOf()
        })
 
        currentCanvas = 0;
        temp = [];
 
    }, 0);
}


const prevCan = document.getElementById("prevCanvas")
const nextCan = document.getElementById("nextCanvas")

prevCan.addEventListener('click', function(){
    prevCanvas()
})

nextCan.addEventListener('click',function(){
    nextCanvas()
})
   
  function prevCanvas(){
      if(canvasItems.length > 0) {
          temp.unshift(canvasItems.shift());

          setTimeout(function(){
            db.collection('notes').doc(noteId).update({
                canvas : canvasItems,
                updatedAt  : moment().valueOf()
            })

              resetCanvas();
              if(canvasItems.length>0){
                  draw(canvasItems[0]['png']);
              }
          }, 0);
      } 
    }
   
  function nextCanvas(){
      if(temp.length > 0){
          canvasItems.unshift(temp.shift());
           setTimeout(function(){
            db.collection('notes').doc(noteId).update({
                canvas : canvasItems,
                updatedAt  : moment().valueOf()
            })
              resetCanvas();
              draw(canvasItems[0]['png']);
           }, 0);
      } 
  }

  
  function draw(src) {
      const img = new Image();
      img.src = src;
  
      img.onload = function() {
          ctx.drawImage(img,0,0);
      }
  }
