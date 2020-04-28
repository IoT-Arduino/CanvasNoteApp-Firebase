

// sort
// const sortNotes = (notes, sortBy) => {
//     if(sortBy === 'byEdited'){
//         return notes.sort( (a, b) => {
//             if(a.updatedAt > b.updatedAt){
//                 return -1
//             } else if(a.updatedAt < b.updatedAt){
//                 return 1
//             } else {
//                 return 0
//             }
//         })
//     } else if(sortBy === 'byCreated'){
//         return notes.sort((a, b) =>{
//             if(a.createdAt > b.createdAt){
//                 return -1
//             } else if(a.createdAt < b.createdAt){
//                 return 1
//             } else {
//                 return 0
//             }
//         })
//     } else if(sortBy === 'alphabetical'){
//         return notes.sort( (a, b) => {
//             if(a.title.toLowerCase() < b.title.toLowerCase() ){
//                 return -1  // a comes first
//             } else if(a.title.toLowerCase() > b.title.toLowerCase() ){
//                 return 1 // b comes first
//             } else {
//                 return 0
//             }
//         })
//     } else {
//         return notes
//     }
// }


// Render application notes
// const renderNotes =  (notes,filters) => {

//     notes.forEach(doc => {
//         console.log(doc.data())
//     })

//     notes = sortNotes(notes, filters.sortBy)
//     console.log(notes)
//     const filteredNotes = notes.filter((note) => {
//         return note.title.toLowerCase().includes(filters.searchText.toLowerCase())
//     })

//     document.querySelector("#notes").innerHTML = ''

//     filteredNotes.forEach((note) => {
//         const noteEl =  generateNoteDOM(note)       
//         document.querySelector('#notes').appendChild(noteEl)
//     })
// }



// generate last edited msg
const generateLastEdited = (timestamp) => {
    return `Last edited ${moment(timestamp).fromNow()}`
}

const generateLastEditedTop = (timestamp) => {
    return `${moment(timestamp).fromNow()}`
}



export { generateLastEdited, generateLastEditedTop }