import { db, auth } from './firebase-init'
import moment from 'moment'
import  { generateLastEdited, generateLastEditedTop } from './notes-function'

// db 接続テスト
// db.collection('notes').onSnapshot(snapshot => {
//     snapshot.forEach(doc => {
//         console.log(doc.data())
//     })
// },function(error){
//     console.log(error.message)
// })


// sign up
const signupForm = document.querySelector('#signup-form');

signupForm.addEventListener('submit',(e)=>{
    e.preventDefault();

    // get user info
    const email = signupForm['signup-email'].value
    const password = signupForm['signup-password'].value

    // sign up the user
    auth.createUserWithEmailAndPassword(email,password).then(cred => {
        document.getElementById('modal-signup').classList.remove("active");
        document.getElementById('mask').classList.remove("active");
        signupForm.reset()
    })
})

// logout
const logout = document.querySelector('#logout')
logout.addEventListener('click',(e)=>{
    e.preventDefault();
    auth.signOut();
})

//login
const loginForm = document.querySelector('#login-form')
loginForm.addEventListener('submit',(e)=>{
    e.preventDefault();

    // get user info
    const email = loginForm['login-email'].value
    const password = loginForm['login-password'].value

    auth.signInWithEmailAndPassword(email,password).then(cred => {
        document.getElementById('modal-login').classList.remove("active");
        document.getElementById('mask').classList.remove("active");
        loginForm.reset()
    })
})



//  ======= note-app.js 


const noteArea = document.getElementById('notes')
// let noteData = []
const loggedOutLinks = document.querySelectorAll('.logged-out')
const loggedInLinks = document.querySelectorAll('.logged-in')
const userNameArea = document.getElementById('userNameArea')

// listen for auth status changes
auth.onAuthStateChanged(user => {
    if(user){
        console.log('user logged in' , user.uid)

        db.collection('notes').where('createdBy', '==', user.uid).onSnapshot(snapshot => {
            setupUI(user)

            if(document.getElementById('logout-msg')){
                document.getElementById('logout-msg').innerHTML = ``
            }

            let changes = snapshot.docChanges()
            setUpList(changes)
            document.querySelector('.footer').innerHTML = `
                <div class="footer">
                    <button id="createNote" class="bottomButton">CanvasNoteを作成する</button>
                </div>
            `
            createNote(user)
        },function(error){
            console.log(error.message)
        })
    } else {
        setupUI()
        // console.log('user logged out')
        setUpList([])
        document.getElementById('notes').innerHTML = `
            <h5 class="logout-msg" id="logout-msg" >Please login to add CanvasNote </h5>
        `
        document.querySelector('.footer').innerHTML = ``
    }
})



const setupUI = (user) => {
    if(user){
        loggedInLinks.forEach(item => item.style.display = "block")
        loggedOutLinks.forEach(item => item.style.display = "none")
        userNameArea.innerText = user.email + "さんのノート"
    } else {
        loggedInLinks.forEach(item => item.style.display = "none")
        loggedOutLinks.forEach(item => item.style.display = "block")
    }
}


const setUpList = (changes) => {
    changes.forEach(change => {
        if(change.type == 'added'){
            generateNoteDOM(change.doc)
        } else if (change.type == 'removed'){
            let deleteList = noteArea.querySelector('[data-id="'+change.doc.id+'"]');
            noteArea.removeChild(deleteList)
        }
    })
}


const generateNoteDOM = (doc) => {
    const note = doc.data()

    const noteEl = document.createElement('div')
    const textEl = document.createElement('a')
    const button = document.createElement('button')
    const dateEl = document.createElement('div')

    // setup notelist and remove button
    noteEl.setAttribute('data-id',doc.id)
    noteEl.classList.add('list-item')
    noteEl.classList.add('container')
    button.classList.add('list-item__button')
    button.textContent = 'x'
    textEl.classList.add('list-item__title')
    dateEl.classList.add('list-item__date')
    // dateEl.textContent = generateLastEditedTop(note.updatedAt)

    button.addEventListener('click',(e) => {
        e.stopPropagation();
        let id = e.target.parentElement.getAttribute('data-id')
        db.collection('notes').doc(id).delete();
    })

    // setup the note title text
    if(note.title.length > 0) {
        textEl.textContent = note.title
    } else {
        textEl.textContent = 'Unnamed note'
    }

    noteEl.appendChild(button)
    textEl.setAttribute('href',`edit.html#${doc.id}`)
    noteEl.appendChild(textEl)

    document.querySelector('#notes').appendChild(noteEl)
}



const filters = {
    searchText:'',
    sortBy: 'byEdited'
}


document.querySelector('#searchText').addEventListener('input',(e) => {
    filters.searchText = e.target.value
    filters.sortBy = e.target.nextElementSibling.value

    document.querySelector('#notes').innerHTML = ``

    db.collection('notes').where("title",">=",filters.searchText).where('title','<=',filters.searchText + '\uf8ff').get().then((snapshot)=>{
        snapshot.docs.forEach(doc=>{
           
            renderNoteDOM(doc,filters)
        })
    })
})


document.querySelector('#filterBy').addEventListener('change',(e) => {
    filters.searchText = e.target.previousElementSibling.value
    filters.sortBy = e.target.value
    document.querySelector('#notes').innerHTML = ``

    if(filters.sortBy === 'title'){
        db.collection('notes').orderBy(filters.sortBy).get().then((snapshot)=>{
            snapshot.docs.forEach(doc=>{
                renderNoteDOM(doc,filters)
            })
        })
    } else {
        db.collection('notes').orderBy(filters.sortBy,"desc").get().then((snapshot)=>{
            snapshot.docs.forEach(doc=>{
                renderNoteDOM(doc,filters)
            })
        })
    }
})


const renderNoteDOM = (doc,filters) => {

    // console.log(filters)

    const note = doc.data()

    const noteEl = document.createElement('div')
    const textEl = document.createElement('a')
    const button = document.createElement('button')
    const dateEl = document.createElement('div')

    // setup notelist and remove button
    noteEl.setAttribute('data-id',doc.id)
    noteEl.classList.add('list-item')
    noteEl.classList.add('container')
    button.classList.add('list-item__button')
    button.textContent = 'x'
    textEl.classList.add('list-item__title')
    dateEl.classList.add('list-item__date')
    // dateEl.textContent = generateLastEditedTop(note.updatedAt)

    button.addEventListener('click',(e) => {
        e.stopPropagation();
        let id = e.target.parentElement.getAttribute('data-id')
        db.collection('notes').doc(id).delete();

    })

    // setup the note title text
    if(note.title.length > 0) {
        textEl.textContent = note.title
    } else {
        textEl.textContent = 'Unnamed note'
    }

    noteEl.appendChild(button)
    textEl.setAttribute('href',`edit.html#${doc.id}`)
    noteEl.appendChild(textEl)

    document.querySelector('#notes').appendChild(noteEl)
}


// create createNote
const createNote = (user) => {

    document.querySelector('#createNote').addEventListener('click',(e) => {
    
        const timestamp = moment().valueOf()
    
        db.collection('notes').add({
            title:'',
            body:'',
            canvas: [],
            createdAt: timestamp,
            updatedAt: timestamp,
            createdBy: user.uid
        }).
        then((doc)=>{
            location.assign(`edit.html#${doc.id}`)
        })
    
    })
}



// modal control

document.getElementById('login-open').addEventListener('click',function(){
    document.getElementById('modal-login').classList.add("active");
    document.getElementById('mask').classList.add("active");
})

document.getElementById('signup-open').addEventListener('click',function(){
    document.getElementById('modal-signup').classList.add("active");
    document.getElementById('mask').classList.add("active");
})

document.getElementById('login-close').addEventListener('click',function(){
    document.getElementById('modal-login').classList.remove("active");
    document.getElementById('mask').classList.remove("active");
})

document.getElementById('signup-close').addEventListener('click',function(){
    document.getElementById('modal-signup').classList.remove("active");
    document.getElementById('mask').classList.remove("active");
})

document.getElementById('mask').addEventListener('click',function(){
    document.getElementById('modal-login').classList.remove("active");
    document.getElementById('mask').classList.remove("active");
    document.getElementById('modal-signup').classList.remove("active");
    document.getElementById('mask').classList.remove("active");
})










