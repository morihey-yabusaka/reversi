var mainELm = null
var banElm = null
var masuElms = new Array(8)
for(var i=0; i<8; i++) {
  masuElms[i] = new Array(8)
}
var turnELm = null

var stateElm = {
  "all": {},
  "black": {
    "text": null,
    "back": null
  },
  "white": {
    "text": null,
    "back": null
  }
}

var screenType = null

var turn = true // true: sente(black)

var nKoma = 4
var nWhite = 2
var nBlack = 2

var ban = [
  [2,2,2,2,2,2,2,2],
  [2,2,2,2,2,2,2,2],
  [2,2,2,2,2,2,2,2],
  [2,2,2,2,2,2,2,2],
  [2,2,2,2,2,2,2,2],
  [2,2,2,2,2,2,2,2],
  [2,2,2,2,2,2,2,2],
  [2,2,2,2,2,2,2,2]
]
var historyArr = []
var nBack = 0

var canPlaceMasues = null

function placeBan(color, i, j) {
  ban[i][j] = color
}

function reverseBan(i, j) {
  ban[i][j] = !ban[i][j]
}

function createElm(className = null, tag = "div") {
  var elm = document.createElement(tag)
  if(className) elm.classList.add(className)
  return elm
}

function createMasuElms() {
  for (var i = 0; i < 8; i++) {
    for(var j = 0; j < 8; j++) {
      let masu = createElm("masu")
      banElm.appendChild(masu)
      masuElms[i][j] = masu
      masu.setAttribute("row", i)
      masu.setAttribute("col", j)
      masu.addEventListener("click", (e) => {
        if(isCan(e.target)) {
          place(e.target)
        }
      })
    }
  }
}

function createKomaElm(color) {
  var koma = createElm("koma")
  koma.classList.add(color)
  return koma
}

function updateStateElm() {
  stateElm.black.text.textContent = nBlack
  stateElm.white.text.textContent = nWhite
  stateElm.black.back.style.height = nBlack / 64 * 100 + "%"
  stateElm.white.back.style.height = nWhite / 64 * 100 + "%"
  stateElm.all.style.width = nBlack / nKoma * 100 + "%"
}

function getScreenType() {
  var width = document.body.clientWidth
  var height = document.documentElement.clientHeight
  var ratio = width / height
  if (ratio < 0.7) {
    screenType = "tate"
  } else if (1.3 < ratio) {
    screenType = "yoko"
  } else {
    screenType = "seiho"
  }
}

function turnPlayer() {
  unsetCan()
  turn = !turn
  turnELm.classList.toggle("white")
  turnELm.classList.toggle("black")
  checkAllCanPlace()
  setCan()
}

function pass() {
  var passELm = createElm("pass")
  if(turn) {
    passELm.classList.add("black")
  } else {
    passELm.classList.add("white")
  }
  var text = createElm("text")
  text.textContent = "PASS"
  passELm.appendChild(text)
  passELm.addEventListener("animationend", (e) => {
    e.target.remove()
  })
  var main = document.querySelector(".main")
  main.appendChild(passELm)
}

function place(masuElm) {
  backElm.classList.remove("off")
  nextElm.classList.add("off")
  historyArr.push(JSON.parse(JSON.stringify(ban)))
  historyArr.splice(historyArr.length-nBack, nBack)
  nBack = 0
  let koma = createKomaElm(turn ? "black" : "white")
  masuElm.appendChild(koma)
  nKoma += 1
  if(turn) {
    nBlack += 1
  } else {
    nWhite += 1
  }
  var i = masuElm.getAttribute("row")
  var j = masuElm.getAttribute("col")
  placeBan(turn, parseInt(i), parseInt(j))
  reverse(masuElm, parseInt(i), parseInt(j))
  updateStateElm()
  turnPlayer()
  if(nKoma == 64 || nKoma == nBlack || nKoma == nWhite) {
    console.log("finish");
  } else if(canPlaceMasues.length == 0) {
    turnPlayer()
    if(canPlaceMasues.length == 0) {
      console.log("finish");
    } else {
      pass()
    }
  }
}

function reverseKoma(koma) {
  if(turn) {
    nBlack += 1
    nWhite -= 1
  } else {
    nWhite += 1
    nBlack -= 1
  }
  koma.classList.toggle("white")
  koma.classList.toggle("black")
}

function reverseMasu(masu) {
  reverseKoma(masu.querySelector(".koma"))
  var i = parseInt(masu.getAttribute("row"))
  var j = parseInt(masu.getAttribute("col"))
  reverseBan(i,j)
}

function reverseToEdge(masu, i, j, i_d, j_d) {
  i += i_d
  j += j_d
  var masues = []
  var flag = false
  while (isInBan(i,j)) {
    let _masu = masuElms[i][j]
    if (!hasKoma(_masu)) {
      break
    } else if (hasBlack(masu) == hasBlack(_masu)) {
      flag = true
      break
    }
    masues.push(_masu)
    i += i_d
    j += j_d
  }
  if (flag) {
    masues.forEach(m => {
      reverseMasu(m)
    })
  }
}

function reverse(masu, i, j) {
  for(var k=-1; k<=1; k++) {
    for(var l=-1; l<=1; l++) {
      if(k == 0 && l == 0) continue
      if(isInBan(i+k, j+l)) {
        var _masu = masuElms[i+k][j+l]
        if(hasKoma(_masu)) {
          if (hasBlack(masu) != hasBlack(_masu)) {
            reverseToEdge(masu, i, j, k, l)
          }
        }
      }
    }
  }
}

function isInBan(row, col) {
  return (0 <= row && row < 8) && (0 <= col && col < 8)
}

function isCan(masuElm) {
  return masuElm.classList.contains("can")
}

function hasKoma(masuElm) {
  return masuElm.querySelector(".koma") != null
}

function hasBlack(masuElm) {
  return masuElm.querySelector(".black") != null
}

function checkToEdge(masu, i, j, i_d, j_d) {
  i += i_d * 2
  j += j_d * 2
  while(isInBan(i,j)) {
    if(hasKoma(masuElms[i][j])) {
      if(hasBlack(masu) == hasBlack(masuElms[i][j])) return null
    }
    if(!hasKoma(masuElms[i][j])) return [i,j]
    i += i_d
    j += j_d
  }
  return null
}

function checkCanPlace(masu, i, j) {
  var masues = []
  for(var k=-1; k<=1; k++) {
    for(var l=-1; l<=1; l++) {
      if(k == 0 && l == 0) continue
      if(isInBan(i+k, j+l)) {
        var _masu = masuElms[i+k][j+l]
        if(hasKoma(_masu)) {
          if(hasBlack(masu) != hasBlack(_masu)) {
            var m = checkToEdge(masu, i, j, k, l)
            if(m) {
              masues.push(m)
            }
          }
        }
      }
    }
  }
  return masues
}

function checkAllCanPlace() {
  var masues = []
  for(var i=0; i<8; i++) {
    for(var j=0; j<8; j++) {
      var masu = masuElms[i][j]
      if(hasKoma(masu)) {
        if(hasBlack(masu) == turn) {
          masues.push(...checkCanPlace(masu, i, j))
        }
      }
    }
  }
  canPlaceMasues = masues
}

function setCan() {
  canPlaceMasues.forEach(masu => {
    if(masu) {
      masuElms[masu[0]][masu[1]].classList.add("can")
    }
  })
}

function unsetCan() {
  canPlaceMasues.forEach(masu => {
    if(masu) {
      masuElms[masu[0]][masu[1]].classList.remove("can")
    }
  })
}

function clearBanView() {
  for(var i=0; i<8; i++) {
    for(var j=0; j<8; j++) {
      masuElms[i][j].innerHTML = ""
    }
  }
  unsetCan()
}

function initBanView() {
  for(var i=3; i<=4; i++) {
    for(var j=3; j<=4; j++) {
      var color = (i+j) % 2 == 0 ? "white" : "black"
      var koma = createKomaElm(color)
      masuElms[i][j].appendChild(koma)
      placeBan((i+j) % 2 != 0, i, j)
    }
  }
  checkAllCanPlace()
  setCan()
}

function resetBanView() {
  clearBanView()
  initBanView()
}

function initGame() {
  turn = true
  nKoma = 4
  nWhite = 2
  nBlack = 2
  historyArr = []
  nBack = 0
  ban = [
    [2,2,2,2,2,2,2,2],
    [2,2,2,2,2,2,2,2],
    [2,2,2,2,2,2,2,2],
    [2,2,2,2,2,2,2,2],
    [2,2,2,2,2,2,2,2],
    [2,2,2,2,2,2,2,2],
    [2,2,2,2,2,2,2,2],
    [2,2,2,2,2,2,2,2]
  ]
}

function resetStateView() {
}

function resetView() {
  backElm.classList.add("off")
  nextElm.classList.add("off")
  turnELm.classList.add("black")
  turnELm.classList.remove("white")
  resetStateView()
}

function resetGame() {
  clearBanView()
  initGame()
  initBanView()
  resetView()
}

var toggleELm = null
var theme = null
function toggleTheme() {
  if(!toggleELm) {
    toggleELm = document.querySelector(".theme .toggle")
    theme = true
  }
  if(theme) {
    mainELm.classList.add("dark")
  } else {
    mainELm.classList.remove("dark")
  }
  theme = !theme
}

var backElm = null
var nextElm = null

var latestBan = null

function banView(_ban) {
  clearBanView()
  ban = _ban
  for(var i=0; i<8; i++) {
    for(var j=0; j<8; j++) {
      var koma = _ban[i][j]
      if(koma != 2) {
        let komaELm = createKomaElm(koma ? "black" : "white")
        masuElms[i][j].appendChild(komaELm)
      }
    }
  }
}

function historyView(n) {
  banView(historyArr[n])
}

function next() {
  if(nBack != 0) {
    nBack -= 1
    console.log(historyArr.length, nBack);
    if(nBack == 0) {
      banView(latestBan)
      latestBan = null
    } else {
      historyView(historyArr.length - nBack)
    }
    turnPlayer()
    if(nBack == 0) {
      nextElm.classList.add("off")
    }
    backElm.classList.remove("off")
  }
}

function back() { //matta
  if(!(historyArr.length == 0 || historyArr.length == nBack)){
    // nBack = Math.min(historyArr.length, nBack)
    if (nBack == 0) {
      latestBan = ban
    }
    nBack += 1
    historyView(historyArr.length - nBack)
    turnPlayer()
    if(historyArr.length == nBack) {
      backElm.classList.add("off")
    }
    nextElm.classList.remove("off")
  }
}

function initElm() {
  mainELm = document.querySelector(".main")
  getScreenType()
  mainELm.classList.add(screenType)
  banElm = document.querySelector(".ban")
  if(screenType == "seiho") {
    var height = banElm.clientHeight
    banElm.parentElement.style.width = height + "px"
  }
  turnELm = document.querySelector(".turn")
  turnELm.classList.add("black")
  backElm = document.querySelector(".button.back")
  backElm.classList.add("off")
  nextElm = document.querySelector(".button.next")
  nextElm.classList.add("off")
  stateElm.black.text = document.querySelector(".state .black .text")
  stateElm.black.back = document.querySelector(".state .black .back")
  stateElm.white.text = document.querySelector(".state .white .text")
  stateElm.white.back = document.querySelector(".state .white .back")
  stateElm.all = document.querySelector(".state .all .back")
}

window.addEventListener("DOMContentLoaded", _ => {
  initElm()
  createMasuElms()
  initBanView()
})

window.addEventListener("resize", _ => {
  var beforeScreenType = screenType
  getScreenType()
  if(screenType != beforeScreenType) {
    mainELm.classList.add(screenType)
    mainELm.classList.remove(beforeScreenType)
  }
  if(screenType == "seiho") {
    var height = banElm.clientHeight
    banElm.parentElement.style.width = height + "px"
  } else {
    banElm.parentElement.style.width = ""
  }
})