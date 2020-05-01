

//sort
const sortNotes = (notes, sortBy) => {
    if(sortBy === 'updatedAt'){
        return notes.sort( (a, b) => {
            if(a.note.updatedAt > b.note.updatedAt){
                return -1
            } else if(a.note.updatedAt < b.note.updatedAt){
                return 1
            } else {
                return 0
            }
        })
    } else if(sortBy === 'createdAt'){
        return notes.sort((a, b) =>{
            if(a.note.createdAt > b.note.createdAt){
                return -1
            } else if(a.note.createdAt < b.note.createdAt){
                return 1
            } else {
                return 0
            }
        })
    } else if(sortBy === 'title'){
        return notes.sort( (a, b) => {
            if(a.note.title.toLowerCase() < b.note.title.toLowerCase() ){
                return -1  // a comes first
            } else if(a.note.title.toLowerCase() > b.note.title.toLowerCase() ){
                return 1 // b comes first
            } else {
                return 0
            }
        })
    } else {
        return notes
    }
}




// generate last edited msg
const generateLastEdited = (timestamp) => {
    return `Last edited ${moment(timestamp).fromNow()}`
}

const generateLastEditedTop = (timestamp) => {
    return `${moment(timestamp).fromNow()}`
}



export { generateLastEdited, generateLastEditedTop ,sortNotes }