import { db, auth } from "./firebase-init"
import {
  setUpList,
  setupUI,
  sortNotes,
  createNote,
  renderNotes,
  renderNoteDOM,
} from "./notes-function"


const signupForm = document.querySelector("#signup-form")
const logout = document.querySelector("#logout")
const loginForm = document.querySelector("#login-form")

// sign up
signupForm.addEventListener("submit", (e) => {
  e.preventDefault()

  const email = signupForm["signup-email"].value
  const password = signupForm["signup-password"].value

  auth.createUserWithEmailAndPassword(email, password).then((cred) => {
    document.getElementById("modal-signup").classList.remove("active")
    document.getElementById("mask").classList.remove("active")
    signupForm.reset()
  })
})

// logout
logout.addEventListener("click", (e) => {
  e.preventDefault()
  auth.signOut().then(()=>{
    console.log("signout")
  }).catch(()=>{
    console.log("error happened")
  })
})

// login
loginForm.addEventListener("submit", (e) => {
  e.preventDefault()

  const email = loginForm["login-email"].value
  const password = loginForm["login-password"].value

  auth.signInWithEmailAndPassword(email, password).then((cred) => {
    document.getElementById("modal-login").classList.remove("active")
    document.getElementById("mask").classList.remove("active")
    loginForm.reset()
  }).catch(()=>{
    document.querySelector('.login-error').classList.add('error')
    document.getElementById('login-password').value = ``
    console.log("login error")
  })
})

// listen for auth status changes
auth.onAuthStateChanged((user) => {
  if (user) {
    document.querySelector('.actions').style.display = "block"

    db.collection("notes")
      .where("createdBy", "==", user.uid)
      .onSnapshot(
        (snapshot) => {
          setupUI(user)

          if (document.getElementById("logout-msg")) {
            document.getElementById("logout-msg").innerHTML = ``
          }

          let changes = snapshot.docChanges()
          setUpList(changes)

          document.querySelector(".footer").innerHTML = `
                <div class="footer">
                    <button id="createNote" class="bottomButton">CanvasNoteを作成する</button>
                </div>
            `
          createNote(user)
        },
        function(error) {
          console.log(error.message)
        }
      )
  } else {
    setupUI()
    setUpList([])

    document.querySelector('.actions').style.display = "none"

    document.getElementById("notes").innerHTML = `
            <h5 class="logout-msg" id="logout-msg" >Please login to add CanvasNote </h5>
        `
    document.querySelector(".footer").innerHTML = ``
  }
})


// filter and sort actions
const filters = {
  searchText: "",
  sortBy: "byEdited",
}

document.querySelector("#searchText").addEventListener("input", async (e) => {
  filters.searchText = e.target.value
  filters.sortBy = e.target.nextElementSibling.value

  document.querySelector("#notes").innerHTML = ``

  const notes = []
  const user = auth.currentUser
  const snapshot = await db
    .collection("notes")
    .where("createdBy", "==", user.uid)
    .get()
  snapshot.forEach((doc) => {
    const id = doc.id
    const note = doc.data()
    notes.push({
      id,
      note,
    })
  })

  const filteredNotes = notes.filter((item) => {
    return item.note.title
      .toLowerCase()
      .includes(filters.searchText.toLowerCase())
  })

  document.querySelector("#notes").innerHTML = ""

  filteredNotes.forEach((item) => {
    renderNoteDOM(item.note, item.id)
  })
})

document.querySelector("#filterBy").addEventListener("change", async (e) => {
  filters.searchText = e.target.previousElementSibling.value
  filters.sortBy = e.target.value
  document.querySelector("#notes").innerHTML = ``

  const notes = []
  const user = auth.currentUser
  const snapshot = await db
    .collection("notes")
    .where("createdBy", "==", user.uid)
    .get()
  snapshot.forEach((doc) => {
    const id = doc.id
    const note = doc.data()
    notes.push({
      id,
      note,
    })
  })

  let sortBy = filters.sortBy

  const filteredNotes = notes.filter((item) => {
    return item.note.title
      .toLowerCase()
      .includes(filters.searchText.toLowerCase())
  })
  const sortedNotes = sortNotes(filteredNotes, sortBy)

  renderNotes(sortedNotes, sortBy)
})

// modal control
document.getElementById("login-open").addEventListener("click", function() {
  document.getElementById("modal-login").classList.add("active")
  document.getElementById("mask").classList.add("active")
})

document.getElementById("signup-open").addEventListener("click", function() {
  document.getElementById("modal-signup").classList.add("active")
  document.getElementById("mask").classList.add("active")
})

document.getElementById("login-close").addEventListener("click", function() {
  document.getElementById("modal-login").classList.remove("active")
  document.getElementById("mask").classList.remove("active")
  document.querySelector('.login-error').classList.remove('error')
  loginForm.reset()
})

document.getElementById("signup-close").addEventListener("click", function() {
  document.getElementById("modal-signup").classList.remove("active")
  document.getElementById("mask").classList.remove("active")
})

document.getElementById("mask").addEventListener("click", function() {
  document.getElementById("modal-login").classList.remove("active")
  document.getElementById("mask").classList.remove("active")
  document.getElementById("modal-signup").classList.remove("active")
  document.getElementById("mask").classList.remove("active")
})
