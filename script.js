const gameHTML = document.getElementsByClassName('game')[0]
const boardHTML = document.getElementsByClassName('board')[0]
const madeWordsHTML = document.getElementsByClassName('made_words')[0]
const messagesHTML = document.getElementsByClassName('messages')[0]
const pointerHTML = document.getElementsByClassName('pointer')[0]
const letterChooseHTML = document.getElementsByClassName('choosing_letter_for_star')[0]
const bonusCoords = [
    [3,11,36,38,45,52,59,92,96,98,102,108,116,122,126,128,132,165,172,179,186,188,213,221], //double letter
    [20,24,76,88,136,148,200,204], //triple letter
    [16,28,32,42,48,56,64,70,154,160,168,176,182,192,196,208], //double word
    [0,7,14,105,119,210,217,224] //triple word
]
const bonusColors = [
    '#A7BA75', '#E5D27E', '#A7BCCA', '#E57D6F'
]

let boardArray = []; for(let c=0; c<225; c++) boardArray.push(' ')
let usedWords = []
let myScore = 0
let changedTiles = []

for(let x=0;x<15;x++){
    for(let y=0;y<15;y++){
        let cell = document.createElement('div')
        cell.className = 'cell'
        cell.style.position = 'absolute'
        cell.style.left = x*32+6
        cell.style.top = y*32+6
        for(let i=0;i<4;i++){
            if(bonusCoords[i].includes(x+y*15)){
            cell.style.backgroundColor = bonusColors[i]
        }}
        boardHTML.appendChild(cell);
    }
}

const alpha  = 'абвгдежзийклмнопрстуфхцчшщъыьэюя*'.split('')
const point  = [1,3,1,3,2,1,5,5,1,4,2,2,2,1, 1,2,1,1,1,2,8,5,5,5,8,10,15,4,3,8,8,3]
const amount = [8,2,4,2,4,9,1,2,6,1,4,4,3,5,10,4,5,5,5,4,1,1,1,1,1, 1, 1,2,2,1,1,2,3]

for(let l=0;l<point.length;l++){
    letterChooseHTML.getElementsByClassName('tile')[l].addEventListener('click', function(){chooseLetter(alpha[l])}, false)
}

function dragElement(tile) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(tile.element.id + "header")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(tile.element.id + "header").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        tile.element.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        tile.previousX = tile.element.style.left
        tile.previousY = tile.element.style.top
        tile.element.style.zIndex = '400'
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        if(!tile.onBoard){
            removeLetterFromStar(tile.element)
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            tile.element.style.left = (tile.element.offsetLeft - pos1) + "px";
            tile.element.style.top = (tile.element.offsetTop - pos2) + "px";
        }
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
        tile.element.style.zIndex = 'auto'
        if(parseInt(tile.element.style.left.slice(0,-2)) > 296) {
            tile.element.style.left = Math.floor((tile.element.offsetLeft - pos1 - 25)/32+.5)*32+25 + "px";
            tile.element.style.top = Math.floor((tile.element.offsetTop - pos2 - 13)/32+.5)*32+13 + "px";
            
            for(let t=0;t<myTiles.length;t++){
                if(myTiles[t].element.style.left == tile.element.style.left
                && myTiles[t].element.style.top == tile.element.style.top
                && myTiles[t]!=tile){
                    removeLetterFromStar(myTiles[t].element)
                    myTiles[t].element.style.left = tile.previousX
                    myTiles[t].element.style.top  = tile.previousY
                }
            }
            for(let t=0;t<boardTiles.length;t++){
                if(boardTiles[t].element.style.left == tile.element.style.left
                && boardTiles[t].element.style.top == tile.element.style.top){
                    tile.element.style.left = tile.previousX
                    tile.element.style.top = tile.previousY
                    if(tile.element.getElementsByClassName('letter')[0].innerText == 
                    boardTiles[t].element.getElementsByClassName('letter')[0].innerText){
                        let style = boardTiles[t].element.style
                        let x = (parseInt(style.left.slice(0,-2))-313)/32
                        let y = (parseInt(style.top.slice(0,-2))-13)/32
                        changedTiles.push(x+y*15)
                        boardTiles[t].element.innerHTML = tile.element.innerHTML
                        tile.element.innerHTML = `<div class="star"> <img src="star.svg" width="20" height="20" ></img><div class="letter star_letter"></div></div>`
                    }
                }
            }
        }
    }
}


class Tile{
    element = undefined;
    constructor(x, y, letter, onBoard=false){
        let tileIndex = alpha.indexOf(letter)
        this.onBoard = onBoard;
        this.previousX =  x.toString()+'px'
        this.previousY =  y.toString()+'px'
        this.element = document.createElement('div')
        this.element.className = 'tile'
        this.element.innerHTML = tileIndex<32 ? `<div class="letter">${alpha[tileIndex]}</div> <div class="point">${point[tileIndex]}</div>` : `<div class="star"> <img src="star.svg" width="20" height="20" ></img><div class="letter star_letter"></div></div>`
        this.element.style.position = 'absolute'
        if(!onBoard) this.element.style.cursor = 'move'
        this.element.style.left = x.toString()+'px'
        this.element.style.top = y.toString()+'px'
        gameHTML.appendChild(this.element);
        dragElement(this);
    }

    destroy(){
        this.element.remove()
    }
}

let currentAmount = [...amount]
let myTiles = []
let boardTiles = []
takeTilesForRack()

function takeTilesForRack(){
    changedTiles = []
    for(t=0;t<myTiles.length;t++){
        myTiles[t].element.style.left=93+t*30
        myTiles[t].element.style.top=375
    }
    while(myTiles.length<7){
        let tilesLeft = 0
        for(let i=0;i<amount.length;i++){
            tilesLeft+=currentAmount[i]
        } 
        if(tilesLeft>0){
            let randomTile = Math.floor(Math.random()*tilesLeft)
            let tileIndex=0
            while(randomTile>=currentAmount[tileIndex]){
                randomTile-=currentAmount[tileIndex]
                tileIndex++
            }
            myTiles.push(new Tile(93+myTiles.length*30,375,alpha[tileIndex]))
            currentAmount[tileIndex]--;
            tilesLeft--
        }else{
            break
        }
        tilesLeftString = getPuralWord(['фишка','фишки','фишек'],tilesLeft).split(' ')
        tilesLeftString[0] = `<big_number>${tilesLeftString[0]}</big_number>`
        tilesLeftString = tilesLeftString.join('<br>')
        document.getElementsByClassName('tiles_box_inner')[0].innerHTML = tilesLeftString
    }
}


function declareStar(element){
    
    let x = parseInt(element.style.left.slice(0,-2)) - 313
    let y = parseInt(element.style.top.slice(0,-2)) - 13
    pointerHTML.style.left = 307+x
    pointerHTML.style.top = 7+y
    pointerHTML.style.visibility = 'visible'
    letterChooseHTML.style.left = Math.min(parseInt(pointerHTML.style.left.slice(0,-2))-156,448)
    letterChooseHTML.style.top = parseInt(pointerHTML.style.top.slice(0,-2))+47
    if(parseInt(letterChooseHTML.style.top.slice(0,-2)) > 420)
    letterChooseHTML.style.top = parseInt(pointerHTML.style.top.slice(0,-2))-108
    letterChooseHTML.style.visibility  = 'visible'
}

function removeLetterFromStar(element){
    if(element.innerHTML.includes('star_with_letter')) {
        element.innerHTML = `<div class="star"> <img src="star.svg" width="20" height="20"><div class="letter star_letter"></div></div>`
    }
}

document.getElementById('clear_button').onclick = function(){
    for(t=0;t<myTiles.length;t++){
        myTiles[t].element.style.left=93+t*30
        myTiles[t].element.style.top=375
        removeLetterFromStar(myTiles[t].element)
        if(myTiles[t].element.innerHTML.includes('<div class="star">')){
            for(t2=0;t2<boardTiles.length;t2++){
                let x = (parseInt(boardTiles[t2].element.style.left.slice(0,-2))-313)/32
                let y = (parseInt(boardTiles[t2].element.style.top.slice(0,-2))-13)/32
                if(changedTiles.includes(x+y*15)){
                    myTiles[t].element.innerHTML = boardTiles[t2].element.innerHTML
                    boardTiles[t2].element.innerHTML = `<div class="star_with_letter"> <img src="star.svg"><div class="letter star_letter">${myTiles[t].element.getElementsByClassName('letter')[0].innerText}</div></div>`
                }
            }
        }
    }
    changedTiles = []
}

function findStars(){
    starsToDeclare = []
    for(t=0;t<myTiles.length;t++){
        if(parseInt(myTiles[t].element.style.left.slice(0,-2))>296){
            let letter = myTiles[t].element.getElementsByClassName('letter')[0].innerText
            if(letter=='') {
                starsToDeclare.push(myTiles[t].element)
            }
        }
    }
    if(starsToDeclare.length==0) {
        if(buttonPressed=='send')
            sendButton2()
        else if(buttonPressed=='check')
            checkButton2()
    } else {
        declareStar(starsToDeclare[0])
    }
}

let buttonPressed = ''

function chooseLetter(letter){
    //element.getElementsByClassName('letter')[0].innerText=letter
    starsToDeclare[0].innerHTML=`<div class="star_with_letter"> <img src="star.svg"><div class="letter star_letter">${letter}</div></div>`
    pointerHTML.style.visibility        = 'hidden'
    letterChooseHTML.style.visibility   = 'hidden'
    
    starsToDeclare.shift();
    if(starsToDeclare.length==0) {
        if(buttonPressed=='send')
            sendButton2()
        else if(buttonPressed=='check')
            checkButton2()
    } else {
        declareStar(starsToDeclare[0])
    }
}

function sendAnswer(){
    for(let t=6;t>=0;t--){
        if(parseInt(myTiles[t].element.style.left.slice(0,-2))>296){
            myTiles[t].onBoard = true
            myTiles[t].element.style.cursor = 'auto';
            boardTiles.push(myTiles[t])
            myTiles.splice(t,1)
        }
    }
    takeTilesForRack()
}

document.getElementById('send_button').onclick = function(){
    buttonPressed = 'send'
    findStars()
}

function sendButton2(){
    let newBoardArray = [...boardArray]
    let newBoardTiles = []
    for(t=0;t<myTiles.length;t++){
        if(parseInt(myTiles[t].element.style.left.slice(0,-2))>296){
            let x = (parseInt(myTiles[t].element.style.left.slice(0,-2))-313)/32
            let y = (parseInt(myTiles[t].element.style.top.slice(0,-2))-13)/32
            let letter = myTiles[t].element.getElementsByClassName('letter')[0].innerText
            if(letter!='') {
                newBoardArray[x+y*15] = myTiles[t].element.getElementsByClassName('letter')[0].innerText
                newBoardTiles.push(x+y*15)
            }
        }
    }
    let allTilesConnected = true
    if(newBoardArray[112]!=' '){
        for(let c=0;c<225;c++){
            if(newBoardArray[c]!=' '){
                let connected = false
                if(c>=15    && newBoardArray[c-15]!=' ') connected = true
                if(c%15!=0  && newBoardArray[c- 1]!=' ') connected = true
                if(c<=210   && newBoardArray[c+15]!=' ') connected = true
                if(c%15!=14 && newBoardArray[c+ 1]!=' ') connected = true
                if(!connected){
                    allTilesConnected = false
                    break
                }
            }
        }
    }else{
        allTilesConnected = false
    }
    if(allTilesConnected){
        let wordsAndCoords = []
        let areAllWordsValid = true
        let wordsNotFound = []
        for(t=0;areAllWordsValid && t<newBoardTiles.length;t++){
            // x
            let word = newBoardArray[newBoardTiles[t]]
            let offset = 1
            let coords = [newBoardTiles[t]] 
            while(newBoardArray[newBoardTiles[t]-offset]!=' ' && (newBoardTiles[t]-offset)%15!=14){
                word = newBoardArray[newBoardTiles[t]-offset] + word
                coords.unshift(newBoardTiles[t]-offset)
                offset++
            }
            offset = 1
            while(newBoardArray[newBoardTiles[t]+offset]!=' ' && (newBoardTiles[t]+offset)%15!=0){
                word = word + newBoardArray[newBoardTiles[t]+offset]
                coords.push(newBoardTiles[t]+offset)
                offset++
            }
            if(word.length>1){
                let wordIndex = wordList.map(_w => {while(_w.includes('ё')) _w=_w.replace('ё','е'); return _w;}).indexOf(word)
                if(wordIndex!=-1){
                    let wordAndCoord = [wordList[wordIndex], coords[0], coords[1]-coords[0]];
                    if(!wordsAndCoords.map(a => JSON.stringify(a)).includes(JSON.stringify(wordAndCoord))){
                        wordsAndCoords.push(wordAndCoord)
                    }
                } else {
                    areAllWordsValid = false
                    wordsNotFound.push(word)
                }
            }
            // y
            word = newBoardArray[newBoardTiles[t]]
            offset = 1
            coords = [newBoardTiles[t]] 
            while(newBoardArray[newBoardTiles[t]-offset*15]!=' ' && newBoardTiles[t]-offset*15>0){
                word = newBoardArray[newBoardTiles[t]-offset*15] + word
                coords.unshift(newBoardTiles[t]-offset*15)
                offset++
            }
            offset = 1
            while(newBoardArray[newBoardTiles[t]+offset*15]!=' ' && newBoardTiles[t]+offset*15<225){
                word = word + newBoardArray[newBoardTiles[t]+offset*15]
                coords.push(newBoardTiles[t]+offset*15)
                offset++
            }
            if(word.length>1){
                let wordIndex = wordList.map(_w => {while(_w.includes('ё')) _w=_w.replace('ё','е'); return _w; }).indexOf(word)
                if(wordIndex!=-1){
                    let wordAndCoord = [wordList[wordIndex], coords[0], coords[1]-coords[0]];
                    if(!wordsAndCoords.map(a => JSON.stringify(a)).includes(JSON.stringify(wordAndCoord))){
                        wordsAndCoords.push(wordAndCoord)
                    }
                } else {
                    areAllWordsValid = false
                    wordsNotFound.push(word)
                }
            }
            if(wordsNotFound.length>0)
                showMessage(`<words_not_found>${getPuralWord(['слово','слова','слов'], wordsNotFound.length)} не найдено в словаре:</words_not_found><br><invalid_words>${wordsNotFound.map(_w => capitalizeFirstLetter(_w)).join('<br>')}</invalid_words>`)
        }
        if(areAllWordsValid) {
            let points = 0
            let wordsAndPoints = []
            for(w=0;w<wordsAndCoords.length;w++){
                let wordPoints = 0
                let wordMultiplier = 1
                for(let l=0; l<wordsAndCoords[w][0].length; l++){
                    let letterMultiplier = 1
                         if(bonusCoords[0].includes(wordsAndCoords[w][1]+wordsAndCoords[w][2]*l)) letterMultiplier *= 2
                    else if(bonusCoords[1].includes(wordsAndCoords[w][1]+wordsAndCoords[w][2]*l)) letterMultiplier *= 3
                    else if(bonusCoords[2].includes(wordsAndCoords[w][1]+wordsAndCoords[w][2]*l)) wordMultiplier *= 2
                    else if(bonusCoords[3].includes(wordsAndCoords[w][1]+wordsAndCoords[w][2]*l)) wordMultiplier *= 3
                    let letter = wordsAndCoords[w][0][l]
                    if(letter=='ё') letter='е'
                    wordPoints += point[alpha.indexOf(letter)] * letterMultiplier
                }
                wordPoints *= wordMultiplier
                let wordAndPointIndex = wordsAndPoints.map(w => w[0]).indexOf(wordsAndCoords[w][0])
                if(wordAndPointIndex==-1) {
                    wordsAndPoints.push([wordsAndCoords[w][0], wordPoints])
                    points += wordPoints
                } else {
                    points -= wordsAndPoints[wordAndPointIndex][1]
                    wordsAndPoints[wordAndPointIndex][1] = Math.max(wordsAndPoints[wordAndPointIndex][1], wordPoints)
                    points += wordsAndPoints[wordAndPointIndex][1]
                }
            }
            if(newBoardTiles.length==7){
                wordsAndPoints.push(['за все фишки', 15])
                points += 15
            }
            
            sendAnswer()
            boardArray = [...newBoardArray]
            myScore += points
            document.getElementsByClassName('your_score')[0].innerHTML = `Очки: <b>${myScore}</b>`
            for(let w=0; w<wordsAndPoints.length; w++){
                usedWords.push(wordsAndPoints[w][0])
                let row = document.getElementsByClassName('made_words_table')[0].insertRow()
                row.insertCell(0).innerHTML = w==0 ? 'P1': ''
                row.insertCell(1).innerHTML = wordsAndPoints[w][1]
                row.insertCell(2).innerHTML = capitalizeFirstLetter(wordsAndPoints[w][0])
            }
            madeWordsHTML.scrollTop = madeWordsHTML.scrollHeight
        }
    }
}

let starsToDeclare = []
document.getElementById('check_button').onclick = function(){
    buttonPressed = 'check'
    findStars()
}

function checkButton2(){
    let newBoardArray = [...boardArray]
    let newBoardTiles = []

    for(t=0;t<myTiles.length;t++){
        if(parseInt(myTiles[t].element.style.left.slice(0,-2))>296){
            let x = (parseInt(myTiles[t].element.style.left.slice(0,-2))-313)/32
            let y = (parseInt(myTiles[t].element.style.top.slice(0,-2))-13)/32
            let letter = myTiles[t].element.getElementsByClassName('letter')[0].innerText
            if(letter!='') {
                newBoardArray[x+y*15] = myTiles[t].element.getElementsByClassName('letter')[0].innerText
                newBoardTiles.push(x+y*15)
            }
        }
    }

    let allTilesConnected = true
    if(newBoardArray[112]!=' '){
        for(let c=0;c<225;c++){
            if(newBoardArray[c]!=' '){
                let connected = false
                if(c>=15    && newBoardArray[c-15]!=' ') connected = true
                if(c%15!=0  && newBoardArray[c- 1]!=' ') connected = true
                if(c<=210   && newBoardArray[c+15]!=' ') connected = true
                if(c%15!=14 && newBoardArray[c+ 1]!=' ') connected = true
                if(!connected){
                    allTilesConnected = false
                    break
                }
            }
        }
    }else{
        allTilesConnected = false
    }
    if(allTilesConnected){
        let wordsAndCoords = []
        let areAllWordsValid = true
        let wordsNotFound = []
        for(t=0;areAllWordsValid && t<newBoardTiles.length;t++){
            // x
            let word = newBoardArray[newBoardTiles[t]]
            let offset = 1
            let coords = [newBoardTiles[t]] 
            while(newBoardArray[newBoardTiles[t]-offset]!=' ' && (newBoardTiles[t]-offset)%15!=14){
                word = newBoardArray[newBoardTiles[t]-offset] + word
                coords.unshift(newBoardTiles[t]-offset)
                offset++
            }
            offset = 1
            while(newBoardArray[newBoardTiles[t]+offset]!=' ' && (newBoardTiles[t]+offset)%15!=0){
                word = word + newBoardArray[newBoardTiles[t]+offset]
                coords.push(newBoardTiles[t]+offset)
                offset++
            }
            if(word.length>1){
                let wordIndex = wordList.map(_w => {while(_w.includes('ё')) _w=_w.replace('ё','е'); return _w;}).indexOf(word)
                if(wordIndex!=-1){
                    let wordAndCoord = [wordList[wordIndex], coords[0], coords[1]-coords[0]];
                    if(!wordsAndCoords.map(a => JSON.stringify(a)).includes(JSON.stringify(wordAndCoord))){
                        wordsAndCoords.push(wordAndCoord)
                    }
                } else {
                    areAllWordsValid = false
                    wordsNotFound.push(word)
                }
            }
            // y
            word = newBoardArray[newBoardTiles[t]]
            offset = 1
            coords = [newBoardTiles[t]] 
            while(newBoardArray[newBoardTiles[t]-offset*15]!=' ' && newBoardTiles[t]-offset*15>0){
                word = newBoardArray[newBoardTiles[t]-offset*15] + word
                coords.unshift(newBoardTiles[t]-offset*15)
                offset++
            }
            offset = 1
            while(newBoardArray[newBoardTiles[t]+offset*15]!=' ' && newBoardTiles[t]+offset*15<225){
                word = word + newBoardArray[newBoardTiles[t]+offset*15]
                coords.push(newBoardTiles[t]+offset*15)
                offset++
            }
            if(word.length>1){
                let wordIndex = wordList.map(_w => {while(_w.includes('ё')) _w=_w.replace('ё','е'); return _w; }).indexOf(word)
                if(wordIndex!=-1){
                    let wordAndCoord = [wordList[wordIndex], coords[0], coords[1]-coords[0]];
                    if(!wordsAndCoords.map(a => JSON.stringify(a)).includes(JSON.stringify(wordAndCoord))){
                        wordsAndCoords.push(wordAndCoord)
                    }
                } else {
                    areAllWordsValid = false
                    wordsNotFound.push(word)
                }
            }
            if(wordsNotFound.length>0)
                showMessage(`<words_not_found>${getPuralWord(['слово','слова','слов'], wordsNotFound.length)} не найдено в словаре:</words_not_found><br><invalid_words>${wordsNotFound.map(_w => capitalizeFirstLetter(_w)).join('<br>')}</invalid_words>`)
        }
        if(areAllWordsValid) {
            let points = 0
            let wordsAndPoints = []
            for(w=0;w<wordsAndCoords.length;w++){
                let wordPoints = 0
                let wordMultiplier = 1
                for(let l=0; l<wordsAndCoords[w][0].length; l++){
                    let letterMultiplier = 1
                         if(bonusCoords[0].includes(wordsAndCoords[w][1]+wordsAndCoords[w][2]*l)) letterMultiplier *= 2
                    else if(bonusCoords[1].includes(wordsAndCoords[w][1]+wordsAndCoords[w][2]*l)) letterMultiplier *= 3
                    else if(bonusCoords[2].includes(wordsAndCoords[w][1]+wordsAndCoords[w][2]*l)) wordMultiplier *= 2
                    else if(bonusCoords[3].includes(wordsAndCoords[w][1]+wordsAndCoords[w][2]*l)) wordMultiplier *= 3
                    let letter = wordsAndCoords[w][0][l]
                    if(letter=='ё') letter='е'
                    wordPoints += point[alpha.indexOf(letter)] * letterMultiplier
                }
                wordPoints *= wordMultiplier
                let wordAndPointIndex = wordsAndPoints.map(w => w[0]).indexOf(wordsAndCoords[w][0])
                if(wordAndPointIndex==-1) {
                    wordsAndPoints.push([wordsAndCoords[w][0], wordPoints])
                    points += wordPoints
                } else {
                    points -= wordsAndPoints[wordAndPointIndex][1]
                    wordsAndPoints[wordAndPointIndex][1] = Math.max(wordsAndPoints[wordAndPointIndex][1], wordPoints)
                    points += wordsAndPoints[wordAndPointIndex][1]
                }
            }
            if(newBoardTiles.length==7){
                wordsAndPoints.push(['за все фишки', 15])
                points += 15
            }

            showMessage(`<move_gives_points>Этот ход даст вам ${getPuralWord(['очко','очка','очков'], points)}</move_gives_points>`)
        }
    }
}

function getPuralWord(words, number){
    let column = 2
    if(number%100<5 || number%100>20){
        if(number%10==1){
            column = 0
        }else if(number%10>1 && number%10<5){
            column = 1
        }  
    }
    return `${number} ${words[column]}`
}

function capitalizeFirstLetter(word){
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function showMessage(message){
    let element = document.createElement('div')
    element.className = 'message'
    element.innerHTML = message+'<a class="close_button">Закрыть</a>'
    element.style.zIndex = '800'
    element.getElementsByClassName('close_button')[0].addEventListener('click', function(){closeMessage(element)}, false)
    messagesHTML.appendChild(element)
}

function closeMessage(element){
    element.remove()
}

class Game{
    constructor(players, scoreTarget=200){
        this.players = players
        this.scoreTarget = scoreTarget
        this.playerTiles = []; for(let p=0;p<this.players.length;p++) this.playerTiles[p]=[]
        this.score = []; for(let p=0;p<this.players.length;p++) this.score[p] = 0
        this.board = []; for(let c=0;c<225;c++) this.board[c]=' '
        this.starCells = []
        this.usedWords = []
        this.playerTurn = 0
        this.timer = 120
    }

    open(curretPlayerIndex=0){
        for(let t=0;t<boardTiles.length;t++) boardTiles[t].destroy()
        for(let t=0;t<myTiles.length;t++) myTiles[t].destroy()
        for(let c=0;c<225;c++) {
            if(this.board[c]!=' '){
                if(!this.starCells.includes(c)){
                    let x = c%15
                    let y = (c-c%15)/15
                    boardTiles.push(new Tile(313+32*x,13+32*y, board[c]), true)
                }else{
                    declareStar(myTiles[t].element)
                }
            }
        }
        let currentPlayerTiles = playerTiles[curretPlayerIndex]
        for(let t=0;t<currentPlayerTiles;t++){
            myTiles.push(new Tile(93+myTiles.length*30,375,currentPlayerTiles[t]))
        }
    }
}

class Player{
    constructor(name, chips, avatar='noPhotoPlayer.png'){
        this.name = name
        this.chips = chips
        this.avatar = avatar
    }
}