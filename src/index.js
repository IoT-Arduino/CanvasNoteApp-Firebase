import { db, auth } from './firebase-init'
import moment from 'moment'
import  { generateLastEdited, generateLastEditedTop, sortNotes } from './notes-function'


const noteArea = document.getElementById('notes')
const loggedOutLinks = document.querySelectorAll('.logged-out')
const loggedInLinks = document.querySelectorAll('.logged-in')
const userNameArea = document.getElementById('userNameArea')
const signupForm = document.querySelector('#signup-form');
const logout = document.querySelector('#logout')
const loginForm = document.querySelector('#login-form')

// sign up
signupForm.addEventListener('submit',(e)=>{
    e.preventDefault();

    const email = signupForm['signup-email'].value
    const password = signupForm['signup-password'].value

    auth.createUserWithEmailAndPassword(email,password).then(cred => {
        document.getElementById('modal-signup').classList.remove("active");
        document.getElementById('mask').classList.remove("active");
        signupForm.reset()
    })
})

// logout
logout.addEventListener('click',(e)=>{
    e.preventDefault();
    auth.signOut();
})

//login
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


document.querySelector('#searchText').addEventListener('input',async (e) => {
    filters.searchText = e.target.value
    filters.sortBy = e.target.nextElementSibling.value

    document.querySelector('#notes').innerHTML = ``

        // 新しく作っている処理
        const notes = []
        const user = auth.currentUser;
        const snapshot = await db.collection('notes')
        .where('createdBy', '==', user.uid)
        .get();
        snapshot.forEach(doc => {
            const id  = doc.id
            const note = doc.data()
            notes.push({
                id,note
            })
        })

        const filteredNotes = notes.filter((item) => {
            return item.note.title.toLowerCase().includes(filters.searchText.toLowerCase())
        })

        document.querySelector("#notes").innerHTML = ''

        filteredNotes.forEach((item) => {
            renderFilteredNoteDOM(item.note)
        })

})



document.querySelector('#filterBy').addEventListener('change', async (e) => {
    filters.searchText = e.target.previousElementSibling.value
    filters.sortBy = e.target.value
    document.querySelector('#notes').innerHTML = ``

    // 新しく作っている処理
    const notes = []
    const user = auth.currentUser;
    const snapshot = await db.collection('notes')
    .where('createdBy', '==', user.uid)
    .get();
    snapshot.forEach(doc => {
        const id  = doc.id
        const note = doc.data()
        notes.push({
            id,note
        })
    })

    let sortBy = filters.sortBy

    const filteredNotes = notes.filter((item) => {
        return item.note.title.toLowerCase().includes(filters.searchText.toLowerCase())
    })
    const sortedNotes = sortNotes(filteredNotes,sortBy)

    renderNotes(sortedNotes,sortBy)


})


const renderFilteredNoteDOM = (note) => {
    const noteEl = document.createElement('div')
    const textEl = document.createElement('a')
    const button = document.createElement('button')
    const dateEl = document.createElement('div')

    // setup notelist and remove button
    noteEl.setAttribute('data-id',note.id)
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
    textEl.setAttribute('href',`edit.html#${note.id}`)
    noteEl.appendChild(textEl)

    document.querySelector('#notes').appendChild(noteEl)
}



// Render application notes
const renderNotes =  (notes,filters) => {

    notes = sortNotes(notes, filters.sortBy)

    document.querySelector("#notes").innerHTML = ''

    notes.forEach((item) => {
        // document.querySelector("#notes").innerHTML += `${item.note.title}<br />`
        renderFilteredNoteDOM(item.note)
    })
}




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










